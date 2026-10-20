import { api } from "@/lib/api-client";
import { ASSET_CONTENT_TYPES, type AssetContentType, MAX_ASSET_MB, type UploadedFile } from "@/lib/validations/asset";

// Client-side uploads straight to storage: ask our API for a presigned URL,
// then PUT the file to it. Files never pass through our server.

export const ASSET_ACCEPT = ".zip,.pdf,application/zip,application/x-zip-compressed,application/pdf";
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/** PUT with upload progress (fetch can't report it). */
function put(url: string, file: File, onProgress?: (percent: number) => void, contentType = file.type) {
	return new Promise<void>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", url);
		xhr.setRequestHeader("Content-Type", contentType);
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
		};
		xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload to storage failed")));
		xhr.onerror = () => reject(new Error("Upload to storage failed"));
		xhr.send(file);
	});
}

/** Browsers sometimes leave a ZIP's type empty: fall back to the extension. */
function assetContentType(file: File): AssetContentType | null {
	if ((ASSET_CONTENT_TYPES as readonly string[]).includes(file.type)) return file.type as AssetContentType;
	const ext = file.name.toLowerCase().split(".").pop();
	return ext === "zip" ? "application/zip" : ext === "pdf" ? "application/pdf" : null;
}

/** Product file (ZIP or PDF) → private storage, with upload progress. */
export async function uploadAsset(file: File, onProgress?: (percent: number) => void): Promise<UploadedFile> {
	const contentType = assetContentType(file);
	if (!contentType) throw new Error(`${file.name}: upload a ZIP or PDF file`);
	if (file.size > MAX_ASSET_MB * 1024 * 1024) throw new Error(`${file.name}: too large (${MAX_ASSET_MB} MB max)`);
	const res = await api.api.admin.assets.presign.$post({ json: { contentType, size: file.size } });
	const body = await res.json();
	if (!res.ok || !("uploadUrl" in body)) throw new Error("error" in body ? body.error : "Upload failed");
	await put(body.uploadUrl, file, onProgress, contentType);
	return { storageKey: body.key, fileName: file.name, contentType, sizeBytes: file.size };
}

async function readDimensions(file: File) {
	try {
		const bitmap = await createImageBitmap(file);
		const size = { width: bitmap.width, height: bitmap.height };
		bitmap.close();
		return size;
	} catch {
		return { width: null, height: null };
	}
}

type ImageType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

/** Product cover image → public storage. */
export async function uploadImage(file: File) {
	const res = await api.api.admin.products.images.presign.$post({
		json: { contentType: file.type as ImageType, size: file.size, fileName: file.name },
	});
	const body = await res.json();
	if (!res.ok || !("uploadUrl" in body)) throw new Error("error" in body ? body.error : "Upload failed");
	await put(body.uploadUrl, file);
	const { width, height } = await readDimensions(file);
	return { key: body.key, url: body.publicUrl, alt: "", width, height };
}
