import { Card, CardContent } from "@/components/ui/card";

type DashboardStatsProps = {
	stats?: {
		stories_count?: number;
		photos_count?: number;
		bookings_count?: number;
		completed_bookings_count?: number;
		booking_requests_sent_count?: number;
		booking_requests_received_count?: number;
	} | null;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
	const items = [
		{ label: "Stories", value: stats?.stories_count ?? 0 },
		{ label: "Photos", value: stats?.photos_count ?? 0 },
		{ label: "Bookings", value: stats?.bookings_count ?? 0 },
		{ label: "Completed", value: stats?.completed_bookings_count ?? 0 },
		{
			label: "Requests sent",
			value: stats?.booking_requests_sent_count ?? 0,
		},
		{
			label: "Requests received",
			value: stats?.booking_requests_received_count ?? 0,
		},
	];

	return (
		<section
			className="grid grid-cols-2 gap-3 md:grid-cols-3"
			aria-label="Profile stats">
			{items.map((item) => (
				<Card key={item.label} className="border-border">
					<CardContent className="p-4">
						<p className="text-lg font-semibold text-foreground">
							{item.value}
						</p>
						<p className="text-xs text-muted-foreground">
							{item.label}
						</p>
					</CardContent>
				</Card>
			))}
		</section>
	);
}
