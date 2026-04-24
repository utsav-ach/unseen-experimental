"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminPhotosPage() {
	const { photos, isLoading, error, fetchPhotos, deletePhoto } =
		useAdminStore();

	useEffect(() => {
		void fetchPhotos();
	}, [fetchPhotos]);

	const onDelete = async (id: string) => {
		const ok = await deletePhoto(id);
		if (ok) {
			toast.success("Photo post deleted.");
			return;
		}
		toast.error("Failed to delete photo post.");
	};

	return (
		<div>
			<AdminPageHeader
				title="Photos Moderation"
				description="Review and remove public gallery uploads."
				action={
					<Button
						variant="outline"
						onClick={() => void fetchPhotos()}
						disabled={isLoading}>
						Refresh
					</Button>
				}
			/>

			{error ? (
				<Alert variant="destructive" className="mb-4">
					<AlertTitle>Photo moderation failed</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="space-y-3">
				{photos.map((photo) => (
					<Card key={photo.id}>
						<CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
							<div>
								<p className="text-sm font-semibold text-foreground">
									Photo {photo.id.slice(0, 8)}
								</p>
								<p className="text-xs text-muted-foreground">
									Media files: {photo.media_urls?.length || 0}
								</p>
							</div>
							<Button
								variant="destructive"
								onClick={() => void onDelete(photo.id)}
								disabled={isLoading}>
								Delete
							</Button>
						</CardContent>
					</Card>
				))}

				{!photos.length && !isLoading ? (
					<Card>
						<CardContent className="py-8 text-center text-sm text-muted-foreground">
							No photo posts found.
						</CardContent>
					</Card>
				) : null}
			</div>
		</div>
	);
}
