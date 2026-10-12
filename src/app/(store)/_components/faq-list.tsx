import { Plus } from "lucide-react";
import Link from "next/link";
import type { FaqItem } from "@/lib/offer";

/** Glozin's flat FAQ accordion (home, product and free-download pages). */
export function FaqList({ items }: { items: FaqItem[] }) {
	return (
		<div className="border-t">
			{items.map((item) => (
				<details key={item.q} className="group border-b py-5">
					<summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
						{item.q}
						<Plus className="size-5 shrink-0 transition-transform group-open:rotate-45" />
					</summary>
					<p className="text-body mt-3 text-[15px] leading-[1.714]">
						{item.a}
						{item.link && (
							<>
								{" "}
								<Link href={item.link.href} className="text-foreground hover:text-primary font-semibold underline underline-offset-2">
									{item.link.label}
								</Link>
							</>
						)}
					</p>
				</details>
			))}
		</div>
	);
}
