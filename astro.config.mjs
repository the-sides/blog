// @ts-check
import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";

// Every route reads from Notion at request time, so the whole site renders on
// demand. `output: "server"` makes that the default instead of tagging each
// page with `export const prerender = false`.
export default defineConfig({
  output: "server",
  adapter: vercel(),

  // Nothing here uses sessions; opting out keeps the session runtime and its
  // storage dependency out of the serverless bundle.
  session: false,

  // Notion settings are read at runtime rather than inlined at build time, so
  // rotating the token in Vercel does not require a redeploy. Everything is
  // optional: with no credentials the site falls back to demo content.
  env: {
    schema: {
      NOTION_TOKEN: secret(),
      NOTION_DATA_SOURCE_ID: secret(),
      NOTION_API_VERSION: secret(),
      NOTION_REVALIDATE_SECONDS: secret(),
      NOTION_TITLE_PROPERTY: secret(),
      NOTION_SLUG_PROPERTY: secret(),
      NOTION_STATUS_PROPERTY: secret(),
      NOTION_PUBLISHED_STATUS: secret(),
      NOTION_EXCERPT_PROPERTY: secret(),
      NOTION_AUTHOR_PROPERTY: secret(),
      NOTION_PUBLISHED_PROPERTY: secret(),
    },
  },
});

function secret() {
  return envField.string({ context: "server", access: "secret", optional: true });
}
