import Link from "next/link";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { Button } from "@/components/ui/button";

// Shown inside the admin layout when a page calls notFound()
// (e.g. a deleted product or an order id that doesn't exist).
export default function AdminNotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
			<div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
				<HiMagnifyingGlass className="size-5" />
			</div>
			<h1 className="text-lg font-semibold">Page not found</h1>
			<p className="text-muted-foreground max-w-sm text-sm">
				This item doesn&apos;t exist or was deleted. Check the link or go back to the overview.
			</p>
			<Button asChild className="mt-2">
				<Link href="/admin">Back to overview</Link>
			</Button>
		</div>
	);
}
