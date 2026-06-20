import type { RichText as RichTextPart } from "@/lib/notion/types";

export function RichText({ value }: { value?: RichTextPart[] }) {
  if (!value?.length) {
    return null;
  }

  return (
    <>
      {value.map((part, index) => {
        let content: React.ReactNode = part.plain_text;

        if (part.annotations?.code) {
          content = <code>{content}</code>;
        }

        if (part.annotations?.bold) {
          content = <strong>{content}</strong>;
        }

        if (part.annotations?.italic) {
          content = <em>{content}</em>;
        }

        if (part.annotations?.underline) {
          content = <u>{content}</u>;
        }

        if (part.annotations?.strikethrough) {
          content = <s>{content}</s>;
        }

        const href = part.href || part.text?.link?.url;

        if (href) {
          content = (
            <a href={href} rel="noreferrer" target="_blank">
              {content}
            </a>
          );
        }

        return <span key={`${part.plain_text}-${index}`}>{content}</span>;
      })}
    </>
  );
}
