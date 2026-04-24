"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePhotoStore } from "@/backend/v2/stores/usePhotoStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, MapPin, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function PhotoDetailsPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const {
		currentPhoto,
		isLoading,
		error,
		fetchPhotoDetail,
		deletePhoto,
		can_delete,
	} = usePhotoStore();

	useEffect(() => {
		if (id) {
			fetchPhotoDetail(id);
		}
	}, [id, fetchPhotoDetail]);

	const handleDelete = async () => {
		const success = await deletePhoto(id);
		if (success) {
			toast.success("Photo deleted successfully.");
			router.push("/photos");
		} else {
			toast.error(error || "Unable to delete this photo.");
		}
	};

	if (isLoading && !currentPhoto) {
		return (
			<div className="min-h-screen bg-background pt-24 flex items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	if (!currentPhoto) return null;

	const coverImage = currentPhoto.media_urls?.[0];
	const isGuide = currentPhoto.author.is_guide;

	return (
		<main className="min-h-screen bg-background pt-24 pb-16">
			<section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between gap-3">
					<Button asChild variant="ghost" size="sm" className="w-fit">
						<Link
							href="/photos"
							className="inline-flex items-center gap-2">
							<ArrowLeft className="h-4 w-4" />
							Back to gallery
						</Link>
					</Button>

					{isGuide && (
						<Badge
							variant="secondary"
							className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
							<CheckCircle2 className="h-3.5 w-3.5" />
							Guide
						</Badge>
					)}
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertTitle>Could not load photo</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
					<Card className="overflow-hidden rounded-xl border bg-card">
						<div className="relative aspect-[4/5] bg-muted">
							{coverImage && (
								<Image
									src={coverImage}
									alt={
										currentPhoto.location_name ||
										currentPhoto.author.name ||
										"Photo"
									}
									fill
									className="object-cover"
								/>
							)}
						</div>
					</Card>

					<div className="space-y-4">
						<Card className="rounded-xl border bg-card p-5">
							<div className="flex items-center gap-3">
								<div>
									<p className="text-xs text-muted-foreground">
										Uploaded by
									</p>
									<p className="text-sm font-medium text-foreground">
										{currentPhoto.author.name}
									</p>
									<p className="text-xs text-muted-foreground">
										@{currentPhoto.author.username}
									</p>
								</div>
							</div>

							<div className="mt-4 space-y-2 text-sm">
								<div className="flex items-center gap-2 text-muted-foreground">
									<MapPin className="h-4 w-4" />
									<span>
										{currentPhoto.location_name ||
											"Location not set"}
									</span>
								</div>
								<p className="text-foreground">
									{currentPhoto.description ||
										"This photo was shared without a description."}
								</p>
							</div>
						</Card>

						{can_delete(id) && (
							<Card className="rounded-xl border bg-card p-5">
								<p className="text-sm font-medium text-foreground">
									Manage this photo
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									You can remove your own uploads, and admins
									can remove any post.
								</p>
								<Button
									variant="destructive"
									className="mt-4 w-full inline-flex items-center gap-2"
									onClick={handleDelete}>
									<Trash2 className="h-4 w-4" />
									Delete photo
								</Button>
							</Card>
						)}
					</div>
				</div>
			</section>
		</main>
	);
}
