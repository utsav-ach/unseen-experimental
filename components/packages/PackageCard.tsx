"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FeaturedPackageItem } from "@/backend/schemas";

interface PackageCardProps {
	packageItem: FeaturedPackageItem;
	className?: string;
}

export const PackageCard: React.FC<PackageCardProps> = ({
	packageItem,
	className,
}) => {
	const {
		id,
		name,
		type,
		actual_price,
		discounted_price,
		featured_image,
		total_days,
		destination_name,
	} = packageItem;

	const discountPercentage =
		actual_price > 0
			? Math.round(
					((actual_price - discounted_price) / actual_price) * 100,
				)
			: 0;

	return (
		<Link href={`/packages/details/${id}`} className="group block h-full">
			<Card
				className={cn(
					"h-full overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/20",
					className,
				)}>
				<div className="relative aspect-[4/3] overflow-hidden">
					<Image
						src={featured_image || "/placeholder-destination.jpg"}
						alt={name}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-105"
					/>

					<div className="absolute left-3 top-3 flex flex-col gap-2">
						<Badge className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-medium text-primary-foreground shadow-sm">
							{type === "activities_package"
								? "Activities"
								: "Destination"}
						</Badge>
						{discountPercentage > 0 && (
							<Badge
								variant="secondary"
								className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-sm backdrop-blur">
								{discountPercentage}% off
							</Badge>
						)}
					</div>
				</div>

				<CardContent className="space-y-3 p-4">
					<div className="space-y-1">
						<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
							{destination_name || "Nepal"}
						</p>
						<CardTitle className="line-clamp-1 text-base font-semibold text-foreground">
							{name}
						</CardTitle>
					</div>

					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<div className="flex items-center gap-1.5">
							<Clock className="h-3.5 w-3.5" />
							<span>{total_days} days</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Star className="h-3.5 w-3.5 fill-primary text-primary" />
							<span>Direct booking</span>
						</div>
					</div>

					<div className="flex items-center justify-between border-t pt-3">
						<div>
							{discountPercentage > 0 && (
								<p className="text-xs text-muted-foreground line-through">
									Rs. {actual_price.toLocaleString()}
								</p>
							)}
							<p className="text-sm font-semibold text-foreground">
								Rs. {discounted_price.toLocaleString()}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9 rounded-full border bg-background p-0 hover:bg-muted">
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};
