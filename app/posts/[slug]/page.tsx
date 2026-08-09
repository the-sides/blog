import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import {
  getPostBySlug,
  getPublishedPosts,
  hasNotionCredentials,
} from "@/lib/notion/client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      {!hasNotionCredentials() ? (
        <div className="demo-banner">
          Demo mode: add Notion credentials to `.env.local` to render your data
          source.
        </div>
      ) : null}

      <article>
        <header className="article-header">
          <h1>{post.title}</h1>
          <p className="post-meta">{formatPostDate(post.publishedAt)}</p>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
        </header>

        {post.coverUrl ? (
          <img className="article-cover" src={post.coverUrl} alt="" />
        ) : null}

        <NotionRenderer blocks={post.blocks} />
      </article>
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
