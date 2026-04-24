"use client";

import { Clock, MapPin, AlertCircle, Package } from "lucide-react";

export function PackageInfoGrid({
	duration,
	packageType,
	destination,
}: {
	duration: number;
	packageType: "destinations_package" | "activities_package";
	destination?: string | null;
}) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
			<div className="space-y-2 rounded-lg bg-muted/30 p-4">
				<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
					Duration
				</p>
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-primary" />
					<span className="text-sm font-semibold text-foreground">
						{duration} days
					</span>
				</div>
			</div>

			<div className="space-y-2 rounded-lg bg-muted/30 p-4">
				<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
					Package type
				</p>
				<div className="flex items-center gap-2">
					<Package className="h-4 w-4 text-primary" />
					<span className="text-sm font-semibold text-foreground">
						{packageType === "activities_package"
							? "Activities"
							: "Destination"}
					</span>
				</div>
			</div>

			{destination && (
				<div className="space-y-2 rounded-lg bg-muted/30 p-4">
					<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
						Location
					</p>
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-primary" />
						<span className="text-sm font-semibold text-foreground truncate">
							{destination}
						</span>
					</div>
				</div>
			)}

			<div className="space-y-2 rounded-lg bg-muted/30 p-4">
				<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
					Best for
				</p>
				<div className="flex items-center gap-2">
					<AlertCircle className="h-4 w-4 text-primary" />
					<span className="text-sm font-semibold text-foreground">
						All levels
					</span>
				</div>
			</div>
		</div>
	);
}
