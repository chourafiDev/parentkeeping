"use client";

import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { FormCard } from "../../../_components/shared/form-card";

type TimelineEvent = {
	id: string;
	type: string;
	message: string | null;
	createdAt: string;
	actorName: string | null;
};

const DOT: Record<string, string> = {
	paid: "bg-green",
	refunded: "bg-destructive",
	flagged_non_us: "bg-amber-500",
	note: "bg-muted-foreground",
};

/** Order history (webhook, emails, support actions) plus internal notes. */
export function OrderTimeline({ orderId, events, canNote }: { orderId: string; events: TimelineEvent[]; canNote: boolean }) {
	const router = useRouter();
	const [note, setNote] = useState("");
	const [saving, setSaving] = useState(false);

	async function addNote(e: React.FormEvent) {
		e.preventDefault();
		if (!note.trim()) return;
		setSaving(true);
		const res = await api.api.admin.orders[":id"].notes.$post({ param: { id: orderId }, json: { text: note } });
		setSaving(false);
		if (!res.ok) {
			toast.error("Couldn't save the note");
			return;
		}
		setNote("");
		router.refresh();
	}

	return (
		<FormCard title="History">
			{canNote && (
				<form onSubmit={addNote} className="mb-4 grid gap-2">
					<Textarea
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Add a note for the team (only visible here)"
						aria-label="Note"
						rows={2}
						maxLength={2000}
					/>
					<Button type="submit" size="sm" variant="outline" className="justify-self-end" disabled={saving || !note.trim()}>
						{saving && <Loader className="size-4 animate-spin" />}
						Add note
					</Button>
				</form>
			)}
			{events.length === 0 ? (
				<p className="text-muted-foreground text-sm">Nothing recorded yet.</p>
			) : (
				<ol className="grid gap-3">
					{events.map((e) => (
						<li key={e.id} className="flex gap-3 text-sm">
							<span className={cn("bg-primary mt-1.5 size-2 shrink-0 rounded-full", DOT[e.type])} />
							<div className="grid min-w-0 gap-0.5">
								<span className={cn(e.type === "note" && "bg-muted/70 rounded-md px-2 py-1 whitespace-pre-wrap")}>{e.message}</span>
								<span className="text-muted-foreground text-xs">
									{format(new Date(e.createdAt), "MMM d, yyyy 'at' h:mm a")}
									{e.actorName ? ` · ${e.actorName}` : " · automatic"}
								</span>
							</div>
						</li>
					))}
				</ol>
			)}
		</FormCard>
	);
}
