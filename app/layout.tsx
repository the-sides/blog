import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jacob Sides",
    template: "%s | Jacob Sides",
  },
  description: "A Notion-backed blog.",
};

// Browsers label a framed top-level navigation with Sec-Fetch-Dest, so embedded
// views can drop the site chrome without a client-side flash. The header itself
// decides what to do with that: posts keep it as the way back to the index.
const EMBEDDED_DESTINATIONS = new Set(["iframe", "frame", "embed", "object"]);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const isEmbedded = EMBEDDED_DESTINATIONS.has(
    requestHeaders.get("sec-fetch-dest") ?? "",
  );

  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <div className="site-shell">
          <SiteHeader isEmbedded={isEmbedded} />
          {children}
        </div>
      </body>
    </html>
  );
}
