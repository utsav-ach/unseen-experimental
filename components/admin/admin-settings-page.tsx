import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminSettingsPage() {
	return (
		<div>
			<AdminPageHeader
				title="Admin Settings"
				description="System-level configuration, analytics retention, and operational guardrails."
			/>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							Analytics Strategy
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>
							Use scheduled aggregation jobs for daily metrics to
							keep dashboard queries fast.
						</p>
						<p>
							Keep operational windows at 1, 7, and 30 days for
							consistent reporting.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							Audit Readiness
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>
							Track all role changes, moderation actions, and
							sensitive admin operations in a future audit table.
						</p>
						<p>
							Always retain who acted, when they acted, and what
							changed.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
