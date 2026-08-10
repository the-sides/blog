import type { RenderNode } from "@/lib/shortcodes/parser";
import type { NotionBlock, RichText } from "./types";

// Notion hands back list items one block at a time; the renderer needs them
// grouped so a run of items becomes a single <ul>/<ol>. Blocks arrive with
// their shape already worked out, which keeps the template free of branching
// that would otherwise need local variables it cannot declare.
export type RenderItem =
  | {
      kind: "list";
      tag: "ul" | "ol";
      blocks: NotionBlock[];
    }
  | {
      kind: "block";
      view: BlockView;
    }
  | Exclude<RenderNode, { kind: "block" }>;

export function toRenderItems(nodes: RenderNode[]): RenderItem[] {
  const items: RenderItem[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    if (node.kind !== "block") {
      items.push(node);
      continue;
    }

    if (!isListType(node.block.type)) {
      items.push({ kind: "block", view: toBlockView(node.block) });
      continue;
    }

    const type = node.block.type;
    const blocks = [node.block];

    for (let next = nodes[index + 1]; isSameList(next, type); next = nodes[index + 1]) {
      index += 1;
      blocks.push(next.block);
    }

    items.push({
      kind: "list",
      tag: type === "numbered_list_item" ? "ol" : "ul",
      blocks,
    });
  }

  return items;
}

// The wrappers a text-shaped block can render as. Keeping it a literal union
// lets the template use it directly as a dynamic tag.
export type TextTag =
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "blockquote"
  | "aside"
  | "div";

// Every block boils down to one of a handful of shapes. Working them out here
// keeps the template a flat mapping from shape to markup.
export type BlockView =
  | {
      shape: "text";
      tag: TextTag;
      class?: string;
      richText?: RichText[];
      children?: NotionBlock[];
    }
  | {
      shape: "todo";
      checked: boolean;
      richText?: RichText[];
      children?: NotionBlock[];
    }
  | {
      shape: "divider";
    }
  | {
      shape: "code";
      text: string;
      language: string;
    }
  | {
      shape: "image";
      src: string;
      alt: string;
      caption?: RichText[];
    }
  | {
      shape: "bookmark";
      url: string;
      caption?: RichText[];
    }
  | {
      shape: "message";
      text: string;
    }
  | {
      shape: "skip";
    };

const HEADING_TAGS: Record<string, TextTag> = {
  heading_1: "h1",
  heading_2: "h2",
  heading_3: "h3",
  heading_4: "h4",
};

function toBlockView(block: NotionBlock): BlockView {
  const richText = getRichText(block);
  const children = block.children;

  switch (block.type) {
    case "paragraph":
    case "heading_1":
    case "heading_2":
    case "heading_3":
    case "heading_4": {
      const hasText = Boolean(richText?.some((part) => part.plain_text));

      if (!hasText && !children?.length) {
        return { shape: "skip" };
      }

      return {
        shape: "text",
        tag: HEADING_TAGS[block.type] || "p",
        richText,
        children,
      };
    }
    case "quote":
      return { shape: "text", tag: "blockquote", richText, children };
    case "callout":
      return {
        shape: "text",
        tag: "aside",
        class: "notion-callout",
        richText,
        children,
      };
    case "to_do": {
      const data = getTypeData<{ checked?: boolean }>(block);

      return {
        shape: "todo",
        checked: Boolean(data?.checked),
        richText,
        children,
      };
    }
    case "divider":
      return { shape: "divider" };
    case "code": {
      const data = getTypeData<{ rich_text?: RichText[]; language?: string }>(block);

      return {
        shape: "code",
        text: data?.rich_text?.map((part) => part.plain_text).join("") || "",
        language: data?.language || "plain text",
      };
    }
    case "image": {
      const data = getTypeData<{
        caption?: RichText[];
        external?: { url: string };
        file?: { url: string };
      }>(block);
      const src = data?.external?.url || data?.file?.url;

      if (!src) {
        return { shape: "skip" };
      }

      return {
        shape: "image",
        src,
        alt: data?.caption?.map((part) => part.plain_text).join("") || "",
        caption: data?.caption,
      };
    }
    case "bookmark":
    case "embed":
    case "link_preview": {
      const data = getTypeData<{ url?: string; caption?: RichText[] }>(block);

      if (!data?.url) {
        return { shape: "skip" };
      }

      return { shape: "bookmark", url: data.url, caption: data.caption };
    }
    case "unsupported":
      return { shape: "message", text: "Unsupported Notion block." };
    default:
      if (!richText?.length && !children?.length) {
        return { shape: "skip" };
      }

      return { shape: "text", tag: "div", richText, children };
  }
}

export function getRichText(block: NotionBlock): RichText[] | undefined {
  return getTypeData<{ rich_text?: RichText[] }>(block)?.rich_text;
}

function getTypeData<T>(block: NotionBlock): T | undefined {
  const value = block[block.type];
  return value && typeof value === "object" ? (value as T) : undefined;
}

function isListType(type: string) {
  return type === "bulleted_list_item" || type === "numbered_list_item";
}

function isSameList(
  node: RenderNode | undefined,
  type: string,
): node is { kind: "block"; block: NotionBlock } {
  return node?.kind === "block" && node.block.type === type;
}
