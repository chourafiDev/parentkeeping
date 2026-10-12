import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { cn } from "@/lib/utils";

const EXTENSIONS = ["webp", "jpg", "png"];

/**
 * A photo spot (Glozin is photo-led). Uses public/images/home/<name>.webp|jpg|png
 * when it exists; until then, renders the designed fallback (children).
 */
export function MediaSlot({
	name,
	alt = "",
	sizes = "100vw",
	priority = false,
	className,
	children,
}: {
	name: string;
	alt?: string;
	sizes?: string;
	priority?: boolean;
	className?: string;
	children: React.ReactNode;
}) {
	const ext = EXTENSIONS.find((e) => existsSync(path.join(process.cwd(), "public/images/home", `${name}.${e}`)));
	if (!ext) return <>{children}</>;
	return (
		<Image
			src={`/images/home/${name}.${ext}`}
			alt={alt}
			fill
			sizes={sizes}
			priority={priority}
			className={cn("-z-10 object-cover", className)}
		/>
	);
}
