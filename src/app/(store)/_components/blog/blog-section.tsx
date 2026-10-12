import Link from "next/link";
import { BLOG, BLOG_PATH, POSTS } from "@/lib/blog";
import { container, section, sectionSubtitle, sectionTitle } from "../ui";
import { PostCard } from "./post-card";

/** Glozin's home "The Blog" section: the three newest guides. */
export function BlogSection() {
	return (
		<section className={`${container} ${section}`}>
			<div className="mb-8 grid gap-2 text-center md:mb-10">
				<h2 className={sectionTitle}>The Guides</h2>
				<p className={sectionSubtitle}>{BLOG.intro}</p>
			</div>
			<div className="grid gap-10 md:grid-cols-3 md:gap-[30px]">
				{POSTS.slice(0, 3).map((post) => (
					<PostCard key={post.slug} post={post} />
				))}
			</div>
			<div className="mt-10 text-center">
				<Link href={BLOG_PATH} className="text-foreground hover:text-primary text-[15px] font-semibold underline underline-offset-4">
					View all guides
				</Link>
			</div>
		</section>
	);
}
