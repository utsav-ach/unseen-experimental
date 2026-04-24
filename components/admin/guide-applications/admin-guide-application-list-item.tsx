import { GuideApplication } from "@/backend/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminGuideApplicationStatusBadge } from "@/components/admin/guide-applications/admin-guide-application-status-badge";

interface AdminGuideApplicationListItemProps {
	application: GuideApplication;
	selected?: boolean;
	onSelect: () => void;
}

const formatDate = (value?: string) => {
	if (!value) return "Unknown date";
	return new Date(value).toLocaleDateString("en-NP", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export function AdminGuideApplicationListItem({
	application,
	selected = false,
	onSelect,
}: AdminGuideApplicationListItemProps) {
	return (
		<button
			type="button"
			className="block w-full text-left"
			onClick={onSelect}>
			<Card
				className={cn(
					"border-border/70 transition-colors hover:bg-muted/40",
					selected ? "border-primary/40 bg-primary/5" : "bg-card/70",
				)}>
				<CardContent className="space-y-2 p-3">
					<div className="flex items-center justify-between gap-2">
						<p className="text-sm font-semibold text-foreground">
							App #{application.application_id.slice(0, 8)}
						</p>
						<AdminGuideApplicationStatusBadge
							status={application.status}
						/>
					</div>

					<div className="space-y-1">
						<p className="text-xs text-muted-foreground">
							Document: {application.nid_document_type}
						</p>
						<p className="text-xs text-muted-foreground">
							ID Number: {application.nid_number}
						</p>
					</div>

					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
							{(application.known_languages ?? []).length || 0}{" "}
							languages
						</span>
						<span>{formatDate(application.created_at)}</span>
					</div>
				</CardContent>
			</Card>
		</button>
	);
}
