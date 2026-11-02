import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { cn } from "@/lib/utils";

const EXTENSIONS = ["webp", "jpg", "png"];

export function MediaSlot({
	name,
	dir = "home",
	alt = "",
	title,
	sizes = "100vw",
	priority = false,
	className,
	children,
}: {
	name: string;
	/** Folder under public/images ("home", "blog"). */
	dir?: string;
	alt?: string;
	/** Tooltip text (rarely needed; the alt does the describing). */
	title?: string;
	sizes?: string;
	priority?: boolean;
	className?: string;
	children: React.ReactNode;
}) {
	const ext = EXTENSIONS.find((e) =>
		existsSync(path.join(process.cwd(), "public/images", dir, `${name}.${e}`)),
	);
	if (!ext) return <>{children}</>;
	return (
		<Image
			src={`/images/${dir}/${name}.${ext}`}
			alt={alt}
			title={title}
			fill
			sizes={sizes}
			// Next 16: `preload` replaces the deprecated `priority` (the hero is the LCP image).
			preload={priority}
			fetchPriority={priority ? "high" : undefined}
			className={cn("-z-10 object-cover", className)}
		/>
	);
}
