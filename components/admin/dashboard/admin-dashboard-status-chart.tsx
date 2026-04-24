import { AdminStatusCount } from "@/backend/schemas";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface AdminDashboardStatusChartProps {
	title: string;
	description: string;
	rows: AdminStatusCount[];
	loading?: boolean;
}

export function AdminDashboardStatusChart({
	title,
	description,
	rows,
	loading = false,
}: AdminDashboardStatusChartProps) {
	const normalizedRows = rows.map((row) => ({
		...row,
		status: row.status.replaceAll("_", " "),
	}));

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="h-72">
				{loading ? (
					<Skeleton className="h-full w-full" />
				) : normalizedRows.length ? (
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={normalizedRows}
							margin={{
								top: 8,
								right: 8,
								left: -20,
								bottom: 20,
							}}>
							<CartesianGrid
								vertical={false}
								stroke="var(--border)"
								strokeDasharray="3 3"
							/>
							<XAxis
								dataKey="status"
								stroke="var(--muted-foreground)"
								tickLine={false}
								axisLine={false}
								angle={-20}
								textAnchor="end"
								height={56}
								interval={0}
							/>
							<YAxis
								allowDecimals={false}
								stroke="var(--muted-foreground)"
								tickLine={false}
								axisLine={false}
							/>
							<Tooltip
								contentStyle={{
									borderRadius: 10,
									borderColor: "var(--border)",
									backgroundColor: "var(--card)",
								}}
							/>
							<Bar
								dataKey="count"
								radius={[8, 8, 0, 0]}
								fill="var(--primary)"
							/>
						</BarChart>
					</ResponsiveContainer>
				) : (
					<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
						No status data in this range.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
