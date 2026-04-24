"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { FeaturedDestination } from "@/backend/schemas";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCcw, Search, MapPinned, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminDestinationTable } from "@/components/admin/destinations/admin-destination-table";
import { AdminDestinationFormDialog } from "@/components/admin/destinations/admin-destination-form-dialog";

const PAGE_SIZE = 20;

export function AdminDestinationsPage() {
	const {
		destinations,
		isLoading,
		error,
		fetchDestinations,
		createDestination,
		updateDestination,
		deleteDestination,
	} = useAdminStore();

	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [editingDestination, setEditingDestination] =
		useState<FeaturedDestination | null>(null);

	const fetchPage = async (nextPage: number) => {
		await fetchDestinations(PAGE_SIZE, (nextPage - 1) * PAGE_SIZE);
	};

	useEffect(() => {
		void fetchPage(page);
	}, [fetchDestinations, page]);

	const filteredRows = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return destinations;

		return destinations.filter((destination) => {
			const searchable = [
				destination.name,
				destination.description ?? "",
				...(destination.tags ?? []),
			]
				.join(" ")
				.toLowerCase();
			return searchable.includes(query);
		});
	}, [destinations, searchQuery]);

	const summary = useMemo(() => {
		const totalImages = destinations.reduce((sum, row) => {
			const additional = row.additional_images?.length ?? 0;
			const featured = row.feature_image ? 1 : 0;
			return sum + additional + featured;
		}, 0);
		const avgRadius = destinations.length
			? destinations.reduce((sum, row) => sum + row.radius, 0) /
				destinations.length
			: 0;
		return {
			rows: destinations.length,
			totalImages,
			avgRadius,
		};
	}, [destinations]);

	const onRefresh = async () => {
		setIsRefreshing(true);
		await fetchPage(page);
		const latestError = useAdminStore.getState().error;
		if (latestError) {
			toast.error("Failed to refresh destinations", {
				description: latestError,
			});
			setIsRefreshing(false);
			return;
		}
		toast.success("Destinations refreshed.");
		setIsRefreshing(false);
	};

	const onCreate = async (
		payload: Omit<FeaturedDestination, "id" | "created_at">,
	) => {
		const ok = await createDestination(payload);
		if (ok) {
			toast.success("Destination created.");
			await fetchPage(page);
			return true;
		}
		toast.error("Failed to create destination.");
		return false;
	};

	const onUpdate = async (
		payload: Omit<FeaturedDestination, "id" | "created_at">,
	) => {
		if (!editingDestination) return false;
		const ok = await updateDestination(editingDestination.id, payload);
		if (ok) {
			toast.success("Destination updated.");
			await fetchPage(page);
			setEditingDestination(null);
			return true;
		}
		toast.error("Failed to update destination.");
		return false;
	};

	const onDelete = async (id: string) => {
		const ok = await deleteDestination(id);
		if (ok) {
			toast.success("Destination deleted successfully.");
			if (destinations.length === 1 && page > 1) {
				setPage((prev) => prev - 1);
			} else {
				await fetchPage(page);
			}
			return;
		}
		toast.error("Failed to delete destination.");
	};

	return (
		<main className="space-y-6">
			<AdminPageHeader
				title="Destinations"
				description="Manage featured destinations shown across landing and discovery routes."
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
							Add destination
						</Button>
					</div>
				}
			/>

			{error ? (
				<Alert variant="destructive">
					<AlertTitle>Failed to load destinations</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<section
				aria-label="Destination metrics"
				className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<Card className="border-border/70 bg-card/80">
					<CardContent className="flex items-center gap-3 p-4">
						<MapPinned className="h-5 w-5 text-primary" />
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
								Total feature images
							</p>
							<p className="text-lg font-semibold text-foreground">
								{summary.totalImages}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-border/70 bg-card/80">
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground">
							Average radius
						</p>
						<p className="text-lg font-semibold text-foreground">
							{summary.avgRadius.toFixed(1)} km
						</p>
					</CardContent>
				</Card>
			</section>

			<section
				className="space-y-3"
				aria-label="Destination table section">
				<div className="relative max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search by name, tag, description"
						className="pl-9"
					/>
				</div>

				<AdminDestinationTable
					rows={filteredRows}
					onEdit={setEditingDestination}
					onDelete={onDelete}
					isLoading={isLoading}
				/>

				<div className="flex items-center justify-between">
					<p className="text-xs text-muted-foreground">
						Page {page} • {destinations.length} rows loaded
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
								destinations.length < PAGE_SIZE || isLoading
							}>
							Next
						</Button>
					</div>
				</div>
			</section>

			{createOpen ? (
				<AdminDestinationFormDialog
					key="destination-create"
					open={createOpen}
					onOpenChange={setCreateOpen}
					isSubmitting={isLoading}
					onSubmit={onCreate}
				/>
			) : null}

			{editingDestination ? (
				<AdminDestinationFormDialog
					key={`destination-edit-${editingDestination.id}`}
					open={Boolean(editingDestination)}
					onOpenChange={(open) => {
						if (!open) setEditingDestination(null);
					}}
					initialData={editingDestination}
					isSubmitting={isLoading}
					onSubmit={onUpdate}
				/>
			) : null}
		</main>
	);
}
