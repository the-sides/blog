import type { NotionBlock, RichText } from "@/lib/notion/types";

export type ShortcodeValue = string | number | boolean;
export type ShortcodeProps = Record<string, ShortcodeValue>;

export type RenderNode =
  | {
      kind: "block";
      block: NotionBlock;
    }
  | {
      kind: "component";
      name: string;
      props: ShortcodeProps;
      children: RenderNode[];
      source: string;
    }
  | {
      kind: "error";
      message: string;
      source: string;
    };

type ShortcodeToken =
  | {
      type: "open";
      name: string;
      props: ShortcodeProps;
      source: string;
    }
  | {
      type: "close";
      name: string;
      source: string;
    }
  | {
      type: "self";
      name: string;
      props: ShortcodeProps;
      source: string;
    };

type StackFrame = {
  name: string;
  node: { children: RenderNode[] };
};

export function parseShortcodeNodes(blocks: NotionBlock[]): RenderNode[] {
  const root = { children: [] as RenderNode[] };
  const stack: StackFrame[] = [{ name: "__root__", node: root }];

  for (const block of blocks) {
    const token = parseShortcodeBlock(block);
    const current = stack[stack.length - 1].node;

    if (!token) {
      current.children.push({ kind: "block", block });
      continue;
    }

    if (token.type === "self") {
      current.children.push({
        kind: "component",
        name: token.name,
        props: token.props,
        children: [],
        source: token.source,
      });
      continue;
    }

    if (token.type === "open") {
      const node: RenderNode = {
        kind: "component",
        name: token.name,
        props: token.props,
        children: [],
        source: token.source,
      };

      current.children.push(node);
      stack.push({ name: token.name, node });
      continue;
    }

    const open = stack[stack.length - 1];

    if (open.name !== token.name || open.name === "__root__") {
      current.children.push({
        kind: "error",
        message: `Unexpected closing shortcode [/${token.name}]`,
        source: token.source,
      });
      continue;
    }

    stack.pop();
  }

  while (stack.length > 1) {
    const open = stack.pop();

    open?.node.children.push({
      kind: "error",
      message: `Missing closing shortcode [/${open.name}]`,
      source: open.name,
    });
  }

  return root.children;
}

function parseShortcodeBlock(block: NotionBlock): ShortcodeToken | null {
  if (block.type !== "paragraph") {
    return null;
  }

  const richText = getRichText(block);

  if (!richText?.length) {
    return null;
  }

  const source = richText.map((part) => part.plain_text).join("").trim();

  if (!source.startsWith("[") || !source.endsWith("]")) {
    return null;
  }

  const closing = source.match(/^\[\/([A-Za-z][A-Za-z0-9_.:-]*)\]$/);

  if (closing) {
    return {
      type: "close",
      name: closing[1],
      source,
    };
  }

  const opening = source.match(/^\[([A-Za-z][A-Za-z0-9_.:-]*)([\s\S]*)\]$/);

  if (!opening) {
    return null;
  }

  const rawArgs = opening[2].trim();
  const selfClosing = rawArgs.endsWith("/");
  const args = selfClosing ? rawArgs.slice(0, -1).trim() : rawArgs;

  return {
    type: selfClosing ? "self" : "open",
    name: opening[1],
    props: parseProps(args),
    source,
  };
}

function parseProps(source: string): ShortcodeProps {
  const props: ShortcodeProps = {};
  const pattern = /([A-Za-z_:][A-Za-z0-9_:.-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    const [, key, doubleQuoted, singleQuoted, bare] = match;
    const value = doubleQuoted ?? singleQuoted ?? bare;
    props[key] = coerceValue(value ?? true);
  }

  return props;
}

function coerceValue(value: string | boolean): ShortcodeValue {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  const number = Number(value);

  if (value.trim() !== "" && Number.isFinite(number)) {
    return number;
  }

  return value;
}

function getRichText(block: NotionBlock): RichText[] | null {
  const value = block[block.type];

  if (!value || typeof value !== "object" || !("rich_text" in value)) {
    return null;
  }

  return (value as { rich_text?: RichText[] }).rich_text || null;
}
