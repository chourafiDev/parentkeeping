import Link from "next/link";
import { Fragment } from "react";

const TOKENS = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

/** Blog inline text: **bold** and [label](/path) links, nothing else. */
export function Inline({ text }: { text: string }) {
	return (
		<>
			{text.split(TOKENS).map((part, i) => {
				if (part.startsWith("**") && part.endsWith("**")) {
					return (
						<strong key={i} className="text-foreground font-semibold">
							{part.slice(2, -2)}
						</strong>
					);
				}
				const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
				if (link) {
					return (
						<Link key={i} href={link[2]} className="text-foreground hover:text-primary font-medium underline underline-offset-4">
							{link[1]}
						</Link>
					);
				}
				return <Fragment key={i}>{part}</Fragment>;
			})}
		</>
	);
}
