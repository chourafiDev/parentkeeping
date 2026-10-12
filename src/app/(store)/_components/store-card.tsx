/** Centered card used by the buyer pages (thank-you, downloads) until the store design lands. */
export function StoreCard({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
	return (
		<main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-16">
			<div className={`bg-card w-full rounded-2xl border p-4 sm:p-8 ${wide ? "max-w-2xl" : "max-w-lg"}`}>{children}</div>
		</main>
	);
}
