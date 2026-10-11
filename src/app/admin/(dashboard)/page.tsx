import {
	LuCircleDollarSign,
	LuMailPlus,
	LuPackagePlus,
	LuShoppingBag,
} from "react-icons/lu";
import { formatUsd } from "@/lib/money";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { KpiCard } from "./_components/shared/kpi-card";
import { WelcomeHeader } from "./_components/welcome-header";

const PERIOD = "Last 30 days";

// Figures are placeholders until orders and sign-ups are recorded
// (Stripe webhook + /api/subscribe). The metrics come from the spec.
export default async function OverviewPage() {
	const { user } = await requireStaffPage();
	const canSeeRevenue = hasPermission(user.role, { finance: ["read"] });

	return (
		<>
			<WelcomeHeader name={user.name} />
			<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{canSeeRevenue && (
					<KpiCard
						icon={LuCircleDollarSign}
						title="Revenue"
						value={formatUsd(0)}
						period={PERIOD}
						hint="Paid orders minus refunds, before sales tax."
					/>
				)}
				<KpiCard
					icon={LuShoppingBag}
					title="Orders"
					value={0}
					period={PERIOD}
					hint="Paid orders from Stripe Checkout."
				/>
				<KpiCard
					icon={LuPackagePlus}
					title="Bump take rate"
					value="—"
					suffix="%"
					period={PERIOD}
					hint="Share of Family Care System orders that added the Emergency Binder."
				/>
				<KpiCard
					icon={LuMailPlus}
					title="Sign-ups"
					value={0}
					period={PERIOD}
					hint="Free Medication List sign-ups."
				/>
			</section>
		</>
	);
}
