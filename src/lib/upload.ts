import { api } from "@/lib/api-client";
import type { UploadedFile } from "@/lib/validations/asset";

// Client-side uploads straight to storage: ask our API for a presigned URL,
// then PUT the file to it. Files never pass through our server.

export const ASSET_ACCEPT = "application/pdf";
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/** PUT with upload progress (fetch can't report it). */
function put(url: string, file: File, onProgress?: (percent: number) => void) {
	return new Promise<void>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", url);
		xhr.setRequestHeader("Content-Type", file.type);
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
		};
		xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload to storage failed")));
		xhr.onerror = () => reject(new Error("Upload to storage failed"));
		xhr.send(file);
	});
}

/** Product file (PDF) → private storage. */
export async function uploadAsset(file: File, onProgress?: (percent: number) => void): Promise<UploadedFile> {
	if (file.type !== "application/pdf") throw new Error("Upload a PDF");
	const res = await api.api.admin.assets.presign.$post({ json: { contentType: "application/pdf", size: file.size } });
	const body = await res.json();
	if (!res.ok || !("uploadUrl" in body)) throw new Error("error" in body ? body.error : "Upload failed");
	await put(body.uploadUrl, file, onProgress);
	return { storageKey: body.key, fileName: file.name, contentType: "application/pdf", sizeBytes: file.size };
}

type ImageType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

/** Product cover image → public storage. */
export async function uploadImage(file: File) {
	const res = await api.api.admin.products.images.presign.$post({
		json: { contentType: file.type as ImageType, size: file.size },
	});
	const body = await res.json();
	if (!res.ok || !("uploadUrl" in body)) throw new Error("error" in body ? body.error : "Upload failed");
	await put(body.uploadUrl, file);
	return { key: body.key, url: body.publicUrl };
}
