"use client"; // Error boundaries must be Client Components

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Admin page error (inside the sidebar layout): retry or back to the dashboard. */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
			<div className="bg-destructive/10 text-destructive mb-4 flex size-12 items-center justify-center rounded-full">
				<TriangleAlert className="size-5" />
			</div>
			<h1 className="text-lg font-semibold">Something went wrong</h1>
			<p className="text-muted-foreground mt-1 max-w-md text-sm">
				This page couldn&apos;t load. Try again; if it keeps happening, note the code below.
			</p>
			{error.digest && <p className="text-muted-foreground mt-2 font-mono text-xs">Code: {error.digest}</p>}
			<div className="mt-6 flex gap-2">
				<Button onClick={() => retry()}>
					<RotateCcw className="size-4" />
					Try again
				</Button>
				<Button asChild variant="outline">
					<Link href="/admin">Overview</Link>
				</Button>
			</div>
		</div>
	);
}
