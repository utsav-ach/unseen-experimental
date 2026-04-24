import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdminDashboardMetricCardProps {
	label: string;
	value: string;
	subtitle?: string;
	icon: React.ComponentType<{ className?: string }>;
	tone?: "success" | "warning" | "neutral";
	loading?: boolean;
}

const toneClasses: Record<
	NonNullable<AdminDashboardMetricCardProps["tone"]>,
	string
> = {
	neutral: "bg-primary/10 text-primary",
	success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
	warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export function AdminDashboardMetricCard({
	label,
	value,
	subtitle,
	icon: Icon,
	tone = "neutral",
	loading = false,
}: AdminDashboardMetricCardProps) {
	return (
		<Card className="border-border/70 bg-card/80">
			<CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
				<div className="space-y-1">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						{label}
					</CardTitle>
					{subtitle ? (
						<p className="text-xs text-muted-foreground">
							{subtitle}
						</p>
					) : null}
				</div>
				<div className={cn("rounded-md p-2", toneClasses[tone])}>
					<Icon className="h-4 w-4" />
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<Skeleton className="h-8 w-28" />
				) : (
					<p className="text-2xl font-semibold text-foreground">
						{value}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
