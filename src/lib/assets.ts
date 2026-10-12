// Asset status, shared by the admin and (later) the buyer's downloads page.
//   ready   = file/link is there and released
//   presale = has an "Arrives by" date (buyers see the date, not a button)
//   missing = no file and no date — buyers would see nothing

export type AssetStatus = "ready" | "presale" | "missing";

export function assetStatus(a: {
  kind: "pdf" | "sheet_link";
  storageKey: string | null;
  url: string | null;
  availableAt: Date | string | null;
}): AssetStatus {
  if (a.availableAt) return "presale";
  const hasContent = a.kind === "pdf" ? !!a.storageKey : !!a.url;
  return hasContent ? "ready" : "missing";
}

/** Uploaded/linked, whatever the status. */
export const hasAssetContent = (a: { kind: "pdf" | "sheet_link"; storageKey: string | null; url: string | null }) =>
  a.kind === "pdf" ? !!a.storageKey : !!a.url;

/** 1536000 → "1.5 MB" */
export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
