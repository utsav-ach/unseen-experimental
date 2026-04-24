"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	Camera,
	AlertCircle,
	BookOpen,
	CircleDollarSign,
	ClipboardList,
	UserRound,
	Users,
	BadgeCheck,
	Handshake,
} from "lucide-react";
import { AdminMetricSnapshot } from "@/backend/schemas";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminDashboardMetricCard } from "./dashboard/admin-dashboard-metric-card";
import { AdminDashboardTrendChart } from "./dashboard/admin-dashboard-trend-chart";
import { AdminDashboardStatusChart } from "./dashboard/admin-dashboard-status-chart";
import { AdminDashboardTopList } from "./dashboard/admin-dashboard-top-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const rangeOptions = [
	{ label: "24 hours", value: "1" },
	{ label: "7 days", value: "7" },
	{ label: "30 days", value: "30" },
];

const currencyFormatter = new Intl.NumberFormat("en-NP", {
	style: "currency",
	currency: "NPR",
	maximumFractionDigits: 0,
});

const metricCards: Array<{
	key: keyof AdminMetricSnapshot;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	tone?: "success" | "warning" | "neutral";
	formatter?: (value: number) => string;
}> = [
	{ key: "total_users", label: "Total users", icon: Users },
	{
		key: "new_users_in_range",
		label: "New users",
		icon: UserRound,
		tone: "success",
	},
	{ key: "new_stories_in_range", label: "New stories", icon: BookOpen },
	{ key: "new_photos_in_range", label: "New photos", icon: Camera },
	{
		key: "new_booking_requests_in_range",
		label: "Booking requests",
		icon: ClipboardList,
		tone: "warning",
	},
	{
		key: "confirmed_bookings_in_range",
		label: "Confirmed bookings",
		icon: BadgeCheck,
		tone: "success",
	},
	{
		key: "pending_guide_applications",
		label: "Pending guide applications",
		icon: Handshake,
		tone: "warning",
	},
	{
		key: "total_booking_amount_in_range",
		label: "Booking amount",
		icon: CircleDollarSign,
		formatter: (value) => currencyFormatter.format(value),
	},
	{
		key: "total_negotiated_amount_in_range",
		label: "Negotiated amount",
		icon: CircleDollarSign,
		formatter: (value) => currencyFormatter.format(value),
	},
];

export function AdminDashboardPage() {
	const { dashboard, isLoading, error, fetchDashboard } = useAdminStore();
	const [range, setRange] = useState("7");
	const [isRefreshing, setIsRefreshing] = useState(false);

	const rangeLabel = useMemo(
		() =>
			rangeOptions.find((option) => option.value === range)?.label ??
			`${range} days`,
		[range],
	);

	useEffect(() => {
		void fetchDashboard(Number(range));
	}, [fetchDashboard, range]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await fetchDashboard(Number(range));
		const latestError = useAdminStore.getState().error;
		if (latestError) {
			toast.error("Dashboard refresh failed", {
				description: latestError,
			});
			setIsRefreshing(false);
			return;
		}
		toast.success("Dashboard refreshed", {
			description: `Latest data loaded for ${rangeLabel}.`,
		});
		setIsRefreshing(false);
	};

	return (
		<main className="space-y-6">
			<AdminPageHeader
				title="Admin dashboard"
				description="Monitor growth, booking flow, and moderation queues from one place."
				action={
					<div className="flex flex-wrap items-center gap-2">
						<div className="w-36">
							<Select value={range} onValueChange={setRange}>
								<SelectTrigger>
									<SelectValue placeholder="Range" />
								</SelectTrigger>
								<SelectContent>
									{rangeOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button
							variant="outline"
							onClick={() => void handleRefresh()}
							disabled={isRefreshing || isLoading}>
							{isRefreshing ? "Refreshing..." : "Refresh"}
						</Button>
					</div>
				}
			/>

			{error ? (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Dashboard failed to load</AlertTitle>
					<AlertDescription className="space-y-2">
						<p>{error}</p>
						<Button
							size="sm"
							variant="outline"
							onClick={() => void handleRefresh()}>
							Retry now
						</Button>
					</AlertDescription>
				</Alert>
			) : null}

			<section
				aria-label="Key metrics"
				className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				{metricCards.map((item) => {
					const rawValue = dashboard?.metrics?.[item.key] ?? 0;
					return (
						<AdminDashboardMetricCard
							key={item.key}
							label={item.label}
							icon={item.icon}
							tone={item.tone}
							value={
								item.formatter
									? item.formatter(rawValue)
									: rawValue.toLocaleString("en-NP")
							}
							subtitle={`Range: ${rangeLabel}`}
							loading={isLoading && !dashboard}
						/>
					);
				})}
			</section>

			<section
				aria-label="Charts"
				className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<AdminDashboardTrendChart
					title="User growth trend"
					description="Daily new user signups in the selected range."
					points={dashboard?.user_growth ?? []}
					loading={isLoading && !dashboard}
				/>

				<AdminDashboardStatusChart
					title="Booking request status"
					description="Current negotiation states requested by users."
					rows={dashboard?.booking_request_status_breakdown ?? []}
					loading={isLoading && !dashboard}
				/>

				<AdminDashboardStatusChart
					title="Booking lifecycle status"
					description="Final booking states for fulfilled and cancelled trips."
					rows={dashboard?.booking_status_breakdown ?? []}
					loading={isLoading && !dashboard}
				/>
			</section>

			<section
				aria-label="Top demand"
				className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<AdminDashboardTopList
					title="Top requested destinations"
					description="Most requested destinations from negotiation flow."
					emptyMessage="No destination demand data in this range."
					rows={dashboard?.top_requested_destinations ?? []}
					loading={isLoading && !dashboard}
				/>

				<AdminDashboardTopList
					title="Top requested guides"
					description="Guides receiving the most request volume."
					emptyMessage="No guide demand data in this range."
					rows={dashboard?.top_requested_guides ?? []}
					loading={isLoading && !dashboard}
					showAvatars
				/>
			</section>
		</main>
	);
}
