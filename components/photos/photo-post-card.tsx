import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MapPin, CheckCircle2, ImageIcon, Images } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CompletePhotoData } from "@/backend/schemas";
import { cn } from "@/lib/utils";

interface PhotoPostCardProps {
	photo: CompletePhotoData;
	className?: string;
}

export function PhotoPostCard({ photo, className }: PhotoPostCardProps) {
	const mediaUrls = photo.media_urls || [];
	const guideBadge = photo.author.is_guide;
	const hasLocation = Boolean(photo.location_name);

	return (
		<Card
			className={cn(
				"overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
				className,
			)}>
			<Link
				href={`/photos/${photo.id}`}
				className="group flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
				<div className="flex items-center justify-between gap-3 px-4 py-3">
					<div className="flex min-w-0 items-center gap-3">
						<div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted">
							{photo.author.avatar ? (
								<Image
									src={photo.author.avatar}
									alt={photo.author.name}
									fill
									className="object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-xs font-semibold text-primary">
									{(photo.author.name || "U")[0]}
								</div>
							)}
						</div>
						<div className="min-w-0">
							<div className="flex items-center gap-1.5">
								<p className="truncate text-sm font-medium text-foreground">
									{photo.author.name}
								</p>
								{guideBadge && (
									<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
								)}
							</div>
						</div>
					</div>
					<span className="text-[10px] text-muted-foreground">
						{photo.created_at
							? formatDistanceToNow(new Date(photo.created_at), {
									addSuffix: true,
								})
							: "Recently"}
					</span>
				</div>

				<div className="relative aspect-[4/5] overflow-hidden bg-muted">
					{mediaUrls.length > 0 ? (
						<div className="flex h-full w-full overflow-x-auto scroll-smooth snap-x snap-mandatory">
							{mediaUrls.map((mediaUrl, index) => (
								<div
									key={`${photo.id}-${index}`}
									className="relative h-full min-w-full snap-start">
									<Image
										src={mediaUrl}
										alt={
											photo.location_name ||
											photo.author.name ||
											`Photo ${index + 1}`
										}
										fill
										className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
									/>
								</div>
							))}
						</div>
					) : (
						<div className="flex h-full w-full items-center justify-center text-muted-foreground">
							<ImageIcon className="h-10 w-10" />
						</div>
					)}

					{mediaUrls.length > 1 && (
						<div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md">
							<Images className="h-3.5 w-3.5 text-muted-foreground" />
							<span>{mediaUrls.length} photos</span>
						</div>
					)}
				</div>

				<div className="space-y-2 p-4">
					<div className="min-h-5">
						{hasLocation ? (
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<MapPin className="h-3.5 w-3.5" />
								<span className="truncate">
									{photo.location_name}
								</span>
							</div>
						) : null}
					</div>
					{photo.description ? (
						<p className="line-clamp-3 text-sm text-foreground/90">
							{photo.description}
						</p>
					) : (
						<p className="text-sm text-muted-foreground"></p>
					)}
				</div>
			</Link>
		</Card>
	);
}
