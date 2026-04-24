import {
	Calendar,
	ChevronRight,
	Clock,
	MapPin,
	ShieldCheck,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function PackageSummaryCard({
	pkg,
	destinationName,
	onBook,
}: {
	pkg: {
		name: string;
		actual_price: number;
		discounted_price: number;
		total_days: number;
		min_members: number;
		max_members: number;
	};
	destinationName?: string | null;
	onBook: () => void;
}) {
	return (
		<section className="space-y-6 rounded-xl border bg-card p-5 sm:p-6">
			<div className="space-y-3">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
					{pkg.name}
				</h1>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<MapPin className="h-4 w-4 text-primary" />
					<span>{destinationName || "Multiple locations"}</span>
				</div>
			</div>

			<Separator />

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground leading-none">
						Duration
					</p>
					<div className="flex items-center gap-2 text-foreground">
						<Clock className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">
							{pkg.total_days} days
						</span>
					</div>
				</div>
				<div className="space-y-1">
					<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground leading-none">
						Capacity
					</p>
					<div className="flex items-center gap-2 text-foreground">
						<Users className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">
							{pkg.min_members}-{pkg.max_members} pax
						</span>
					</div>
				</div>
			</div>

			<div className="space-y-4 rounded-xl border bg-muted/20 p-4 sm:p-5">
				<div className="space-y-1">
					<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground leading-none">
						Package price
					</p>
					<div className="flex items-baseline gap-3">
						<span className="text-3xl font-semibold text-foreground">
							Rs. {pkg.discounted_price.toLocaleString()}
						</span>
						{pkg.actual_price > pkg.discounted_price && (
							<span className="text-sm text-muted-foreground line-through">
								Rs. {pkg.actual_price.toLocaleString()}
							</span>
						)}
					</div>
				</div>

				<Button
					onClick={onBook}
					className="h-12 w-full rounded-xl group">
					Confirm and book this trip
					<ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
				</Button>

				<p className="text-center text-xs text-muted-foreground">
					Direct booking available. No negotiation required.
				</p>
			</div>

			<div className="space-y-3">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
						<ShieldCheck className="h-4 w-4 text-primary" />
					</div>
					<p className="text-sm text-muted-foreground">
						Professional coordination guarantee
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
						<Calendar className="h-4 w-4 text-primary" />
					</div>
					<p className="text-sm text-muted-foreground">
						Flexible start dates available
					</p>
				</div>
			</div>
		</section>
	);
}
