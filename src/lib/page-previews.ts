// "See every page" carousel (home + product pages). Page names and lines
// come from the product copy, so the carousel never promises a page the
// files don't have.
//
// Real previews: export the page from the finished file and save it as
//   public/images/pages/<group>/<page-slug>.webp (or .jpg / .png)
// e.g. public/images/pages/medical-binder/medications.png. Until a file
// is there, the page is drawn (DocMockup). Never use AI-made page images:
// visitors are deciding on what the real pages look like.

import type { DocKind } from "@/app/(store)/_components/home/doc-mockup";
import { PRODUCT_COPY } from "./product-copy";

export type PreviewPage = { name: string; text: string; slug: string };
export type PreviewGroup = { id: string; label: string; kind: DocKind; pages: PreviewPage[] };

/** "“Who does what” page" → "who-does-what-page". */
export const pageSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const fromCopy = (slug: string) =>
  PRODUCT_COPY[slug].inside.items.map((i) => ({ name: i.name, text: i.text, slug: pageSlug(i.name) }));
const pages = (items: { name: string; text: string }[]) => items.map((i) => ({ ...i, slug: pageSlug(i.name) }));

export const PREVIEW_GROUPS: Record<string, PreviewGroup> = {
  "medical-binder": { id: "medical-binder", label: "Medical Binder", kind: "binder", pages: fromCopy("medical-binder") },
  "care-sheet": {
    id: "care-sheet",
    label: "Shared Care Sheet",
    kind: "sheet",
    // The three tabs, worded from OFFER_PARTS[1].what.
    pages: pages([
      { name: "Medication tracker", text: "One list of your parent's medications that the whole family sees and keeps current." },
      { name: "Job board", text: "Who does what, by when. Every job has a name beside it." },
      { name: "Cost tracker", text: "What's been spent, by whom, and each sibling's share." },
    ]),
  },
  "caregiver-agreement": {
    id: "caregiver-agreement",
    label: "Caregiver Agreement",
    kind: "agreement",
    pages: fromCopy("caregiver-agreement"),
  },
  "meeting-kit": {
    id: "meeting-kit",
    label: "Family Meeting Kit",
    kind: "meeting",
    // Worded from OFFER_PARTS[3].what.
    pages: pages([
      { name: "One-page agenda", text: "What needs doing, who takes which job, and how costs split." },
      { name: "Plain-words script", text: "What to say in the first sibling conversation, in plain words." },
    ]),
  },
  "emergency-binder": { id: "emergency-binder", label: "Emergency Binder", kind: "binder", pages: fromCopy("emergency-binder") },
};

/** Which groups each product page shows (the System: its four parts, in OFFER_PARTS order). */
export const PREVIEWS_BY_PRODUCT: Record<string, string[]> = {
  "family-care-system": ["medical-binder", "care-sheet", "caregiver-agreement", "meeting-kit"],
  "medical-binder": ["medical-binder"],
  "caregiver-agreement": ["caregiver-agreement"],
  "emergency-binder": ["emergency-binder"],
};

