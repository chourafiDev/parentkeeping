import { FREE_LIST_PATH } from "@/lib/free-list";
import { formatStorePrice } from "@/lib/money";
import { container, eyebrow, media, pillLight } from "../ui";
import { DocMockup } from "./doc-mockup";
import { MediaSlot } from "./media-slot";
import type { HomeData } from "./types";

const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });

/** Glozin's two side-by-side colored banners: the System offer and the free list. */
export function PromoPair({ data }: { data: HomeData }) {
	const { system } = data;
	const cards = [
		{
			name: "promo-system",
			tone: "bg-[#5d6b63]",
			eyebrow: data.foundingEndsAt ? `Founding price until ${fmtDay(data.foundingEndsAt)}` : "One price. No subscription.",
			title: "The Family Care System",
			text: `All four parts for ${formatStorePrice(system.price)}${system.compareAt ? ` instead of ${formatStorePrice(system.compareAt)}` : ""}.`,
			cta: "See what's inside",
			href: "#bundle",
			mock: <DocMockup kind="bundle" title="Family Care System" tilt={-5} />,
		},
		{
			name: "promo-free-list",
			tone: "bg-[#7a6a5d]",
			eyebrow: "Free printable",
			title: "Medication List & Daily Chart",
			text: "Not ready yet? Start with the free list. Works anywhere.",
			cta: "Get it free",
			href: FREE_LIST_PATH,
			mock: <DocMockup kind="list" title="Medication List" tilt={5} />,
		},
	];
	return (
		<section className={`${container} grid gap-[30px] py-6 md:grid-cols-2 md:py-[30px]`}>
			{cards.map((c) => (
				<div key={c.name} className={`${media} ${c.tone} flex min-h-[340px] items-center text-white md:min-h-[400px]`}>
					<MediaSlot name={c.name} sizes="(min-width: 768px) 50vw, 100vw">
						<div aria-hidden className="absolute top-1/2 right-[6%] -z-10 w-[34%] max-w-[200px] -translate-y-1/2">
							{c.mock}
						</div>
					</MediaSlot>
					<div className="grid max-w-[60%] justify-items-start gap-3 p-6 md:p-10">
						<p className={eyebrow}>{c.eyebrow}</p>
						<h2 className="text-[26px] leading-tight font-semibold tracking-[-0.034em] md:text-[30px]">{c.title}</h2>
						<p className="text-[15px] text-white/85">{c.text}</p>
						<a href={c.href} className={`${pillLight} mt-2 min-w-0`}>
							{c.cta}
						</a>
					</div>
				</div>
			))}
		</section>
	);
}
