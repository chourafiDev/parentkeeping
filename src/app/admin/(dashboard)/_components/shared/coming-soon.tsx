import type { IconType } from "react-icons";

/** Placeholder card for an admin page that isn't built yet: what it will do. */
export function ComingSoon({
	icon: Icon,
	title,
	description,
	features,
}: {
	icon: IconType;
	title: string;
	description: string;
	features: string[];
}) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
			<div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-xl">
				<Icon className="size-5" />
			</div>
			<h1 className="text-lg font-semibold">{title}</h1>
			<p className="text-muted-foreground mt-1 max-w-md text-sm">{description}</p>
			<ul className="bg-muted/70 mt-6 grid w-full max-w-md gap-2 rounded-xl border border-dashed p-4 text-start text-sm">
				{features.map((f) => (
					<li key={f} className="flex gap-2">
						<span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
						{f}
					</li>
				))}
			</ul>
		</div>
	);
}
