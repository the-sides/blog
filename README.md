# Notion Shortcode Blog

An Astro blog that uses Notion as the content store and renders custom components from shortcode marker blocks.

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

Open and closing tags wrap Notion blocks and pass them along as children:

```text
[Aside title="Field note" tone="green"]
Any Notion blocks here become children.
[/Aside]
```

The default registry is in `src/components/shortcodes/registry.ts`. Add a component next to it, register it there, then write the corresponding shortcode in Notion.

## How it renders

- `src/lib/shortcodes/parser.ts` turns a flat list of Notion blocks into a tree, pulling shortcode paragraphs out of the prose.
- `src/lib/notion/render.ts` groups consecutive list items and reduces each block to a shape the template can render directly.
- `src/components/notion/RenderNodes.astro` is the single recursive component. Nested blocks and shortcode children both come back through `Astro.self`.

## Development

```bash
npm install
npm run dev
```

Without Notion credentials, the app serves demo content that exercises the shortcode renderer.

`npm run check` runs `astro check` for type and template diagnostics; `npm run build` runs it before building.

## Rendering model

Every route is server-rendered on demand (`output: "server"` in `astro.config.mjs`), because content comes from the Notion API at request time and the layout reads the `Sec-Fetch-Dest` request header to detect iframe embedding.

Notion responses are memoised in the running instance for `NOTION_REVALIDATE_SECONDS` (default 300), so repeat requests and the several calls a single render makes hit the API once. The cache lives in instance memory rather than a shared store, so a cold start simply refetches. HTML itself is not cached, since the embedded and standalone versions of a page differ by request header.

## Deploying on Vercel

Import this repository as a Vercel project. `vercel.json` pins the framework preset to Astro; the rest of the defaults are enough:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty

The `@astrojs/vercel` adapter emits `.vercel/output`, so there is nothing else to configure.

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
- `NOTION_REVALIDATE_SECONDS` for the Notion cache window

They are declared in `astro.config.mjs` under `env.schema` as server-side secrets, which means they are read at runtime rather than baked into the build: rotating the token in Vercel does not need a redeploy. Keep the Notion token private; it is never exposed to the client.

Vercel will redeploy from Git pushes. Notion content updates are picked up within the `NOTION_REVALIDATE_SECONDS` window, so editing content in Notion does not require a rebuild unless you want the update immediately.
