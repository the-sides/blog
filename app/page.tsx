import Link from "next/link";
import { getPublishedPosts } from "@/lib/notion/client";

export default async function HomePage() {
  const posts = await getPublishedPosts();
  const [featuredPost, ...otherPosts] = posts;

  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Notion as the desk, React as the workshop</p>
          <h1>Jacob Sides - Blog</h1>
          <p>
            This blog renders normal Notion blocks, then turns dedicated
            shortcode blocks into registered React components. Wrapper
            shortcodes can receive Notion content as children.
          </p>
        </div>
        <div className="hero-panel" aria-label="Shortcode example">
          <span>[Aside title=&quot;Field note&quot;]</span>
          <span>Notion paragraphs, images, lists...</span>
          <span>[/Aside]</span>
        </div>
      </section>

      {featuredPost ? (
        <section className="featured-post" aria-labelledby="featured-heading">
          <div>
            <p className="eyebrow">Latest</p>
            <h2 id="featured-heading">{featuredPost.title}</h2>
            <p>{featuredPost.excerpt}</p>
            <Link className="text-link" href={`/posts/${featuredPost.slug}`}>
              Read the piece
            </Link>
          </div>
          {featuredPost.coverUrl ? (
            <img src={featuredPost.coverUrl} alt="" />
          ) : (
            <div className="cover-fallback" aria-hidden="true" />
          )}
        </section>
      ) : null}

      <section className="post-index" aria-label="Post index">
        {otherPosts.map((post) => (
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
    return "Drafted in Notion";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
