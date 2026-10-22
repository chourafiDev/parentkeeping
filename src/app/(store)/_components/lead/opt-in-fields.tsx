"use client";

import { useSyncExternalStore } from "react";
import { EU_NEWSLETTER_CHECKBOX } from "@/lib/legal";
import { cn } from "@/lib/utils";
import { isOptInCountry, readCountryCookie } from "@/lib/visitor-country";

const noSubscription = () => () => {};

/**
 * The EU/UK newsletter checkbox and the notice under a sign-up form, decided
 * in the browser so the page around it can be cached. Until hydration the
 * country is unknown, so neither the box nor a possibly-wrong notice shows
 * (the notice line keeps its space to avoid a layout jump).
 */
export function OptInFields({
	notice,
	euNotice,
	dark = false,
	noticeClassName,
	children,
}: {
	/** Notice for everyone outside the EU/UK. */
	notice: string;
	/** Notice for EU/UK visitors, who get the unticked box. */
	euNotice: string;
	dark?: boolean;
	noticeClassName?: string;
	/** Appended after the notice (the Privacy Policy link). */
	children?: React.ReactNode;
}) {
	// undefined on the server and during hydration: country not known yet.
	const country = useSyncExternalStore(noSubscription, readCountryCookie, () => undefined);
	const known = country !== undefined;
	const optIn = known && isOptInCountry(country);

	return (
		<>
			{optIn && (
				<label className={cn("flex items-start gap-2.5 text-sm", dark ? "text-white/85" : "text-foreground")}>
					{/* Unticked by default: the file comes either way. */}
					<input type="checkbox" name="newsletter" className="accent-primary mt-0.5 size-4" />
					<span>{EU_NEWSLETTER_CHECKBOX}</span>
				</label>
			)}
			<p className={cn(noticeClassName, !known && "invisible")} aria-hidden={!known}>
				{optIn ? euNotice : notice} {children}
			</p>
		</>
	);
}
