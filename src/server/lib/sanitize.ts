import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Product descriptions come from the rich-text editor as HTML and are later
 * rendered on the store: keep only what the editor can produce.
 */
export function sanitizeDescription(html: string) {
  const clean = sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "strong", "em", "u", "s", "ul", "ol", "li", "a", "blockquote", "code"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  }).trim();
  return clean === "<p></p>" ? "" : clean;
}
