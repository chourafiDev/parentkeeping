// The "Guides" blog (Shopify-style URLs: /blogs/guides/<slug>).
// Post copy is word for word from the Phase 1 blog docs.

import { costOfInHomeCare } from "./cost-of-in-home-care";
import { dementiaDistraction } from "./dementia-distraction";
import { manageMultipleMedications } from "./manage-multiple-medications";
import { thingsNotToSay } from "./things-not-to-say";
import type { Post } from "./types";

export type { Block, Post } from "./types";

export const BLOG_PATH = "/blogs/guides";
export const BLOG = {
  title: "Guides",
  intro: "Plain-words guides for families looking after Mom or Dad: medications, money, hard conversations and you.",
  seo: {
    title: "Caregiving Guides for Adult Children",
    description: "Plain-words guides for families caring for an aging parent: medications, in-home care costs, dementia care and talking to parents.",
  },
};

/** Newest first; on a tie, this order. */
export const POSTS: Post[] = [manageMultipleMedications, dementiaDistraction, costOfInHomeCare, thingsNotToSay].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

export const postPath = (slug: string) => `${BLOG_PATH}/${slug}`;
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug) ?? null;

/** "2026-10-12" → "Oct 12, 2026" (no time zone shift). */
export const formatPostDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};

/** Card excerpt: the first paragraph, cut to about 140 characters. */
export const excerpt = (post: Post) => {
  const first = post.body.find((b) => b.type === "p");
  const text = (first && "text" in first ? first.text : post.seo.description).replace(/\*\*|\[|\]\([^)]*\)/g, "");
  return text.length > 140 ? `${text.slice(0, text.lastIndexOf(" ", 137))}…` : text;
};
