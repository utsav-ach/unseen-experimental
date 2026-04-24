import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription } from "../ui/card";
import { cn } from "@/lib/utils";

export default function DestinationGridCard({
	destination,
	className,
}: {
	destination: any;
	className?: string;
}) {
	const imageUrl =
		destination.feature_image || "/placeholder-destination.jpg";
	const rating = Number(destination.avg_rating || 0);

	return (
		<Link
			href={`/destinations/${destination.id}`}
			className="group block h-full">
			<Card
				className={cn(
					"h-full overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/20",
					className,
				)}>
				<div className="relative aspect-[4/3] overflow-hidden">
					<Image
						src={imageUrl}
						alt={destination.name}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</div>

				<CardContent className="space-y-3 p-4">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
								Destination
							</p>
							<h3 className="line-clamp-1 text-base font-semibold text-foreground">
								{destination.name}
							</h3>
						</div>

						<div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
							<Star className="h-3.5 w-3.5 fill-primary text-primary" />
							<span>
								{rating > 0 ? rating.toFixed(1) : "New"}
							</span>
						</div>
					</div>

					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<MapPin className="h-3.5 w-3.5" />
						<span>Destination</span>
					</div>

					<div className="flex flex-wrap gap-2">
						{destination.tags?.slice(0, 2).map((tag: string) => (
							<Badge
								key={tag}
								variant="secondary"
								className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
								{tag}
							</Badge>
						))}
					</div>

					<CardDescription className="line-clamp-2 text-sm text-muted-foreground">
						{destination.description ||
							"Explore this destination and connect with a local guide."}
					</CardDescription>
				</CardContent>
			</Card>
		</Link>
	);
}
