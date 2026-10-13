import { container, section, sectionTitle } from "./ui";

export function InsideGrid({
	title,
	items,
}: {
	title: string;
	items: { name: string; text: string; meta?: string }[];
}) {
	return (
		<section className={`${container} ${section} border-t`}>
			<h2 className={`${sectionTitle} mb-8 text-center md:mb-10`}>{title}</h2>
			<ol className="grid gap-4 sm:grid-cols-2 md:gap-[30px] lg:grid-cols-3">
				{items.map((item, i) => (
					<li
						key={item.name}
						className="grid content-start gap-2 rounded-[10px] bg-[#f5f5f5] p-6"
					>
						<span className="text-primary text-[13px] font-semibold tabular-nums">
							{String(i + 1).padStart(2, "0")}
						</span>
						<h3 className="text-foreground text-[18px] leading-snug font-semibold tracking-[-0.02em]">
							{item.name}
						</h3>
						<p className="text-body text-[15px] leading-[1.714]">{item.text}</p>
						{item.meta && (
							<p className="text-foreground mt-1 text-[13px] font-medium">
								{item.meta}
							</p>
						)}
					</li>
				))}
			</ol>
		</section>
	);
}
