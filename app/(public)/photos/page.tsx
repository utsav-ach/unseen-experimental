"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { usePhotoStore } from "@/backend/v2/stores/usePhotoStore";
import { PhotoPostCard } from "@/components/photos/photo-post-card";
import { PhotoUploadDialog } from "@/components/photos/photo-upload-dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid2x2, Loader2, MapPin, Search, Upload } from "lucide-react";

export default function PhotosPage() {
	const { photos, total, isLoading, error, fetchPhotos } = usePhotoStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery] = useDebounce(searchQuery, 300);

	useEffect(() => {
		fetchPhotos({
			limit: 24,
			offset: 0,
			searchQuery: debouncedQuery || null,
		});
	}, [debouncedQuery, fetchPhotos]);

	const guidePhotos = useMemo(
		() => photos.filter((photo) => photo.author.is_guide).length,
		[photos],
	);

	const locationPhotos = useMemo(
		() => photos.filter((photo) => Boolean(photo.location_name)).length,
		[photos],
	);

	return (
		<main className="min-h-screen bg-background pt-24 pb-16">
			<section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
				<header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Grid2x2 className="h-4 w-4 text-primary" />
							Community gallery
						</div>
						<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
							Recent Photos
						</h1>
						<p className="max-w-2xl text-sm text-muted-foreground">
							Browse community travel photos from Nepal. Posts can
							include an optional caption and a map location.
						</p>
					</div>

					<PhotoUploadDialog>
						<Button className="inline-flex items-center gap-2">
							<Upload className="h-4 w-4" />
							Share photo
						</Button>
					</PhotoUploadDialog>
				</header>

				<div className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-xl border bg-card p-4">
						<p className="text-xs text-muted-foreground">
							Total photos
						</p>
						<p className="mt-1 text-xl font-semibold text-foreground">
							{total}
						</p>
					</div>
					<div className="rounded-xl border bg-card p-4">
						<p className="text-xs text-muted-foreground">
							Guide posts
						</p>
						<p className="mt-1 text-xl font-semibold text-foreground">
							{guidePhotos}
						</p>
					</div>
					<div className="rounded-xl border bg-card p-4">
						<p className="text-xs text-muted-foreground">
							Posts with locations
						</p>
						<p className="mt-1 text-xl font-semibold text-foreground">
							{locationPhotos}
						</p>
					</div>
				</div>

				<div className="grid gap-3 lg:grid-cols-[1fr_220px]">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							className="pl-9"
							placeholder="Search descriptions or places"
							value={searchQuery}
							onChange={(event) =>
								setSearchQuery(event.target.value)
							}
						/>
					</div>
					<div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground">
						<MapPin className="h-4 w-4" />
						Optional map location
					</div>
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertTitle>Unable to load photos</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{isLoading && photos.length === 0 ? (
					<div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-card">
						<div className="flex items-center gap-3 text-muted-foreground">
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
							Loading photos...
						</div>
					</div>
				) : photos.length === 0 ? (
					<div className="rounded-xl border border-dashed bg-card p-10 text-center">
						<div className="mx-auto flex max-w-sm flex-col items-center gap-3">
							<Grid2x2 className="h-8 w-8 text-muted-foreground" />
							<p className="text-sm font-medium text-foreground">
								No photos yet
							</p>
							<p className="text-xs text-muted-foreground">
								Be the first to share a travel moment from the
								community.
							</p>
							<Badge variant="outline">Public gallery</Badge>
						</div>
					</div>
				) : (
					<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{photos.map((photo) => (
							<PhotoPostCard key={photo.id} photo={photo} />
						))}
					</section>
				)}
			</section>
		</main>
	);
}
