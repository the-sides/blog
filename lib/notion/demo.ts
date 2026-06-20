import type { BlogPost } from "./types";

export const demoPosts: BlogPost[] = [
  {
    id: "demo-programmable-notion",
    title: "Programmable Notion Pages",
    slug: "programmable-notion-pages",
    excerpt:
      "A working sample that turns Notion paragraphs into shortcode-powered React islands.",
    author: "Demo notebook",
    publishedAt: "2026-06-20",
    coverUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    blocks: [
      paragraph("The page starts as ordinary Notion content. The renderer keeps paragraphs, headings, lists, images, callouts, and code blocks as content."),
      heading("The shortcode block contract", 2),
      paragraph("A paragraph that contains only a shortcode marker is removed from prose and resolved through the component registry."),
      paragraph("[Aside title=\"Custom code lives here\" tone=\"green\"]"),
      paragraph("Everything between the opening and closing tags is rendered first as Notion content, then passed to the component as children."),
      bullet("Write in Notion."),
      bullet("Register the component in code."),
      bullet("Use the shortcode exactly where it belongs in the story."),
      paragraph("[/Aside]"),
      paragraph("Self-closing shortcodes inject a component between blocks."),
      paragraph("[NewsletterSignup eyebrow=\"Dispatch\" /]"),
      heading("Page-specific wrappers", 2),
      paragraph("[Comparison leftTitle=\"Plain Notion\" rightTitle=\"With React\"]"),
      paragraph("Left and right labels are props. The middle stays editable in Notion."),
      paragraph("[/Comparison]"),
      quote("This gives you a CMS for words and a codebase for moments where words are not enough."),
      code("export function CustomChart({ children }) {\n  return <section>{children}</section>;\n}", "tsx"),
    ],
  },
  {
    id: "demo-notion-schema",
    title: "The Notion Schema I Would Start With",
    slug: "notion-schema",
    excerpt:
      "A small publishing schema for slugs, excerpts, status, authors, and dates.",
    author: "Demo notebook",
    publishedAt: "2026-06-19",
    coverUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    blocks: [
      paragraph("Give your data source a title, slug, status, excerpt, author, and published date. Those properties map directly into the route, metadata, and index cards."),
      paragraph("[Note title=\"Publishing rule\"]"),
      paragraph("Only pages with Status set to Published are meant for the public blog. If your data source does not have that property yet, the demo includes all pages so setup is forgiving."),
      paragraph("[/Note]"),
    ],
  },
];

function paragraph(text: string) {
  return {
    object: "block" as const,
    id: crypto.randomUUID(),
    type: "paragraph",
    paragraph: {
      rich_text: [richText(text)],
      color: "default",
    },
  };
}

function heading(text: string, level: 1 | 2 | 3 | 4) {
  const type = `heading_${level}`;

  return {
    object: "block" as const,
    id: crypto.randomUUID(),
    type,
    [type]: {
      rich_text: [richText(text)],
      color: "default",
      is_toggleable: false,
    },
  };
}

function bullet(text: string) {
  return {
    object: "block" as const,
    id: crypto.randomUUID(),
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [richText(text)],
      color: "default",
    },
  };
}

function quote(text: string) {
  return {
    object: "block" as const,
    id: crypto.randomUUID(),
    type: "quote",
    quote: {
      rich_text: [richText(text)],
      color: "default",
    },
  };
}

function code(text: string, language: string) {
  return {
    object: "block" as const,
    id: crypto.randomUUID(),
    type: "code",
    code: {
      rich_text: [richText(text)],
      language,
      caption: [],
    },
  };
}

function richText(content: string) {
  return {
    type: "text",
    plain_text: content,
    href: null,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
    text: {
      content,
      link: null,
    },
  };
}
