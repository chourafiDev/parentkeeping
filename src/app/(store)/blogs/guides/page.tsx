import type { Metadata } from "next";
import Link from "next/link";
import { BLOG, BLOG_PATH, POSTS } from "@/lib/blog";
import { PostCard } from "../../_components/blog/post-card";
import { container, sectionSubtitle } from "../../_components/ui";

export const metadata: Metadata = {
	title: { absolute: BLOG.seo.title },
	description: BLOG.seo.description,
	alternates: { canonical: BLOG_PATH },
	openGraph: { title: BLOG.seo.title, description: BLOG.seo.description, url: BLOG_PATH },
};

/** Blog index in Glozin's blog grid. */
export default function GuidesPage() {
	return (
		<main className="flex-1">
			<div className={`${container} pt-6 pb-12 md:pb-[70px]`}>
				<nav aria-label="Breadcrumb" className="text-body mb-6 text-[13px]">
					<Link href="/" className="hover:text-foreground">
						Home
					</Link>
					<span className="mx-2">·</span>
					<span className="text-foreground">{BLOG.title}</span>
				</nav>
				<div className="mb-10 grid gap-2 text-center md:mb-14">
					<h1 className="text-foreground text-[34px] leading-tight font-semibold tracking-[-0.034em] md:text-[44px]">{BLOG.title}</h1>
					<p className={`${sectionSubtitle} mx-auto max-w-[620px]`}>{BLOG.intro}</p>
				</div>
				<div className="grid gap-x-[30px] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
					{POSTS.map((post) => (
						<PostCard key={post.slug} post={post} />
					))}
				</div>
			</div>
		</main>
	);
}
