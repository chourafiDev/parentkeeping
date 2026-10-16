import "server-only";
import { MIN_FAMILIES, MIN_ORDERS_FOR_REFUND_RATE, familiesLabel, refundRateLabel } from "@/lib/social-proof";
import { getProofStats } from "./reviews";
import { getSettings } from "./settings";

/**
 * What the store may show right now: each line needs the owner's switch
 * (Settings → Social proof) and enough real data. null = show nothing.
 */
export async function getSocialProof() {
	const [{ proof }, stats] = await Promise.all([getSettings("proof"), getProofStats()]);
	return {
		families: proof.showFamilies && stats.families >= MIN_FAMILIES ? familiesLabel(stats.families) : null,
		refundRate:
			proof.showRefundRate && stats.settledOrders >= MIN_ORDERS_FOR_REFUND_RATE && stats.refundRate !== null
				? refundRateLabel(stats.refundRate)
				: null,
	};
}

export type SocialProof = Awaited<ReturnType<typeof getSocialProof>>;
