import { shortcodeRegistry } from "@/components/shortcodes/registry";
import { parseShortcodeNodes, type RenderNode } from "@/lib/shortcodes/parser";
import type { NotionBlock, NotionFile, RichText as RichTextPart } from "@/lib/notion/types";
import { RichText } from "./RichText";

export function NotionRenderer({ blocks }: { blocks: NotionBlock[] }) {
  return <div className="notion-content">{renderNodes(parseShortcodeNodes(blocks))}</div>;
}

function renderNodes(nodes: RenderNode[]): React.ReactNode {
  const rendered: React.ReactNode[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    if (node.kind === "block" && isListType(node.block.type)) {
      const type = node.block.type;
      const items = [node.block];

      while (
        index + 1 < nodes.length &&
        nodes[index + 1].kind === "block" &&
        isListType((nodes[index + 1] as { kind: "block"; block: NotionBlock }).block.type) &&
        (nodes[index + 1] as { kind: "block"; block: NotionBlock }).block.type === type
      ) {
        index += 1;
        items.push((nodes[index] as { kind: "block"; block: NotionBlock }).block);
      }

      rendered.push(renderList(type, items));
      continue;
    }

    rendered.push(renderNode(node, index));
  }

  return rendered;
}

function renderNode(node: RenderNode, index: number): React.ReactNode {
  if (node.kind === "error") {
    return (
      <div className="shortcode-error" key={`error-${node.source}-${index}`}>
        {node.message}
      </div>
    );
  }

  if (node.kind === "component") {
    const Component = shortcodeRegistry[normalizeName(node.name)];

    if (!Component) {
      return (
        <div className="shortcode-missing" key={`${node.source}-${index}`}>
          Unknown shortcode: {node.name}
        </div>
      );
    }

    return (
      <Component key={`${node.source}-${index}`} {...node.props}>
        {renderNodes(node.children)}
      </Component>
    );
  }

  return renderBlock(node.block, node.block.id);
}

function renderBlock(block: NotionBlock, key: string): React.ReactNode {
  switch (block.type) {
    case "paragraph":
      return renderTextBlock("p", block, key);
    case "heading_1":
      return renderTextBlock("h1", block, key);
    case "heading_2":
      return renderTextBlock("h2", block, key);
    case "heading_3":
      return renderTextBlock("h3", block, key);
    case "heading_4":
      return renderTextBlock("h4", block, key);
    case "quote":
      return (
        <blockquote key={key}>
          <RichText value={getRichText(block)} />
          {renderChildren(block)}
        </blockquote>
      );
    case "callout":
      return (
        <aside className="notion-callout" key={key}>
          <RichText value={getRichText(block)} />
          {renderChildren(block)}
        </aside>
      );
    case "to_do":
      return renderTodo(block, key);
    case "divider":
      return <hr key={key} />;
    case "code":
      return renderCode(block, key);
    case "image":
      return renderImage(block, key);
    case "bookmark":
    case "embed":
    case "link_preview":
      return renderBookmark(block, key);
    case "unsupported":
      return (
        <div className="shortcode-missing" key={key}>
          Unsupported Notion block.
        </div>
      );
    default:
      return renderGeneric(block, key);
  }
}

function renderTextBlock(
  Tag: "p" | "h1" | "h2" | "h3" | "h4",
  block: NotionBlock,
  key: string,
) {
  const text = getRichText(block);
  const hasText = Boolean(text?.some((part) => part.plain_text));

  if (!hasText && !block.children?.length) {
    return null;
  }

  const Element = Tag;

  return (
    <Element key={key}>
      <RichText value={text} />
      {renderChildren(block)}
    </Element>
  );
}

function renderList(type: string, blocks: NotionBlock[]) {
  const List = type === "numbered_list_item" ? "ol" : "ul";

  return (
    <List key={`${type}-${blocks[0]?.id}`}>
      {blocks.map((block) => (
        <li key={block.id}>
          <RichText value={getRichText(block)} />
          {renderChildren(block)}
        </li>
      ))}
    </List>
  );
}

function renderTodo(block: NotionBlock, key: string) {
  const data = getTypeData<{ checked?: boolean }>(block);

  return (
    <div className="todo-item" key={key}>
      <span className="todo-box" data-checked={Boolean(data?.checked)} />
      <span>
        <RichText value={getRichText(block)} />
        {renderChildren(block)}
      </span>
    </div>
  );
}

function renderCode(block: NotionBlock, key: string) {
  const data = getTypeData<{ rich_text?: RichTextPart[]; language?: string }>(block);

  return (
    <pre key={key}>
      <code data-language={data?.language || "plain text"}>
        {data?.rich_text?.map((part) => part.plain_text).join("")}
      </code>
    </pre>
  );
}

function renderImage(block: NotionBlock, key: string) {
  const data = getTypeData<{
    caption?: RichTextPart[];
    external?: { url: string };
    file?: { url: string };
    type?: NotionFile["type"];
  }>(block);
  const src = data?.external?.url || data?.file?.url;

  if (!src) {
    return null;
  }

  return (
    <figure className="notion-image" key={key}>
      <img src={src} alt={data?.caption?.map((part) => part.plain_text).join("") || ""} />
      {data?.caption?.length ? (
        <figcaption>
          <RichText value={data.caption} />
        </figcaption>
      ) : null}
    </figure>
  );
}

function renderBookmark(block: NotionBlock, key: string) {
  const data = getTypeData<{ url?: string; caption?: RichTextPart[] }>(block);

  if (!data?.url) {
    return null;
  }

  return (
    <p key={key}>
      <a href={data.url} rel="noreferrer" target="_blank">
        {data.caption?.length ? <RichText value={data.caption} /> : data.url}
      </a>
    </p>
  );
}

function renderGeneric(block: NotionBlock, key: string) {
  const text = getRichText(block);

  if (!text?.length && !block.children?.length) {
    return null;
  }

  return (
    <div key={key}>
      <RichText value={text} />
      {renderChildren(block)}
    </div>
  );
}

function renderChildren(block: NotionBlock) {
  if (!block.children?.length) {
    return null;
  }

  return <>{renderNodes(parseShortcodeNodes(block.children))}</>;
}

function getRichText(block: NotionBlock): RichTextPart[] | undefined {
  return getTypeData<{ rich_text?: RichTextPart[] }>(block)?.rich_text;
}

function getTypeData<T>(block: NotionBlock): T | undefined {
  const value = block[block.type];
  return value && typeof value === "object" ? (value as T) : undefined;
}

function isListType(type: string) {
  return type === "bulleted_list_item" || type === "numbered_list_item";
}

function normalizeName(value: string) {
  return value.toLowerCase();
}
