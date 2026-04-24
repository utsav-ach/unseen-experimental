"use client";

import { MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function PackageBookingActions({
	onBook,
	onMessage,
}: {
	onBook: () => void;
	onMessage: () => void;
}) {
	return (
		<section className="space-y-4 rounded-lg border bg-card p-6">
			<h3 className="text-lg font-semibold text-foreground">
				Ready to explore?
			</h3>

			<div className="space-y-3">
				<Button
					onClick={onBook}
					className="h-11 w-full rounded-lg group"
					size="lg">
					Confirm and book this trip
					<ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
				</Button>

				<Button
					onClick={onMessage}
					variant="outline"
					className="h-11 w-full rounded-lg gap-2"
					size="lg">
					<MessageCircle className="h-4 w-4" />
					Message us on WhatsApp
				</Button>
			</div>

			<Separator className="my-4" />

			<div className="space-y-3">
				<div className="flex items-start gap-3">
					<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
						<span className="text-xs font-bold text-primary">
							✓
						</span>
					</div>
					<p className="text-xs text-foreground/75 leading-relaxed">
						Direct booking available. No negotiations required.
					</p>
				</div>

				<div className="flex items-start gap-3">
					<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
						<span className="text-xs font-bold text-primary">
							✓
						</span>
					</div>
					<p className="text-xs text-foreground/75 leading-relaxed">
						Professional coordination and planning with our team.
					</p>
				</div>

				<div className="flex items-start gap-3">
					<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
						<span className="text-xs font-bold text-primary">
							✓
						</span>
					</div>
					<p className="text-xs text-foreground/75 leading-relaxed">
						Flexible dates and customization options available.
					</p>
				</div>
			</div>
		</section>
	);
}
