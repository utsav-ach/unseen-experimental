import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import DestinationGridCard from "@/components/destinations/destination-card";
import { MinimalDestination } from "@/backend/schemas";

export default function FeaturedDestinations({
	data,
}: {
	data: MinimalDestination[];
}) {
	const featuredList = data.slice(0, 10);
	const isLoading = false;

	return (
		<section className="bg-background py-16 sm:py-20">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
					<div className="max-w-2xl">
						<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							Featured destinations
						</h2>
						<p className="mt-2 text-sm text-muted-foreground sm:text-base">
							Pick from top places added by our admins and start
							your booking process with local guides.
						</p>
					</div>
					<Link href="/destinations">
						<Button variant="outline" className="w-fit">
							View all destinations
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{isLoading ? (
						Array(4)
							.fill(0)
							.map((_, i) => <DestinationSkeleton key={i} />)
					) : featuredList.length > 0 ? (
						featuredList.map((destination) => (
							<DestinationGridCard
								key={destination.id}
								destination={destination}
							/>
						))
					) : (
						<div className="col-span-full rounded-xl border bg-muted/30 py-16 text-center">
							<p className="text-muted-foreground">
								No featured destinations found.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

function DestinationSkeleton() {
	return (
		<div className="space-y-3">
			<Skeleton className="aspect-4/3 w-full rounded-xl" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-3 w-1/2" />
				<Skeleton className="h-3 w-full" />
			</div>
		</div>
	);
}
