"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GuideCardProps {
	guide: {
		id: string;
		full_name: string;
		username: string;
		avatar_url: string | null;
		avg_rating: number;
		known_languages: string[];
		service_areas?: string[];
	};
}

export function GuideCard({ guide }: GuideCardProps) {
	const displayLocation =
		guide.service_areas?.find((x) => !!x?.trim()) || "Nepal";

	return (
		<Link
			href={`/trek-dai/details/${guide.id}`}
			className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
			<Card className="group overflow-hidden rounded-xl border bg-card p-0 transition-colors hover:border-primary/30">
				<div className="relative aspect-4/3 w-full overflow-hidden">
					<Image
						src={
							guide.avatar_url ||
							`https://api.dicebear.com/7.x/avataaars/svg?seed=${guide.id}`
						}
						alt={guide.full_name}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
					<div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border bg-background/95 px-2 py-1 text-xs font-medium text-foreground">
						<Star className="h-3.5 w-3.5 fill-primary text-primary" />
						<span>{Number(guide.avg_rating || 0).toFixed(1)}</span>
					</div>
				</div>

				<div className="space-y-3 p-4">
					<div className="space-y-1">
						<h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary">
							{guide.full_name}
						</h3>
						<p className="line-clamp-1 text-sm text-muted-foreground">
							@{guide.username}
						</p>
					</div>

					<div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
						<MapPin className="h-4 w-4" />
						<span className="line-clamp-1">{displayLocation}</span>
					</div>

					<div className="flex flex-wrap gap-1.5">
						{(guide.known_languages || [])
							.slice(0, 3)
							.map((language) => (
								<Badge
									key={language}
									variant="secondary"
									className="rounded-md text-xs font-normal">
									{language}
								</Badge>
							))}
						{(guide.known_languages || []).length > 3 ? (
							<Badge
								variant="outline"
								className="rounded-md text-xs font-normal">
								+{guide.known_languages.length - 3}
							</Badge>
						) : null}
					</div>

					<div className="border-t pt-3 text-sm text-primary">
						View guide profile
					</div>
				</div>
			</Card>
		</Link>
	);
}
