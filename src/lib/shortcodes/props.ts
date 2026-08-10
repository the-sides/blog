import type { ShortcodeProps } from "./parser";

// Every shortcode component takes the same loose prop bag: whatever the author
// wrote in Notion. Sharing one type also lets the registry hold them together.
export type ShortcodeComponentProps = ShortcodeProps;

export function asText(value: unknown, fallback: string) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
}
