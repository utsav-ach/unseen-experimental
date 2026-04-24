import { Map, UserCheck, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
	{
		icon: Map,
		title: "Pick your destination",
		description:
			"Choose from featured destinations or select any location from the map.",
	},
	{
		icon: UserCheck,
		title: "Choose your guide",
		description:
			"Review available guides in the area and send a hire request with your travel details.",
	},
	{
		icon: CreditCard,
		title: "Confirm and pay",
		description:
			"Finalize negotiation, pay the required amount, and complete your booking.",
	},
];

export default function ExperienceSection() {
	return (
		<section
			className="bg-background py-16 sm:py-20"
			suppressHydrationWarning>
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 max-w-2xl sm:mb-10">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						How booking works
					</h2>
					<p className="mt-2 text-sm text-muted-foreground sm:text-base">
						Follow the three-step negotiation flow to plan your trip
						with full flexibility.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{steps.map((step, index) => {
						const IconComponent = step.icon;
						return (
							<Card
								key={step.title}
								className="h-full rounded-xl border bg-card">
								<CardContent className="space-y-3 p-5">
									<div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
										<IconComponent className="h-4 w-4 text-primary" />
									</div>
									<div className="text-xs font-medium text-muted-foreground">
										Step {index + 1}
									</div>
									<h3 className="text-base font-semibold text-foreground">
										{step.title}
									</h3>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{step.description}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
