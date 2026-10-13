import { container, eyebrow, media } from "../ui";

/** Slate's closing dark banner (our deep sage, as on the home page). */
export function ProductClosingBanner({ eyebrowText, title, text, children }: { eyebrowText: string; title: string; text: string; children: React.ReactNode }) {
	return (
		<section className={`${container} py-12 md:py-[70px]`}>
			<div className={`${media} bg-deep flex min-h-[360px] items-center justify-center px-6 py-14 text-center text-white md:min-h-[420px]`}>
				<span
					aria-hidden
					className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,color-mix(in_oklab,var(--brand)_60%,transparent)_0%,transparent_70%)]"
				/>
				<div className="grid max-w-[640px] justify-items-center gap-4">
					<p className={eyebrow}>{eyebrowText}</p>
					<h2 className="text-[30px] leading-[1.15] font-semibold tracking-[-0.034em] md:text-[38px]">{title}</h2>
					<p className="text-[16px] leading-relaxed text-white/85">{text}</p>
					<div className="mt-2 grid justify-items-center gap-3">{children}</div>
				</div>
			</div>
		</section>
	);
}
