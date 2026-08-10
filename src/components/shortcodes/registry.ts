import Aside from "./Aside.astro";
import Comparison from "./Comparison.astro";
import NewsletterSignup from "./NewsletterSignup.astro";
import Note from "./Note.astro";

// Keys are matched lowercased, so a shortcode can be written however it reads
// best in Notion. Add page-specific components here.
export const shortcodeRegistry: Record<string, typeof Aside> = {
  aside: Aside,
  note: Note,
  comparison: Comparison,
  newslettersignup: NewsletterSignup,
  "newsletter-signup": NewsletterSignup,
};
