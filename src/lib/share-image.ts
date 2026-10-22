// Social share images (Open Graph). 1200x630 is what Facebook, LinkedIn and X expect.
export type ShareImage = { url: string; width?: number; height?: number; alt: string };

export const DEFAULT_SHARE_IMAGE: ShareImage = {
  url: "/images/share/parentkeeping.jpg",
  width: 1200,
  height: 630,
  alt: "An adult daughter and her mother going through a care binder together at the kitchen table",
};
