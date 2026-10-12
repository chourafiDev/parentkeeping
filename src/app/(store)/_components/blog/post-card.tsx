import Link from "next/link";
import { excerpt, formatPostDate, type Post, postPath } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { PostCover } from "./post-cover";

/** Glozin blog card: photo, category pill, title, excerpt, "Post by … date". */
export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
	const href = postPath(post.slug);
	return (
		<article className={cn("group grid content-start", compact ? "gap-3" : "justify-items-center gap-4 text-center")}>
			<Link href={href} className="block w-full" tabIndex={-1} aria-hidden>
				<PostCover post={post} className="aspect-[16/9] w-full" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
			</Link>
			{!compact && (
				<span className="text-foreground mt-3 rounded-full border px-6 py-2 text-[15px]">{post.category}</span>
			)}
			<h3 className={cn("text-foreground font-semibold tracking-[-0.03em]", compact ? "text-[16px] leading-snug" : "text-[22px] leading-tight md:text-[26px]")}>
				<Link href={href} className="hover:text-primary transition-colors">
					{post.title}
				</Link>
			</h3>
			<p className={cn("text-body", compact ? "text-[14px] leading-relaxed" : "text-[16px] leading-[1.7]")}>{excerpt(post)}</p>
			<p className={cn("text-body", compact ? "text-[13px]" : "text-[15px]")}>
				Post by <span className="text-primary font-medium">Parentkeeping</span>
				<span className="ml-3">{formatPostDate(post.publishedAt)}</span>
			</p>
		</article>
	);
}
