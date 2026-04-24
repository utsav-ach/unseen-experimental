import { AdminLabelCount } from "@/backend/schemas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminDashboardTopListProps {
	title: string;
	description: string;
	rows: AdminLabelCount[];
	emptyMessage: string;
	showAvatars?: boolean;
	loading?: boolean;
}

const getInitials = (value: string) =>
	value
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

export function AdminDashboardTopList({
	title,
	description,
	rows,
	emptyMessage,
	showAvatars = false,
	loading = false,
}: AdminDashboardTopListProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				{loading ? (
					<div className="space-y-2">
						<Skeleton className="h-11 w-full" />
						<Skeleton className="h-11 w-full" />
						<Skeleton className="h-11 w-full" />
					</div>
				) : rows.length ? (
					rows.map((row, index) => (
						<div
							key={`${row.label}-${row.guide_id ?? index}`}
							className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2">
							<div className="flex items-center gap-3">
								{showAvatars ? (
									<Avatar size="sm">
										<AvatarFallback>
											{getInitials(row.label)}
										</AvatarFallback>
									</Avatar>
								) : null}
								<div>
									<p className="text-sm font-medium text-foreground">
										{row.label}
									</p>
									<p className="text-xs text-muted-foreground">
										Rank #{index + 1}
									</p>
								</div>
							</div>
							<p className="text-sm font-semibold text-foreground">
								{row.count.toLocaleString("en-NP")}
							</p>
						</div>
					))
				) : (
					<p className="text-sm text-muted-foreground">
						{emptyMessage}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
