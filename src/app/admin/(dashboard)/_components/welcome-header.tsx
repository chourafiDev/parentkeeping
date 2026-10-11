"use client";

import { format } from "date-fns";
import { SITE } from "@/lib/site";

/** Dark banner at the top of the overview: greeting + today's date. */
export function WelcomeHeader({ name }: { name: string }) {
	const now = new Date();
	const firstName = name.split(/\s+/)[0] || name;

	return (
		<section className="mb-5 flex md:flex-row flex-col md:items-center items-start md:gap-10 gap-5 bg-deep md:py-10 py-6 px-8 rounded-2xl">
			<div>
				<h1 className="text-white text-xl font-medium tracking-[0.015rem] mb-0.5 flex items-center gap-3">
					Welcome back,{" "}
					<span className="text-[color-mix(in_oklab,var(--brand)_30%,white)] font-semibold">{firstName}</span>
				</h1>
				<p className="text-white/80 text-sm tracking-[0.010rem]">
					Manage {SITE.name} products, orders and subscribers in one place.
				</p>
			</div>

			<div className="flex items-center gap-3 md:border-l border-white/30 border-dashed md:pl-10">
				<div className="size-12 font-semibold rounded-full text-xl text-white border flex justify-center items-center">
					{format(now, "d")}
				</div>
				<div>
					<p className="text-white text-sm font-medium">{format(now, "EEE")}</p>
					<p className="text-white text-sm font-medium">{format(now, "MMMM")}</p>
				</div>
			</div>
		</section>
	);
}
