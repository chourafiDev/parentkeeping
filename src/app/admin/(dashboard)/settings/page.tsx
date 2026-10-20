import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { assetStatus } from "@/lib/assets";
import { storeDate } from "@/lib/store-time";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { files, productFiles, products } from "@/server/db/schema";
import { getProofStats } from "@/server/queries/reviews";
import { getSettings } from "@/server/queries/settings";
import { LaunchChecklist } from "./_components/launch-checklist";
import { SettingsForm } from "./_components/settings-form";

export const metadata: Metadata = { title: "Settings" };

/** Emergency Binder (the order bump): is it sellable and deliverable? */
async function getBumpProduct() {
	const [product] = await db
		.select({ id: products.id, status: products.status, stripePriceId: products.stripePriceId, price: products.price })
		.from(products)
		.where(eq(products.slug, "emergency-binder"));
	if (!product) return null;
	const assets = await db
		.select({ kind: files.kind, storageKey: files.storageKey, url: files.url, availableAt: files.availableAt })
		.from(productFiles)
		.innerJoin(files, eq(files.id, productFiles.fileId))
		.where(eq(productFiles.productId, product.id));
	const statuses = assets.map(assetStatus);
	return {
		...product,
		files: assets.length,
		fileStatus: statuses.includes("missing") || statuses.length === 0 ? "missing" : statuses.includes("presale") ? "presale" : "ready",
		availableAt: assets.find((a) => a.availableAt)?.availableAt ?? null,
	} as const;
}

export default async function SettingsPage() {
	const { user } = await requireStaffPage({ settings: ["read"] });
	const [{ pricing, checkout, contact, proof }, bump, proofStats] = await Promise.all([
		getSettings("pricing", "checkout", "contact", "proof"),
		getBumpProduct(),
		getProofStats(),
	]);

	const env = process.env;
	const services = {
		stripe: env.STRIPE_SECRET_KEY ? (env.STRIPE_SECRET_KEY.startsWith("sk_live_") ? "live" : "test") : null,
		storage: !!(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_PRIVATE_BUCKET && env.R2_PUBLIC_BUCKET && env.R2_PUBLIC_URL),
		email: !!(env.RESEND_API_KEY && env.EMAIL_FROM_ADDRESS),
		emailFrom: env.EMAIL_FROM_ADDRESS ?? null,
	} as const;

	return (
		<div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
			<SettingsForm
				readOnly={!hasPermission(user.role, { settings: ["update"] })}
				defaultValues={{
					pricing: { foundingEndsOn: pricing.foundingEndsAt ? storeDate(new Date(pricing.foundingEndsAt)) : null },
					checkout: { bumpEnabled: checkout.bumpEnabled },
					contact: {
						supportEmail: contact.supportEmail ?? "",
						privacyEmail: contact.privacyEmail ?? "",
						postalAddress: contact.postalAddress ?? "",
						phone: contact.phone ?? "",
					},
					proof,
				}}
				proofStats={proofStats}
				bump={bump && { ...bump, availableAt: bump.availableAt?.toISOString() ?? null }}
			/>
			<LaunchChecklist
				services={services}
				contact={contact}
				foundingEndsAt={pricing.foundingEndsAt}
				bump={bump ? { enabled: checkout.bumpEnabled, fileStatus: bump.fileStatus, hasPrice: !!bump.stripePriceId } : null}
			/>
		</div>
	);
}
