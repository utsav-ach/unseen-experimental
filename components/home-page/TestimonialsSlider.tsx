import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
	{
		id: 1,
		name: "Sarah Johnson",
		location: "United States",
		rating: 5,
		text: "Unseen Nepal showed me places I never knew existed. The hidden trails and authentic experiences were beyond my expectations!",
		image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
	},
	{
		id: 2,
		name: "Raj Patel",
		location: "United Kingdom",
		rating: 5,
		text: "Best travel experience of my life. The guides were knowledgeable and the destinations were absolutely breathtaking.",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
	},
	{
		id: 3,
		name: "Emma Wilson",
		location: "Australia",
		rating: 5,
		text: "As a solo female traveler, I felt completely safe. The team went above and beyond to ensure an unforgettable journey.",
		image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
	},
	{
		id: 4,
		name: "Michael Chen",
		location: "Canada",
		rating: 5,
		text: "The hidden gems we discovered were incredible. This isn't your typical tourist experience - it's authentic Nepal!",
		image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
	},
];

export default function TestimonialsSlider() {
	return (
		<section className="bg-background py-16 sm:py-20">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 max-w-2xl sm:mb-10">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						What travelers say
					</h2>
					<p className="mt-2 text-sm text-muted-foreground sm:text-base">
						Reviews from people who booked destinations and guides
						through Unseen Nepal.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{testimonials.map((testimonial) => (
						<Card key={testimonial.id} className="rounded-xl border bg-card">
							<CardContent className="p-5 sm:p-6">
								<div className="mb-4 flex items-center gap-3">
									<Avatar className="h-11 w-11 border">
										<AvatarImage
											src={testimonial.image}
											alt={testimonial.name}
											className="object-cover"
										/>
										<AvatarFallback>
											{testimonial.name[0]}
										</AvatarFallback>
									</Avatar>

									<div>
										<h4 className="text-sm font-semibold text-foreground">
											{testimonial.name}
										</h4>
										<p className="text-xs text-muted-foreground">
											{testimonial.location}
										</p>
									</div>
								</div>

								<div className="mb-3 flex gap-1">
									{[...Array(testimonial.rating)].map((_, i) => (
										<Star
											key={i}
											className="h-4 w-4 fill-primary text-primary"
										/>
									))}
								</div>

								<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
									{testimonial.text}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
