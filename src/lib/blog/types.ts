// Blog content as typed blocks. Inline text supports **bold** and
// [label](/path) links only (rendered by the blog's Inline component).

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[]; start?: number }
  | { type: "table"; head: string[]; rows: string[][]; note?: string }
  /** Glozin's grey quote box: the post's call to action. */
  | { type: "cta"; title: string; text: string[]; button?: { label: string; href: string } }
  /** A free download's email form, right in the post (no trip to its page). Title and text default to the magnet's. */
  | { type: "signup"; magnet: "medication-list" | "checklists"; title?: string; text?: string[] }
  /** Small print (the general-information line). */
  | { type: "small"; text: string };

export type Post = {
  slug: string;
  title: string;
  seo: { title: string; description: string };
  /** Card label (Glozin's category pill). */
  category: string;
  tags: string[];
  /** "YYYY-MM-DD" */
  publishedAt: string;
  updatedAt?: string;
  /** Sources named at the end (statistics always carry their source). */
  sources: string[];
  body: Block[];
};
