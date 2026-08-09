import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jacob Sides",
    template: "%s | Jacob Sides",
  },
  description: "A Notion-backed blog.",
};

// Browsers label a framed top-level navigation with Sec-Fetch-Dest, so embedded
// views can drop the site chrome without a client-side flash. The header's box
// still renders, empty, so framed pages keep the same top spacing.
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
    <html lang="en">
      <body>
        <div className="site-shell">
          {isEmbedded ? (
            <div className="site-header" aria-hidden="true">
              <span className="brand-mark">&nbsp;</span>
            </div>
          ) : (
            <SiteHeader />
          )}
          {children}
        </div>
      </body>
    </html>
  );
}
