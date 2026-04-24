import { ApplicationStatus } from "@/backend/schemas";
import { Badge } from "@/components/ui/badge";

interface AdminGuideApplicationStatusBadgeProps {
	status: ApplicationStatus;
}

const statusStyles: Record<
	ApplicationStatus,
	"outline" | "secondary" | "destructive"
> = {
	pending: "secondary",
	approved: "outline",
	rejected: "destructive",
};

const labels: Record<ApplicationStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
};

export function AdminGuideApplicationStatusBadge({
	status,
}: AdminGuideApplicationStatusBadgeProps) {
	return <Badge variant={statusStyles[status]}>{labels[status]}</Badge>;
}
