import {
  NOTION_API_VERSION,
  NOTION_AUTHOR_PROPERTY,
  NOTION_DATA_SOURCE_ID,
  NOTION_EXCERPT_PROPERTY,
  NOTION_PUBLISHED_PROPERTY,
  NOTION_PUBLISHED_STATUS,
  NOTION_REVALIDATE_SECONDS,
  NOTION_SLUG_PROPERTY,
  NOTION_STATUS_PROPERTY,
  NOTION_TITLE_PROPERTY,
  NOTION_TOKEN,
} from "astro:env/server";
import { demoPosts } from "./demo";
import type {
  BlogPost,
  BlogPostSummary,
  NotionBlock,
  NotionFile,
  NotionPage,
  NotionProperty,
  PaginatedList,
  RichText,
} from "./types";

const NOTION_API_BASE = "https://api.notion.com/v1";

const schema = {
  title: NOTION_TITLE_PROPERTY || "Title",
  slug: NOTION_SLUG_PROPERTY || "Slug",
  status: NOTION_STATUS_PROPERTY || "Status",
  publishedStatus: NOTION_PUBLISHED_STATUS || "Published",
  excerpt: NOTION_EXCERPT_PROPERTY || "Excerpt",
  author: NOTION_AUTHOR_PROPERTY || "Author",
  published: NOTION_PUBLISHED_PROPERTY || "Published",
};

export function hasNotionCredentials() {
  return Boolean(NOTION_TOKEN && NOTION_DATA_SOURCE_ID);
}

export async function getPublishedPosts(): Promise<BlogPostSummary[]> {
  if (!hasNotionCredentials()) {
    return demoPosts.map(stripBlocks);
  }

  const pages = await listDataSourcePages();

  return pages
    .map(pageToSummary)
    .filter(isPublished)
    .sort(sortNewestFirst);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!hasNotionCredentials()) {
    return demoPosts.find((post) => post.slug === slug) || null;
  }

  const pages = await listDataSourcePages();
  const page = pages.find((candidate) => pageToSummary(candidate).slug === slug);

  if (!page || !isPublished(pageToSummary(page))) {
    return null;
  }

  const blocks = await getBlockChildren(page.id);

  return {
    ...pageToSummary(page),
    blocks,
  };
}

async function listDataSourcePages() {
  const pages: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const response: PaginatedList<NotionPage> = await notionFetch(
      `/data_sources/${NOTION_DATA_SOURCE_ID}/query`,
      {
        method: "POST",
        body: JSON.stringify({
          page_size: 100,
          start_cursor: cursor ?? undefined,
        }),
      },
    );

    pages.push(...response.results.filter((page) => page.object === "page"));
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return pages;
}

async function getBlockChildren(
  blockId: string,
  visitedBlockIds = new Set<string>(),
): Promise<NotionBlock[]> {
  if (visitedBlockIds.has(blockId)) {
    return [];
  }

  const nextVisitedBlockIds = new Set(visitedBlockIds);
  nextVisitedBlockIds.add(blockId);

  const blocks: NotionBlock[] = [];
  let cursor: string | null = null;

  do {
    const searchParams = new URLSearchParams({ page_size: "100" });

    if (cursor) {
      searchParams.set("start_cursor", cursor);
    }

    const response = await notionFetch<PaginatedList<NotionBlock>>(
      `/blocks/${blockId}/children?${searchParams.toString()}`,
    );

    const hydrated = await Promise.all(
      response.results.map(async (block) => {
        const childBlockId = getBlockChildrenSourceId(block) || block.id;

        if (!block.has_children) {
          return block;
        }

        return {
          ...block,
          children: await getBlockChildren(childBlockId, nextVisitedBlockIds),
        };
      }),
    );

    blocks.push(...hydrated);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return blocks;
}

function getBlockChildrenSourceId(block: NotionBlock) {
  if (block.type !== "synced_block") {
    return null;
  }

  const syncedBlock = block.synced_block;

  if (!syncedBlock || typeof syncedBlock !== "object") {
    return null;
  }

  const syncedFrom = (syncedBlock as { synced_from?: unknown }).synced_from;

  if (!syncedFrom || typeof syncedFrom !== "object") {
    return null;
  }

  const blockId = (syncedFrom as { block_id?: unknown }).block_id;

  return typeof blockId === "string" ? blockId : null;
}

function notionFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = `${init.method || "GET"} ${path} ${init.body ?? ""}`;

  return withCache(key, async () => {
    const response = await fetch(`${NOTION_API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_API_VERSION || "2026-03-11",
        ...init.headers,
      },
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Notion API ${response.status}: ${detail}`);
    }

    return response.json() as Promise<T>;
  });
}

type CacheEntry = {
  expiresAt: number;
  response: Promise<unknown>;
};

const MAX_CACHE_ENTRIES = 64;
const responseCache = new Map<string, CacheEntry>();

// A short-lived memo in front of the Notion API, in the spirit of the framework
// fetch cache this used to lean on. It lives in the running instance rather than
// a shared store, so a cold start simply refetches. Storing the promise rather
// than the value also collapses the repeat calls a single render makes.
function withCache<T>(key: string, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.response as Promise<T>;
  }

  const response = load().catch((error: unknown) => {
    // Never let a failure stick around for the rest of the window.
    responseCache.delete(key);
    throw error;
  });

  responseCache.set(key, {
    expiresAt: now + getRevalidateSeconds() * 1000,
    response,
  });

  if (responseCache.size > MAX_CACHE_ENTRIES) {
    for (const [entryKey, entry] of responseCache) {
      if (entry.expiresAt <= now) {
        responseCache.delete(entryKey);
      }
    }
  }

  return response;
}

function getRevalidateSeconds() {
  const value = Number(NOTION_REVALIDATE_SECONDS || 300);
  return Number.isFinite(value) && value >= 0 ? value : 300;
}

function pageToSummary(page: NotionPage): BlogPostSummary {
  const title = propertyText(page.properties[schema.title]) || "Untitled";
  const slug = propertyText(page.properties[schema.slug]) || slugify(title);

  return {
    id: page.id,
    title,
    slug,
    excerpt: propertyText(page.properties[schema.excerpt]),
    status: propertyText(page.properties[schema.status]) || undefined,
    author: propertyText(page.properties[schema.author]) || undefined,
    publishedAt:
      page.properties[schema.published]?.date?.start || page.last_edited_time,
    coverUrl: fileUrl(page.cover) || undefined,
  };
}

function isPublished(post: BlogPostSummary) {
  if (!hasNotionCredentials()) {
    return true;
  }

  return !post.status || post.status === schema.publishedStatus;
}

function stripBlocks({ blocks: _blocks, ...summary }: BlogPost): BlogPostSummary {
  return summary;
}

function sortNewestFirst(a: BlogPostSummary, b: BlogPostSummary) {
  return Date.parse(b.publishedAt || "") - Date.parse(a.publishedAt || "");
}

function propertyText(property?: NotionProperty) {
  if (!property) {
    return "";
  }

  if (property.title) {
    return richTextPlain(property.title);
  }

  if (property.rich_text) {
    return richTextPlain(property.rich_text);
  }

  if (property.status?.name) {
    return property.status.name;
  }

  if (property.select?.name) {
    return property.select.name;
  }

  if (property.multi_select?.length) {
    return property.multi_select
      .map((item) => item.name)
      .filter(Boolean)
      .join(", ");
  }

  if (property.people?.length) {
    return property.people
      .map((person) => person.name)
      .filter(Boolean)
      .join(", ");
  }

  if (property.date?.start) {
    return property.date.start;
  }

  if (property.url) {
    return property.url;
  }

  if (property.email) {
    return property.email;
  }

  if (property.phone_number) {
    return property.phone_number;
  }

  if (typeof property.number === "number") {
    return String(property.number);
  }

  if (typeof property.checkbox === "boolean") {
    return property.checkbox ? "true" : "false";
  }

  return "";
}

function richTextPlain(value: RichText[]) {
  return value.map((part) => part.plain_text).join("");
}

function fileUrl(file?: NotionFile | null) {
  if (!file) {
    return "";
  }

  if (file.type === "external") {
    return file.external.url;
  }

  if (file.type === "file") {
    return file.file.url;
  }

  return "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
