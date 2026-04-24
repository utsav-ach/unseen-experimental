import { CheckCircle2, Sparkles } from "lucide-react";

export function PackageActivitiesList({
	activities,
}: {
	activities: Array<{ id?: string; name: string }>;
}) {
	if (!activities.length) {
		return null;
	}

	return (
		<section className="space-y-3 rounded-xl border bg-card p-5 sm:p-6">
			<h4 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
				Included activities
			</h4>
			<div className="grid grid-cols-1 gap-2">
				{activities.map((activity) => (
					<div
						key={activity.id}
						className="flex items-center justify-between rounded-xl border bg-background p-3">
						<div className="flex items-center gap-4">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary">
								<Sparkles className="h-4 w-4" />
							</div>
							<span className="text-sm font-medium text-foreground">
								{activity.name}
							</span>
						</div>
						<CheckCircle2 className="h-4 w-4 text-primary" />
					</div>
				))}
			</div>
		</section>
	);
}
