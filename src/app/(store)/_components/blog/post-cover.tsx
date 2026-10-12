import { BookOpen, HandCoins, MessagesSquare, Pill, Sparkles } from "lucide-react";
import type { Post } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { MediaSlot } from "../home/media-slot";
import { media } from "../ui";

const TONES: Record<string, { bg: string; Icon: typeof Pill }> = {
	Medications: { bg: "bg-[#5d6b63]", Icon: Pill },
	"Dementia care": { bg: "bg-[#6b7a86]", Icon: Sparkles },
	Costs: { bg: "bg-[#7a6a5d]", Icon: HandCoins },
	"Family conversations": { bg: "bg-[#4F6F5A]", Icon: MessagesSquare },
};

/**
 * Post photo: public/images/blog/<slug>.webp|jpg|png once it exists; until
 * then a colored panel per category (Glozin's blog is photo-led).
 */
export function PostCover({ post, className, sizes, priority }: { post: Post; className?: string; sizes?: string; priority?: boolean }) {
	const tone = TONES[post.category] ?? { bg: "bg-deep", Icon: BookOpen };
	return (
		<div className={cn(media, tone.bg, "flex items-center justify-center text-white", className)}>
			<MediaSlot dir="blog" name={post.slug} alt={post.title} sizes={sizes} priority={priority} className="transition-transform duration-700 group-hover:scale-105">
				<span aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_70%_at_70%_20%,rgb(255_255_255/0.18)_0%,transparent_70%)]" />
				<tone.Icon aria-hidden className="size-14 opacity-80 transition-transform duration-700 group-hover:scale-110" strokeWidth={1.25} />
			</MediaSlot>
		</div>
	);
}
