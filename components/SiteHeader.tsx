"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isPost = pathname.startsWith("/posts/");

  return (
    <header className="site-header">
      <Link className="brand-mark" href="/">
        Jacob Sides
      </Link>
      {isPost ? (
        <nav className="site-nav" aria-label="Primary">
          <Link href="/">Thoughts</Link>
        </nav>
      ) : null}
    </header>
  );
}
