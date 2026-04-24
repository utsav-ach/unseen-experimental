"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApplicationStatus, GuideApplication } from "@/backend/schemas";
import { toast } from "sonner";
import {
	Search,
	RefreshCcw,
	ClipboardCheck,
	ShieldAlert,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import { AdminGuideApplicationListItem } from "./guide-applications/admin-guide-application-list-item";
import { AdminGuideApplicationDetailsCard } from "./guide-applications/admin-guide-application-details-card";

export function AdminGuideApplicationsPage() {
	const {
		guideApplications,
		fetchGuideApplications,
		reviewGuideApplication,
		isLoading,
		error,
	} = useAdminStore();
	const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
		"pending",
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [feedbackById, setFeedbackById] = useState<Record<string, string>>(
		{},
	);
	const [fieldErrorById, setFieldErrorById] = useState<
		Record<string, string | null>
	>({});
	const [isRefreshing, setIsRefreshing] = useState(false);

	useEffect(() => {
		void fetchGuideApplications(statusFilter);
	}, [fetchGuideApplications, statusFilter]);

	useEffect(() => {
		if (!guideApplications.length) {
			setSelectedId(null);
			return;
		}

		if (
			!selectedId ||
			!guideApplications.find(
				(item) => item.application_id === selectedId,
			)
		) {
			setSelectedId(guideApplications[0].application_id);
		}
	}, [guideApplications, selectedId]);

	const filteredApplications = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return guideApplications;

		return guideApplications.filter((application) => {
			const searchable = [
				application.application_id,
				application.nid_number,
				application.nid_document_type,
				application.status,
				application.description ?? "",
				application.previous_experience ?? "",
				...(application.known_languages ?? []),
			]
				.join(" ")
				.toLowerCase();

			return searchable.includes(query);
		});
	}, [guideApplications, searchQuery]);

	const selectedApplication = useMemo<GuideApplication | null>(
		() =>
			filteredApplications.find(
				(application) => application.application_id === selectedId,
			) ??
			filteredApplications[0] ??
			null,
		[filteredApplications, selectedId],
	);

	const stats = useMemo(() => {
		const base = {
			all: guideApplications.length,
			pending: 0,
			approved: 0,
			rejected: 0,
		};
		for (const item of guideApplications) {
			if (item.status === "pending") base.pending += 1;
			if (item.status === "approved") base.approved += 1;
			if (item.status === "rejected") base.rejected += 1;
		}
		return base;
	}, [guideApplications]);

	const refreshList = async () => {
		setIsRefreshing(true);
		await fetchGuideApplications(statusFilter);
		const latestError = useAdminStore.getState().error;
		if (latestError) {
			toast.error("Failed to refresh applications", {
				description: latestError,
			});
			setIsRefreshing(false);
			return;
		}
		toast.success("Applications refreshed");
		setIsRefreshing(false);
	};

	const onReview = async (id: string, status: ApplicationStatus) => {
		const feedback = feedbackById[id]?.trim();
		if (!feedback) {
			setFieldErrorById((state) => ({
				...state,
				[id]: "Feedback is required before approving or rejecting.",
			}));
			toast.error("Feedback is required.");
			return;
		}

		setFieldErrorById((state) => ({ ...state, [id]: null }));

		const ok = await reviewGuideApplication(id, status, feedback);
		if (ok) {
			toast.success(`Application ${status} successfully.`);
			void fetchGuideApplications(statusFilter);
			return;
		}

		toast.error("Could not update application status.");
	};

	return (
		<main className="space-y-6">
			<AdminPageHeader
				title="Guide Applications"
				description="Review guide requests with clear status control, identity info, and mandatory feedback."
				action={
					<div className="flex flex-wrap items-center gap-2">
						<div className="w-40">
							<Select
								value={statusFilter}
								onValueChange={(value) =>
									setStatusFilter(
										value as ApplicationStatus | "all",
									)
								}>
								<SelectTrigger>
									<SelectValue placeholder="Filter status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All status
									</SelectItem>
									<SelectItem value="pending">
										Pending
									</SelectItem>
									<SelectItem value="approved">
										Approved
									</SelectItem>
									<SelectItem value="rejected">
										Rejected
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<Button
							variant="outline"
							onClick={() => void refreshList()}
							disabled={isRefreshing || isLoading}>
							<RefreshCcw className="mr-2 h-4 w-4" />
							{isRefreshing ? "Refreshing..." : "Refresh"}
						</Button>
					</div>
				}
			/>

			{error ? (
				<Alert variant="destructive">
					<AlertTitle>Guide applications failed to load</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<section
				aria-label="Guide application summaries"
				className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<Card className="border-border/70 bg-card/80">
					<CardContent className="flex items-center gap-3 p-4">
						<ClipboardCheck className="h-5 w-5 text-primary" />
						<div>
							<p className="text-xs text-muted-foreground">
								Total
							</p>
							<p className="text-lg font-semibold text-foreground">
								{stats.all}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-border/70 bg-card/80">
					<CardContent className="flex items-center gap-3 p-4">
						<ShieldAlert className="h-5 w-5 text-amber-500" />
						<div>
							<p className="text-xs text-muted-foreground">
								Pending
							</p>
							<p className="text-lg font-semibold text-foreground">
								{stats.pending}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-border/70 bg-card/80">
					<CardContent className="flex items-center gap-3 p-4">
						<CheckCircle2 className="h-5 w-5 text-emerald-500" />
						<div>
							<p className="text-xs text-muted-foreground">
								Approved
							</p>
							<p className="text-lg font-semibold text-foreground">
								{stats.approved}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-border/70 bg-card/80">
					<CardContent className="flex items-center gap-3 p-4">
						<XCircle className="h-5 w-5 text-destructive" />
						<div>
							<p className="text-xs text-muted-foreground">
								Rejected
							</p>
							<p className="text-lg font-semibold text-foreground">
								{stats.rejected}
							</p>
						</div>
					</CardContent>
				</Card>
			</section>

			<section
				aria-label="Guide applications workspace"
				className="grid gap-4 xl:grid-cols-[360px_1fr]">
				<Card className="overflow-hidden border-border/70 bg-card/80">
					<CardContent className="space-y-3 p-3">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(event) =>
									setSearchQuery(event.target.value)
								}
								placeholder="Search by ID, document, language"
								className="pl-9"
							/>
						</div>

						<div className="max-h-160 space-y-2 overflow-y-auto pr-1">
							{filteredApplications.length ? (
								filteredApplications.map((application) => (
									<AdminGuideApplicationListItem
										key={application.application_id}
										application={application}
										selected={
											selectedApplication?.application_id ===
											application.application_id
										}
										onSelect={() =>
											setSelectedId(
												application.application_id,
											)
										}
									/>
								))
							) : (
								<div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
									No applications match this filter.
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<AdminGuideApplicationDetailsCard
					application={selectedApplication}
					value={
						selectedApplication
							? (feedbackById[
									selectedApplication.application_id
								] ??
								selectedApplication.admin_feedback ??
								"")
							: ""
					}
					error={
						selectedApplication
							? (fieldErrorById[
									selectedApplication.application_id
								] ?? null)
							: null
					}
					isLoading={isLoading}
					onFeedbackChange={(value: string) => {
						if (!selectedApplication) return;
						setFeedbackById((state) => ({
							...state,
							[selectedApplication.application_id]: value,
						}));
						setFieldErrorById((state) => ({
							...state,
							[selectedApplication.application_id]: null,
						}));
					}}
					onApprove={() =>
						selectedApplication
							? onReview(
									selectedApplication.application_id,
									"approved",
								)
							: Promise.resolve()
					}
					onReject={() =>
						selectedApplication
							? onReview(
									selectedApplication.application_id,
									"rejected",
								)
							: Promise.resolve()
					}
				/>
			</section>
		</main>
	);
}
