# Notion Shortcode Blog

A Next.js blog that uses Notion as the content store and renders custom React components from shortcode marker blocks.

## Notion Setup

Create a Notion data source with these properties:

- `Title`: title
- `Slug`: rich text
- `Status`: status, with `Published`
- `Excerpt`: rich text
- `Author`: rich text or people
- `Published`: date

Share the data source with your Notion connection, then copy `.env.example` to `.env.local` and set `NOTION_TOKEN` and `NOTION_DATA_SOURCE_ID`.

Notion's current API split databases and data sources. This project uses `NOTION_DATA_SOURCE_ID` with API version `2026-03-11`.

## Shortcodes

Shortcodes live in their own Notion paragraph blocks. Self-closing tags inject a component between blocks:

```text
[NewsletterSignup eyebrow="Dispatch" /]
```

Open and closing tags wrap Notion blocks and pass them as `children`:

```text
[Aside title="Field note" tone="green"]
Any Notion blocks here become children.
[/Aside]
```

The default registry is in `components/shortcodes/registry.tsx`. Add custom page code there, then write the corresponding shortcode in Notion.

## Development

```bash
npm install
npm run dev
```

Without Notion credentials, the app serves demo content that exercises the shortcode renderer.

## Deploying on Vercel

Import this repository as a Vercel project. The default Next.js settings are enough:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty

Add these environment variables in Vercel for Production and Preview:

- `NOTION_TOKEN`
- `NOTION_DATA_SOURCE_ID`
- `NOTION_API_VERSION` set to `2026-03-11`
- `NOTION_TITLE_PROPERTY` if your title property is not `Title`
- `NOTION_SLUG_PROPERTY` if your slug property is not `Slug`
- `NOTION_STATUS_PROPERTY` if your status property is not `Status`
- `NOTION_PUBLISHED_STATUS` if your published status is not `Published`
- `NOTION_EXCERPT_PROPERTY` if your excerpt property is not `Excerpt`
- `NOTION_AUTHOR_PROPERTY` if your author property is not `Author`
- `NOTION_PUBLISHED_PROPERTY` if your published date property is not `Published`
- `NOTION_REVALIDATE_SECONDS` for the Notion fetch cache window

Keep the Notion token private. Do not prefix it with `NEXT_PUBLIC_`; this project reads it only on the server.

Vercel will redeploy from Git pushes. Notion content updates are picked up through the `NOTION_REVALIDATE_SECONDS` fetch revalidation window, so editing content in Notion does not require a rebuild unless you want the update immediately.
