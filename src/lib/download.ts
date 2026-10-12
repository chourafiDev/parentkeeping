/** Saves a fetch Response (e.g. a CSV export) as a file, using its filename header. */
export async function downloadResponse(res: Response, fallbackName: string) {
	const blob = await res.blob();
	const name =
		res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? fallbackName;
	const url = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement("a"), { href: url, download: name });
	document.body.append(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
