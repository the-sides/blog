import Link from "next/link";
import { getPublishedPosts } from "@/lib/notion/client";

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <main>
      <section className="home-intro">
        <h1>Thoughts</h1>
        <p>Better published than forgotten.</p>
      </section>

      <section className="post-index" aria-label="Posts">
        {posts.map((post) => (
          <article className="post-card" key={post.id}>
            <p className="post-meta">{formatPostDate(post.publishedAt)}</p>
            <h2>
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function formatPostDate(value?: string) {
  if (!value) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
