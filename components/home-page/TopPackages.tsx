import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TopTrendingPackage } from "@/backend/schemas";

const TopPackages: React.FC<{ packages?: TopTrendingPackage[] }> = ({
	packages,
}) => {
	const topPackages = (packages ?? []).slice(0, 6);
	const isLoading = false;

	if (topPackages.length === 0 && !isLoading) {
		return null;
	}

	return (
		<section className="bg-muted/20 py-16 sm:py-20">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
					<div className="max-w-2xl">
						<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							Featured travel packages
						</h2>
						<p className="mt-2 text-sm text-muted-foreground sm:text-base">
							Fixed price packages for travelers who want a direct
							booking without negotiation.
						</p>
					</div>

					<Link href="/packages">
						<Button variant="outline" className="w-fit">
							View all packages
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-3">
								<Skeleton className="aspect-4/3 w-full rounded-xl" />
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-3 w-1/2" />
								<Skeleton className="h-4 w-1/3" />
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{topPackages.map((pkg) => (
							<Link
								key={pkg.id}
								href={`/packages/details/${pkg.id}`}
								className="group block h-full">
								<Card className="h-full overflow-hidden rounded-xl border bg-card transition-colors hover:bg-background">
									<div className="relative aspect-4/3 overflow-hidden">
										<Image
											src={
												pkg.featured_image ||
												"/placeholder-destination.jpg"
											}
											alt={pkg.name}
											fill
											className="object-cover transition-transform duration-500 group-hover:scale-105"
										/>
									</div>
									<CardContent className="space-y-3 p-4">
										<CardTitle className="line-clamp-1 text-base font-semibold">
											{pkg.name}
										</CardTitle>
										<CardDescription className="line-clamp-1 text-sm">
											{pkg.destination_name || "Nepal"}
										</CardDescription>

										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<Clock className="h-3.5 w-3.5" />
											<span>{pkg.total_days} days</span>
										</div>

										<div className="flex items-center justify-between border-t pt-3">
											<div>
												{pkg.actual_price >
													pkg.discounted_price && (
													<p className="text-xs text-muted-foreground line-through">
														Rs.{" "}
														{pkg.actual_price.toLocaleString()}
													</p>
												)}
												<p className="text-sm font-semibold text-foreground">
													Rs.{" "}
													{pkg.discounted_price.toLocaleString()}
												</p>
											</div>
											<span className="text-xs font-medium text-primary">
												View details
											</span>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default TopPackages;
