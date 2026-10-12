import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG, BLOG_PATH, formatPostDate, getPost, type Post, POSTS, postPath } from "@/lib/blog";
import { siteUrl } from "@/lib/site-url";
import { PostBody } from "../../../_components/blog/post-body";
import { PostCard } from "../../../_components/blog/post-card";
import { PostCover } from "../../../_components/blog/post-cover";
import { ShareButton } from "../../../_components/product/share-button";
import { jsonLdHtml } from "../../../_components/product-data";
import { container, eyebrow, sectionTitle } from "../../../_components/ui";

export const dynamicParams = false;
export const generateStaticParams = () => POSTS.map((p) => ({ slug: p.slug }));

async function load(params: Promise<{ slug: string }>) {
	const post = getPost((await params).slug);
	if (!post) notFound();
	return post;
}

export async function generateMetadata({ params }: PageProps<"/blogs/guides/[slug]">): Promise<Metadata> {
	const post = await load(params);
	const url = postPath(post.slug);
	return {
		title: { absolute: post.seo.title },
		description: post.seo.description,
		alternates: { canonical: url },
		openGraph: {
			type: "article",
			title: post.seo.title,
			description: post.seo.description,
			url,
			publishedTime: post.publishedAt,
			...(post.updatedAt && { modifiedTime: post.updatedAt }),
		},
	};
}

const words = (post: Post) =>
	post.body
		.flatMap((b) => ("text" in b ? [b.text].flat() : "items" in b ? b.items : "rows" in b ? b.rows.flat() : []))
		.join(" ")
		.split(/\s+/).length;

/** Article in Glozin's blog post layout (cover, pill, meta, narrow body, tags and share, prev/next, related). */
export default async function GuidePage({ params }: PageProps<"/blogs/guides/[slug]">) {
	const post = await load(params);
	const index = POSTS.findIndex((p) => p.slug === post.slug);
	const prev = POSTS[index + 1];
	const next = POSTS[index - 1];
	const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
	const url = `${siteUrl()}${postPath(post.slug)}`;
	const minutes = Math.max(1, Math.round(words(post) / 230));
	const jsonLd = [
		{
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: post.title,
			description: post.seo.description,
			datePublished: post.publishedAt,
			dateModified: post.updatedAt ?? post.publishedAt,
			mainEntityOfPage: url,
			author: { "@type": "Organization", name: "Parentkeeping", url: siteUrl() },
			publisher: { "@type": "Organization", name: "Parentkeeping", url: siteUrl() },
		},
		{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl()}/` },
				{ "@type": "ListItem", position: 2, name: BLOG.title, item: `${siteUrl()}${BLOG_PATH}` },
				{ "@type": "ListItem", position: 3, name: post.title, item: url },
			],
		},
	];

	return (
		<main className="flex-1">
			<script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
			<div className={`${container} pt-6`}>
				<nav aria-label="Breadcrumb" className="text-body mb-6 text-[13px]">
					<Link href="/" className="hover:text-foreground">
						Home
					</Link>
					<span className="mx-2">·</span>
					<Link href={BLOG_PATH} className="hover:text-foreground">
						{BLOG.title}
					</Link>
					<span className="mx-2">·</span>
					<span className="text-foreground">{post.title}</span>
				</nav>
				<PostCover post={post} priority sizes="(min-width: 1440px) 1350px, 100vw" className="aspect-[16/9] w-full md:aspect-[27/10]" />
			</div>

			<article className="mx-auto w-full max-w-[860px] px-4 pt-8 pb-12 sm:px-6 md:pb-[70px]">
				<header className="mb-10 grid justify-items-center gap-4 text-center">
					<span className="text-foreground rounded-full border px-5 py-1.5 text-[14px]">{post.category}</span>
					<h1 className="text-foreground text-[30px] leading-[1.15] font-semibold tracking-[-0.034em] md:text-[42px]">{post.title}</h1>
					<p className="text-body text-[14px]">
						Post by <span className="text-primary font-medium">Parentkeeping</span>
						<span className="mx-2">·</span>
						<time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
						<span className="mx-2">·</span>
						{minutes} min read
					</p>
				</header>

				<PostBody blocks={post.body} />

				{post.sources.length > 0 && (
					<div className="mt-8 grid gap-2 border-t pt-6">
						<p className={`${eyebrow} text-foreground`}>Sources</p>
						<ul className="text-body grid gap-1 text-[13px] leading-relaxed">
							{post.sources.map((s) => (
								<li key={s}>{s}</li>
							))}
						</ul>
					</div>
				)}

				<div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-foreground mr-1 text-sm font-semibold">Tags:</span>
						{post.tags.map((t) => (
							<span key={t} className="text-body rounded-full bg-[#f5f5f5] px-3.5 py-1 text-[13px]">
								{t}
							</span>
						))}
					</div>
					<div className="flex items-center gap-5">
						<span className="text-foreground text-sm font-semibold">Share:</span>
						<a
							href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}`}
							className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
						>
							<Mail className="size-4" />
							Email
						</a>
						<ShareButton title={post.title} />
					</div>
				</div>

				{(prev || next) && (
					<nav aria-label="More guides" className="mt-8 grid grid-cols-2 gap-6 border-t pt-6">
						<div>
							{prev && (
								<Link href={postPath(prev.slug)} className="group grid gap-1">
									<span className="text-body flex items-center gap-1 text-[12px] font-semibold tracking-[0.02em] uppercase">
										<ChevronLeft className="size-3.5" /> Previous post
									</span>
									<span className="text-foreground group-hover:text-primary text-[15px] font-semibold transition-colors">{prev.title}</span>
								</Link>
							)}
						</div>
						<div className="text-right">
							{next && (
								<Link href={postPath(next.slug)} className="group grid justify-items-end gap-1">
									<span className="text-body flex items-center gap-1 text-[12px] font-semibold tracking-[0.02em] uppercase">
										Next post <ChevronRight className="size-3.5" />
									</span>
									<span className="text-foreground group-hover:text-primary text-[15px] font-semibold transition-colors">{next.title}</span>
								</Link>
							)}
						</div>
					</nav>
				)}
			</article>

			<section className={`${container} border-t py-12 md:py-[70px]`}>
				<h2 className={`${sectionTitle} mb-8 text-center md:mb-10`}>Related Posts</h2>
				<div className="mx-auto grid max-w-[1100px] gap-8 sm:grid-cols-3 md:gap-[30px]">
					{related.map((p) => (
						<PostCard key={p.slug} post={p} compact />
					))}
				</div>
			</section>
		</main>
	);
}
