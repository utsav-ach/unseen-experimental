import { GuideApplication } from "@/backend/schemas";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { AdminGuideApplicationStatusBadge } from "@/components/admin/guide-applications/admin-guide-application-status-badge";
import { ExternalLink } from "lucide-react";

interface AdminGuideApplicationDetailsCardProps {
	application: GuideApplication | null;
	value: string;
	error: string | null;
	isLoading?: boolean;
	onFeedbackChange: (value: string) => void;
	onApprove: () => Promise<void>;
	onReject: () => Promise<void>;
}

const formatDateTime = (value?: string) => {
	if (!value) return "Not available";
	return new Date(value).toLocaleString("en-NP", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export function AdminGuideApplicationDetailsCard({
	application,
	value,
	error,
	isLoading = false,
	onFeedbackChange,
	onApprove,
	onReject,
}: AdminGuideApplicationDetailsCardProps) {
	if (!application) {
		return (
			<Card className="border-border/70 bg-card/80">
				<CardContent className="flex min-h-90 items-center justify-center text-sm text-muted-foreground">
					Select an application to review details.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-border/70 bg-card/80">
			<CardHeader className="space-y-3 border-b border-border/60">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<CardTitle className="text-xl">
						Application #{application.application_id.slice(0, 8)}
					</CardTitle>
					<AdminGuideApplicationStatusBadge
						status={application.status}
					/>
				</div>
				<CardDescription>
					Review identity details and provide clear feedback before
					approval or rejection.
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-5 p-5">
				<section className="grid gap-3 sm:grid-cols-2">
					<div className="rounded-md border border-border/70 bg-muted/20 p-3">
						<p className="text-xs text-muted-foreground">
							Document type
						</p>
						<p className="mt-1 text-sm font-medium text-foreground">
							{application.nid_document_type}
						</p>
					</div>
					<div className="rounded-md border border-border/70 bg-muted/20 p-3">
						<p className="text-xs text-muted-foreground">
							ID number
						</p>
						<p className="mt-1 text-sm font-medium text-foreground">
							{application.nid_number}
						</p>
					</div>
					<div className="rounded-md border border-border/70 bg-muted/20 p-3">
						<p className="text-xs text-muted-foreground">
							Submitted
						</p>
						<p className="mt-1 text-sm font-medium text-foreground">
							{formatDateTime(application.created_at)}
						</p>
					</div>
					<div className="rounded-md border border-border/70 bg-muted/20 p-3">
						<p className="text-xs text-muted-foreground">
							Last updated
						</p>
						<p className="mt-1 text-sm font-medium text-foreground">
							{formatDateTime(application.updated_at)}
						</p>
					</div>
				</section>

				<section className="space-y-2">
					<p className="text-sm font-medium text-foreground">
						Known languages
					</p>
					<div className="flex flex-wrap gap-2">
						{(application.known_languages ?? []).length ? (
							application.known_languages.map((language) => (
								<Badge
									key={`${application.application_id}-${language}`}
									variant="outline">
									{language}
								</Badge>
							))
						) : (
							<p className="text-sm text-muted-foreground">
								No language information provided.
							</p>
						)}
					</div>
				</section>

				{application.nid_photo_url ? (
					<section className="rounded-md border border-border/70 bg-muted/20 p-3">
						<p className="text-sm font-medium text-foreground">
							Identity document photo
						</p>
						<a
							href={application.nid_photo_url}
							target="_blank"
							rel="noreferrer"
							className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
							Open secure file
							<ExternalLink className="h-3.5 w-3.5" />
						</a>
					</section>
				) : null}

				{application.description ? (
					<section className="rounded-md border border-border/70 bg-muted/20 p-3">
						<p className="text-sm font-medium text-foreground">
							Self description
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{application.description}
						</p>
					</section>
				) : null}

				{application.previous_experience ? (
					<section className="rounded-md border border-border/70 bg-muted/20 p-3">
						<p className="text-sm font-medium text-foreground">
							Previous experience
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{application.previous_experience}
						</p>
					</section>
				) : null}

				<section className="space-y-2">
					<p className="text-sm font-medium text-foreground">
						Admin feedback
					</p>
					<Input
						value={value}
						onChange={(event) =>
							onFeedbackChange(event.target.value)
						}
						placeholder="Write feedback (required before action)"
					/>
					{error ? (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}
				</section>

				<div className="flex flex-wrap items-center gap-2">
					<Button
						onClick={() => void onApprove()}
						disabled={isLoading}>
						Approve application
					</Button>
					<Button
						variant="destructive"
						onClick={() => void onReject()}
						disabled={isLoading}>
						Reject application
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
