"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isPost = pathname.startsWith("/posts/");

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
    </header>
  );
}
