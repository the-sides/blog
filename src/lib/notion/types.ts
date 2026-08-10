export type RichText = {
  type: string;
  plain_text: string;
  href: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
  text?: {
    content?: string;
    link?: { url: string } | null;
  };
};

export type NotionBlock = {
  object: "block";
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  [key: string]: unknown;
};

export type NotionPage = {
  object: "page";
  id: string;
  created_time?: string;
  last_edited_time?: string;
  cover?: NotionFile | null;
  icon?: unknown;
  properties: Record<string, NotionProperty>;
  url?: string;
  public_url?: string | null;
};

export type NotionFile =
  | {
      type: "external";
      external: { url: string };
    }
  | {
      type: "file";
      file: { url: string; expiry_time?: string };
    }
  | {
      type: "file_upload";
      file_upload: { id: string };
    };

export type NotionProperty = {
  id?: string;
  type?: string;
  title?: RichText[];
  rich_text?: RichText[];
  status?: { name?: string } | null;
  select?: { name?: string } | null;
  multi_select?: Array<{ name?: string }>;
  date?: { start?: string; end?: string | null } | null;
  people?: Array<{ name?: string }>;
  checkbox?: boolean;
  number?: number | null;
  url?: string | null;
  email?: string | null;
  phone_number?: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status?: string;
  author?: string;
  publishedAt?: string;
  coverUrl?: string;
  blocks: NotionBlock[];
};

export type BlogPostSummary = Omit<BlogPost, "blocks">;

export type PaginatedList<T> = {
  object: "list";
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
};
