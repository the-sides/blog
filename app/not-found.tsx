import Link from "next/link";

export default function NotFound() {
  return (
    <main className="empty-state">
      <p className="eyebrow">404</p>
      <h1>That page is not in the published stack.</h1>
      <p>
        The Notion page may be unpublished, missing a slug, or not shared with
        the connection.
      </p>
      <Link className="text-link" href="/">
        Back to the index
      </Link>
    </main>
  );
}
