"use client";

import { Sparkles } from "lucide-react";

export function PackageHighlights({ highlights }: { highlights: string[] }) {
	if (!highlights || highlights.length === 0) return null;

	return (
		<section className="space-y-4 rounded-lg border bg-card p-6">
			<div className="flex items-center gap-2">
				<Sparkles className="h-5 w-5 text-primary" />
				<h3 className="text-lg font-semibold text-foreground">
					Trip highlights
				</h3>
			</div>
			<ul className="space-y-2">
				{highlights.map((highlight, idx) => (
					<li key={idx} className="flex gap-3 text-sm">
						<span className="text-primary font-medium">•</span>
						<span className="text-foreground/85">{highlight}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
