import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fieldnotes",
    template: "%s | Fieldnotes",
  },
  description: "A Notion-backed blog with programmable shortcode components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand-mark" href="/" aria-label="Fieldnotes home">
              <span className="brand-glyph" aria-hidden="true" />
              <span>Fieldnotes</span>
            </Link>
            <nav className="site-nav" aria-label="Primary navigation">
              <Link href="/">Index</Link>
              <a href="https://www.notion.so" rel="noreferrer" target="_blank">
                Notion
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
