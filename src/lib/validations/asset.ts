import { z } from "zod";

// Asset = one deliverable file (PDF in private storage, or a Google Sheets
// "Make a copy" link), attached to one or more products.

export const SHEET_COPY_URL = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+\/copy(\?.*)?$/;

export const uploadedFileSchema = z.object({
  storageKey: z.string().min(1),
  fileName: z.string().trim().min(1).max(200),
  contentType: z.literal("application/pdf"),
  sizeBytes: z.number().int().positive(),
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

export const assetInputSchema = z
  .object({
    label: z.string().trim().min(1, "Enter a name buyers will see").max(200),
    kind: z.enum(["pdf", "sheet_link"]),
    // pdf: null until uploaded (pre-sale). Unchanged when editing = same object.
    file: uploadedFileSchema.nullable(),
    // sheet_link: the .../copy URL
    url: z.string().trim(),
    // Pre-sale: buyers see "Arrives by [date]" until the file is ready.
    availableAt: z.iso.date().nullable(),
    productIds: z.array(z.uuid()),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "sheet_link" && v.url !== "" && !SHEET_COPY_URL.test(v.url)) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Use the “Make a copy” link: https://docs.google.com/spreadsheets/d/…/copy",
      });
    }
    const hasContent = v.kind === "pdf" ? v.file !== null : v.url !== "";
    if (!hasContent && !v.availableAt) {
      ctx.addIssue({
        code: "custom",
        path: [v.kind === "pdf" ? "file" : "url"],
        message:
          v.kind === "pdf"
            ? "Upload the PDF, or set an “Arrives by” date for a pre-sale"
            : "Add the sheet link, or set an “Arrives by” date for a pre-sale",
      });
    }
  });

export type AssetInput = z.infer<typeof assetInputSchema>;
