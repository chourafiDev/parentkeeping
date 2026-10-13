import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { cn } from "@/lib/utils";

const EXTENSIONS = ["webp", "jpg", "png"];

export function MediaSlot({
	name,
	dir = "home",
	alt = "",
	sizes = "100vw",
	priority = false,
	className,
	children,
}: {
	name: string;
	/** Folder under public/images ("home", "blog"). */
	dir?: string;
	alt?: string;
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
			fill
			sizes={sizes}
			priority={priority}
			className={cn("-z-10 object-cover", className)}
		/>
	);
}
