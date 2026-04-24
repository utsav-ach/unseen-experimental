"use client";

import { MapPin, Calendar } from "lucide-react";

export function PackageItinerary({ travelRoutes }: { travelRoutes: string }) {
	return (
		<section className="space-y-4 rounded-lg border bg-card p-6">
			<div className="flex items-center gap-2">
				<Calendar className="h-5 w-5 text-primary" />
				<h3 className="text-lg font-semibold text-foreground">
					Itinerary
				</h3>
			</div>
			<div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
				<div className="space-y-3 whitespace-pre-wrap leading-relaxed text-foreground/85 text-sm">
					{travelRoutes}
				</div>
			</div>
		</section>
	);
}
