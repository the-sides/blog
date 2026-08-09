import Link from "next/link";

export default function NotFound() {
  return (
    <main className="empty-state">
      <h1>Page not found</h1>
      <p>
        The Notion page may be unpublished, missing a slug, or not shared with
        the connection.
      </p>
      <Link className="text-link" href="/">
        Back to posts
      </Link>
    </main>
  );
}
