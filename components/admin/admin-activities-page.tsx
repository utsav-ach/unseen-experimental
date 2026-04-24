"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { Activity } from "@/backend/schemas";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCcw, Search, Compass, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminActivityTable } from "@/components/admin/activities/admin-activity-table";
import { AdminActivityFormDialog } from "@/components/admin/activities/admin-activity-form-dialog";

const PAGE_SIZE = 20;

export function AdminActivitiesPage() {
	const {
		activities,
		isLoading,
		error,
		fetchActivities,
		createActivity,
		updateActivity,
		deleteActivity,
	} = useAdminStore();

	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [editingActivity, setEditingActivity] = useState<Activity | null>(
		null,
	);

	const fetchPage = async (nextPage: number) => {
		await fetchActivities(PAGE_SIZE, (nextPage - 1) * PAGE_SIZE);
	};

	useEffect(() => {
		void fetchPage(page);
	}, [fetchActivities, page]);

	const filteredRows = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return activities;

		return activities.filter((activity) => {
			const searchable = [
				activity.name,
				activity.display_category,
				activity.difficulty,
				activity.duration_range,
				activity.description ?? "",
			]
				.join(" ")
				.toLowerCase();
			return searchable.includes(query);
		});
	}, [activities, searchQuery]);

	const summary = useMemo(() => {
		const withImages = activities.filter((activity) =>
			Boolean(activity.featured_image),
		).length;
		const categoryCount = new Set(
			activities.map((activity) => activity.display_category),
		).size;
		return {
			rows: activities.length,
			withImages,
			categoryCount,
		};
	}, [activities]);

	const onRefresh = async () => {
		setIsRefreshing(true);
		await fetchPage(page);
		const latestError = useAdminStore.getState().error;
		if (latestError) {
			toast.error("Failed to refresh activities", {
				description: latestError,
			});
			setIsRefreshing(false);
			return;
		}
		toast.success("Activities refreshed.");
		setIsRefreshing(false);
	};

	const onCreate = async (payload: Omit<Activity, "id" | "created_at">) => {
		const ok = await createActivity(payload);
		if (ok) {
			toast.success("Activity created.");
			await fetchPage(page);
			return true;
		}
		toast.error("Failed to create activity.");
		return false;
	};

	const onUpdate = async (payload: Omit<Activity, "id" | "created_at">) => {
		if (!editingActivity) return false;
		const ok = await updateActivity(editingActivity.id, payload);
		if (ok) {
			toast.success("Activity updated.");
			await fetchPage(page);
			setEditingActivity(null);
			return true;
		}
		toast.error("Failed to update activity.");
		return false;
	};

	const onDelete = async (id: string) => {
		const ok = await deleteActivity(id);
		if (ok) {
			toast.success("Activity removed.");
			if (activities.length === 1 && page > 1) {
				setPage((prev) => prev - 1);
			} else {
				await fetchPage(page);
			}
			return;
		}
		toast.error("Failed to remove activity.");
	};

	return (
		<main className="space-y-6">
			<AdminPageHeader
				title="Activities"
				description="Control activity catalog shown in activity and package screens."
				action={
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							onClick={() => void onRefresh()}
							disabled={isLoading || isRefreshing}>
							<RefreshCcw className="mr-2 h-4 w-4" />
							{isRefreshing ? "Refreshing..." : "Refresh"}
						</Button>
						<Button onClick={() => setCreateOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add activity
						</Button>
					</div>
				}
			/>

			{error ? (
				<Alert variant="destructive">
					<AlertTitle>Could not load activities</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<section
				aria-label="Activity metrics"
				className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<Card className="border-border/70 bg-card/80">
					<CardContent className="flex items-center gap-3 p-4">
						<Compass className="h-5 w-5 text-primary" />
						<div>
							<p className="text-xs text-muted-foreground">
								Loaded rows
							</p>
							<p className="text-lg font-semibold text-foreground">
								{summary.rows}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/70 bg-card/80">
					<CardContent className="flex items-center gap-3 p-4">
						<ImageIcon className="h-5 w-5 text-primary" />
						<div>
							<p className="text-xs text-muted-foreground">
								Rows with image
							</p>
							<p className="text-lg font-semibold text-foreground">
								{summary.withImages}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/70 bg-card/80">
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground">
							Unique categories
						</p>
						<p className="text-lg font-semibold text-foreground">
							{summary.categoryCount}
						</p>
					</CardContent>
				</Card>
			</section>

			<section className="space-y-3" aria-label="Activity table section">
				<div className="relative max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search by name, category, difficulty"
						className="pl-9"
					/>
				</div>

				<AdminActivityTable
					rows={filteredRows}
					onEdit={setEditingActivity}
					onDelete={onDelete}
					isLoading={isLoading}
				/>

				<div className="flex items-center justify-between">
					<p className="text-xs text-muted-foreground">
						Page {page} • {activities.length} rows loaded
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPage((prev) => Math.max(1, prev - 1))
							}
							disabled={page === 1 || isLoading}>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((prev) => prev + 1)}
							disabled={
								activities.length < PAGE_SIZE || isLoading
							}>
							Next
						</Button>
					</div>
				</div>
			</section>

			{createOpen ? (
				<AdminActivityFormDialog
					key="activity-create"
					open={createOpen}
					onOpenChange={setCreateOpen}
					isSubmitting={isLoading}
					onSubmit={onCreate}
				/>
			) : null}

			{editingActivity ? (
				<AdminActivityFormDialog
					key={`activity-edit-${editingActivity.id}`}
					open={Boolean(editingActivity)}
					onOpenChange={(open) => {
						if (!open) setEditingActivity(null);
					}}
					initialData={editingActivity}
					isSubmitting={isLoading}
					onSubmit={onUpdate}
				/>
			) : null}
		</main>
	);
}
