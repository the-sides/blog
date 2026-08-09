type ShortcodeComponent = React.ComponentType<
  Record<string, unknown> & {
    children?: React.ReactNode;
  }
>;

export const shortcodeRegistry: Record<string, ShortcodeComponent> = {
  aside: Aside,
  note: Note,
  comparison: Comparison,
  newslettersignup: NewsletterSignup,
  "newsletter-signup": NewsletterSignup,
};

function Aside({
  children,
  title = "Aside",
}: Record<string, unknown> & { children?: React.ReactNode }) {
  return (
    <aside className="shortcode-aside">
      <p className="shortcode-title">{asText(title, "Aside")}</p>
      {children}
    </aside>
  );
}

function Note({
  children,
  title = "Note",
}: Record<string, unknown> & { children?: React.ReactNode }) {
  return (
    <aside className="shortcode-note">
      <p className="shortcode-title">{asText(title, "Note")}</p>
      {children}
    </aside>
  );
}

function Comparison({
  children,
  leftTitle = "Before",
  rightTitle = "After",
}: Record<string, unknown> & { children?: React.ReactNode }) {
  return (
    <section className="shortcode-comparison">
      <p className="shortcode-title">Comparison</p>
      <div className="comparison-grid">
        <div className="comparison-cell">
          <strong>{asText(leftTitle, "Before")}</strong>
        </div>
        <div className="comparison-cell">
          <strong>{asText(rightTitle, "After")}</strong>
        </div>
      </div>
      {children}
    </section>
  );
}

function NewsletterSignup({
  eyebrow = "Newsletter",
}: Record<string, unknown> & { children?: React.ReactNode }) {
  return (
    <section className="newsletter-signup">
      <div>
        <p className="shortcode-title">{asText(eyebrow, "Newsletter")}</p>
        <p>Get the next field note when it ships.</p>
      </div>
      <button type="button">Subscribe</button>
    </section>
  );
}

function asText(value: unknown, fallback: string) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
}
