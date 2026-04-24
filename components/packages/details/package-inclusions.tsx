"use client";

import { CheckCircle2, Fuel, Home, MapPin } from "lucide-react";

export function PackageInclusions() {
	const inclusions = [
		{ icon: Home, label: "Accommodation" },
		{ icon: Fuel, label: "Transportation" },
		{ icon: MapPin, label: "Local guide services" },
		{ icon: CheckCircle2, label: "All meals included" },
	];

	return (
		<section className="space-y-4 rounded-lg border bg-card p-6">
			<h3 className="text-lg font-semibold text-foreground">
				What's included
			</h3>
			<div className="grid grid-cols-2 gap-3">
				{inclusions.map((item, idx) => {
					const Icon = item.icon;
					return (
						<div key={idx} className="flex items-center gap-3">
							<Icon className="h-4 w-4 text-primary flex-shrink-0" />
							<span className="text-sm text-foreground/85">
								{item.label}
							</span>
						</div>
					);
				})}
			</div>
		</section>
	);
}
