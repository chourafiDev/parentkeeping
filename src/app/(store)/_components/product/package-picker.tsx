"use client";

import { useState } from "react";
import { formatStorePrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export type PackageOption = {
	id: string;
	slug: string;
	addon?: string;
	title: string;
	note: string;
	/** Cents, charged now. */
	price: number;
	compareAt?: number | null;
	badge?: string;
	/** Button label, before the price (includes " · Pre-order" when it applies). */
	cta: string;
};

/**
 * Pick-a-package radio cards (Medical Binder / the System / System +
 * Emergency Binder) feeding one Buy button. A plain form POST, so with
 * JavaScript off the pre-selected package still checks out.
 */
export function PackagePicker({
	options,
	defaultId,
	buttonClassName,
}: {
	options: PackageOption[];
	defaultId: string;
	buttonClassName: string;
}) {
	const [selectedId, setSelectedId] = useState(defaultId);
	const selected = options.find((o) => o.id === selectedId) ?? options[0];

	return (
		<form action="/api/checkout" method="post" className="grid gap-3">
			<fieldset className="grid gap-2.5">
				<legend className="text-foreground mb-2.5 text-[14px] font-semibold">
					Choose your package
				</legend>
				{options.map((o) => {
					const checked = o.id === selected.id;
					return (
						<label
							key={o.id}
							className={cn(
								"relative flex cursor-pointer items-center gap-3.5 rounded-[10px] border-2 bg-white px-4 py-3.5 transition-colors",
								checked
									? "border-primary"
									: "hover:border-foreground/40 border-[#e5e5e5]",
							)}
						>
							<input
								type="radio"
								name="package"
								value={o.id}
								checked={checked}
								onChange={() => setSelectedId(o.id)}
								className="accent-primary size-4 shrink-0"
							/>
							<span className="grid min-w-0 flex-1 gap-0.5">
								<span className="text-foreground text-[15px] leading-snug font-semibold">
									{o.title}
								</span>
								<span className="text-body text-[13px] leading-snug">
									{o.note}
								</span>
							</span>
							<span className="grid shrink-0 justify-items-end tabular-nums">
								<span className="text-foreground text-[16px] font-semibold">
									{formatStorePrice(o.price)}
								</span>
								{o.compareAt && (
									<span className="text-body text-[13px] line-through">
										{formatStorePrice(o.compareAt)}
									</span>
								)}
							</span>
							{o.badge && (
								<span className="bg-primary absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white">
									{o.badge}
								</span>
							)}
						</label>
					);
				})}
			</fieldset>
			<input type="hidden" name="slug" value={selected.slug} />
			{selected.addon && (
				<input type="hidden" name="addon" value={selected.addon} />
			)}
			<button type="submit" className={buttonClassName}>
				{selected.cta} · {formatStorePrice(selected.price)}
			</button>
		</form>
	);
}
