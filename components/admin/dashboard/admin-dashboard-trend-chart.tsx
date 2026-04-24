import { AdminChartPoint } from "@/backend/schemas";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface AdminDashboardTrendChartProps {
	title: string;
	description: string;
	points: AdminChartPoint[];
	loading?: boolean;
}

export function AdminDashboardTrendChart({
	title,
	description,
	points,
	loading = false,
}: AdminDashboardTrendChartProps) {
	return (
		<Card className="xl:col-span-1">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="h-72">
				{loading ? (
					<Skeleton className="h-full w-full" />
				) : points.length ? (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={points}
							margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
							<CartesianGrid
								stroke="var(--border)"
								strokeDasharray="3 3"
							/>
							<XAxis
								dataKey="day"
								stroke="var(--muted-foreground)"
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								allowDecimals={false}
								stroke="var(--muted-foreground)"
								tickLine={false}
								axisLine={false}
							/>
							<Tooltip
								cursor={{
									stroke: "var(--border)",
									strokeDasharray: "4 4",
								}}
								contentStyle={{
									borderRadius: 10,
									borderColor: "var(--border)",
									backgroundColor: "var(--card)",
								}}
							/>
							<Line
								type="monotone"
								dataKey="count"
								stroke="var(--primary)"
								strokeWidth={2.5}
								dot={{
									fill: "var(--primary)",
									strokeWidth: 0,
									r: 3,
								}}
								activeDot={{ r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
						No trend data in this range.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
