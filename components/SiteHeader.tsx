"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const pathname = usePathname();
  const isPost = pathname.startsWith("/posts/");

  // A framed post still needs its way back to the index, so only the index
  // itself trades the header for a spacer when embedded.
  if (isEmbedded && !isPost) {
    return <div className="embed-spacer" aria-hidden="true" />;
  }

  return (
    <header className="site-header">
      {isPost ? (
        <Link className="brand-mark" href="/">
          Thoughts
        </Link>
      ) : (
        <a className="brand-mark" href="https://jacobsides.com">
          Jacob Sides
        </a>
      )}
      <ThemeToggle />
    </header>
  );
}
