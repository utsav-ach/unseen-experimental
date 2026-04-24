"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminStoriesPage() {
	const {
		stories,
		isLoading,
		error,
		fetchStories,
		setStoryArchived,
		deleteStory,
	} = useAdminStore();

	useEffect(() => {
		void fetchStories();
	}, [fetchStories]);

	const onToggleArchive = async (id: string, isArchived: boolean) => {
		const ok = await setStoryArchived(id, isArchived);
		if (ok) {
			toast.success(isArchived ? "Story archived." : "Story restored.");
			return;
		}
		toast.error("Failed to update story visibility.");
	};

	const onDelete = async (id: string) => {
		const ok = await deleteStory(id);
		if (ok) {
			toast.success("Story deleted.");
			return;
		}
		toast.error("Failed to delete story.");
	};

	return (
		<div>
			<AdminPageHeader
				title="Stories Moderation"
				description="Archive, restore, or delete community stories."
				action={
					<Button
						variant="outline"
						onClick={() => void fetchStories()}
						disabled={isLoading}>
						Refresh
					</Button>
				}
			/>

			{error ? (
				<Alert variant="destructive" className="mb-4">
					<AlertTitle>Stories moderation failed</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="space-y-3">
				{stories.map((story) => (
					<Card key={story.id}>
						<CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
							<div>
								<p className="text-sm font-semibold text-foreground">
									{story.title}
								</p>
								<p className="text-xs text-muted-foreground">
									Status:{" "}
									{story.is_archived
										? "Archived"
										: "Published"}
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									onClick={() =>
										void onToggleArchive(
											story.id,
											!story.is_archived,
										)
									}
									disabled={isLoading}>
									{story.is_archived ? "Restore" : "Archive"}
								</Button>
								<Button
									variant="destructive"
									onClick={() => void onDelete(story.id)}
									disabled={isLoading}>
									Delete
								</Button>
							</div>
						</CardContent>
					</Card>
				))}

				{!stories.length && !isLoading ? (
					<Card>
						<CardContent className="py-8 text-center text-sm text-muted-foreground">
							No stories found.
						</CardContent>
					</Card>
				) : null}
			</div>
		</div>
	);
}
