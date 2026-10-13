import { Check, FileArchive, FileText } from "lucide-react";
import { formatBytes } from "@/lib/assets";
import { formatStorePrice } from "@/lib/money";
import { ONE_PRICE_BADGE } from "@/lib/offer";
import type { ProductCopy } from "@/lib/product-copy";
import { formatStoreDay } from "@/lib/store-time";
import { container, eyebrow, section, sectionTitle } from "../ui";

type Asset = { id: string; kind: string; label: string; fileName: string | null; sizeBytes: number | null; availableAt: Date | null };

/** "Everything in the download": the full list, the files, the price and the Buy button. */
export function ProductDownloadCard({
	inside,
	arrivesBy,
	assets,
	price,
	compareAt,
	buy,
	smallPrint,
}: {
	inside: ProductCopy["inside"];
	/** Per item: its pre-sale date, if any. */
	arrivesBy: (Date | null)[];
	assets: Asset[];
	price: number;
	compareAt: number | null;
	buy: React.ReactNode;
	smallPrint: React.ReactNode;
}) {
	return (
		<section className={`${container} ${section} border-t`}>
			<div className="mx-auto mb-10 grid max-w-[760px] gap-3 text-center">
				<p className={`${eyebrow} text-primary`}>What you get</p>
				<h2 className={sectionTitle}>{inside.title}</h2>
			</div>
			<div className="mx-auto grid max-w-[760px] gap-8 rounded-[10px] border bg-white p-6 shadow-[0_20px_50px_-30px_rgb(0_0_0/0.25)] md:p-10">
				<ul className="grid gap-5">
					{inside.items.map((item, i) => (
						<li key={item.name} className="flex gap-3.5">
							<span className="bg-foreground mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white">
								<Check className="size-3" strokeWidth={3} />
							</span>
							<div className="grid gap-0.5">
								<p className="text-foreground flex flex-wrap items-center gap-2 text-[15px] font-semibold">
									{item.name}
									{arrivesBy[i] && (
										<span className="rounded-full bg-[#6c4cf1] px-2 py-0.5 text-[11px] font-semibold text-white">
											Arrives by {formatStoreDay(arrivesBy[i]!)}
										</span>
									)}
								</p>
								<p className="text-body text-[14px] leading-relaxed">{item.text}</p>
								{item.meta && <p className="text-foreground text-[13px] font-medium">{item.meta}</p>}
							</div>
						</li>
					))}
				</ul>

				{assets.length > 0 && (
					<ul className="grid gap-2 rounded-[10px] bg-[#f5f5f5] p-4" aria-label="Files">
						{assets.map((a) => {
							const Icon = a.kind === "pdf" ? FileText : FileArchive;
							return (
								<li key={a.id} className="flex items-center gap-2.5 text-[14px]">
									<Icon className="text-foreground size-4 shrink-0" />
									<span className="text-foreground min-w-0 flex-1 truncate">{a.fileName ?? a.label}</span>
									<span className="text-body shrink-0 text-[13px]">
										{a.availableAt ? `Arrives by ${formatStoreDay(a.availableAt)}` : a.sizeBytes ? formatBytes(a.sizeBytes) : ""}
									</span>
								</li>
							);
						})}
					</ul>
				)}

				<div className="grid justify-items-center gap-4 border-t pt-8 text-center">
					<p className="text-foreground flex flex-wrap items-baseline justify-center gap-x-2 text-[18px] font-semibold tabular-nums">
						<span>{formatStorePrice(price)}</span>
						{compareAt && <span className="text-body text-[15px] font-normal line-through">{formatStorePrice(compareAt)}</span>}
						<span className="text-body text-[15px] font-normal">· {ONE_PRICE_BADGE}</span>
					</p>
					<div className="w-full max-w-[360px]">{buy}</div>
					<div className="text-body grid gap-1 text-[13px]">{smallPrint}</div>
				</div>
			</div>
		</section>
	);
}
