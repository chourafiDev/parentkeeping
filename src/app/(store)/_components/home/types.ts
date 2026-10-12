// Data the home sections share (loaded once in app/(store)/page.tsx).

export type HomeProduct = {
	slug: string;
	title: string;
	href: string;
	/** Price shown now (founding price while the window is open), in cents. */
	price: number;
	/** Struck-through regular price when a founding price applies. */
	compareAt: number | null;
	/** Has "arrives by" parts. */
	presale: boolean;
	/** Can be bought right now (active + Stripe price). */
	sellable: boolean;
};

export type HomeData = {
	variant: "fairness" | "one_place";
	usVisitor: boolean;
	system: HomeProduct;
	binder: HomeProduct | null;
	agreement: HomeProduct | null;
	foundingEndsAt: Date | null;
	/** "Arrives by" date per part file label prefix. */
	presaleDates: { label: string; availableAt: Date }[];
	checkoutError: string | null;
};
