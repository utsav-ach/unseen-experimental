"use client";

import { useEffect, use } from "react";
import { useActivityStore } from "@/backend/v2/stores/useActivityStore";
import DestinationGridCard from "@/components/destinations/destination-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { MapPin, Sparkles, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ActivityDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const {
		selectedActivity,
		destinationsByActivity,
		isLoading,
		fetchDestinationsByActivity,
		clearDetailState,
		error,
	} = useActivityStore();

	useEffect(() => {
		fetchDestinationsByActivity(id);
		return () => clearDetailState();
	}, [id, fetchDestinationsByActivity, clearDetailState]);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-background">
				<div className="bg-destructive/10 p-4 rounded-full mb-4">
					<Info className="w-8 h-8 text-destructive" />
				</div>
				<h2 className="text-2xl font-serif font-bold text-foreground mb-2">
					Adventure Unavailable
				</h2>
				<p className="text-muted-foreground max-w-md mb-6">{error}</p>
				<Link
					href="/activities"
					className="text-primary font-bold hover:underline">
					Return to Signature Activities
				</Link>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-background">
			{/* Dynamic Hero Section */}
			<section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
				{isLoading ? (
					<Skeleton className="absolute inset-0" />
				) : selectedActivity ? (
					<>
						<motion.div
							initial={{ scale: 1.1 }}
							animate={{ scale: 1 }}
							transition={{ duration: 1.5 }}
							className="absolute inset-0">
							<Image
								src={
									selectedActivity.featured_image ||
									"/placeholder-activity.jpg"
								}
								alt={selectedActivity.name}
								fill
								className="object-cover"
								priority
							/>
							<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
						</motion.div>

						<div className="relative z-10 text-center px-4 pt-20">
							<Link
								href="/activities"
								className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] mb-8 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
								<ArrowLeft className="w-3.5 h-3.5" />
								Back to Gallery
							</Link>

							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								className="max-w-4xl mx-auto">
								<div className="flex justify-center mb-4">
									<div className="bg-primary/20 backdrop-blur-xl px-4 py-1.5 rounded-full border border-primary/30 flex items-center gap-2">
										<Sparkles className="w-3.5 h-3.5 text-primary" />
										<span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground">
											{selectedActivity.display_category ||
												"Adventure"}
										</span>
									</div>
								</div>
								<h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-6 drop-shadow-2xl leading-none">
									{selectedActivity.name}
								</h1>
								<p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
									{selectedActivity.description}
								</p>
							</motion.div>
						</div>
					</>
				) : null}
			</section>

			{/* Linked Hubs Section */}
			<section className="relative -mt-20 z-20 px-4 md:px-8 pb-32">
				<div className="max-w-7xl mx-auto">
					<div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div className="space-y-2">
							<h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
								Premier{" "}
								<span className="italic text-primary/80">
									Hubs & Hideaways
								</span>
							</h2>
							<p className="text-muted-foreground font-medium">
								Choose a base camp where{" "}
								<span className="text-primary font-bold">
									{selectedActivity?.name}
								</span>{" "}
								is best experienced.
							</p>
						</div>
						<div className="bg-muted/50 backdrop-blur-md border border-border/50 px-6 py-4 rounded-3xl flex items-center gap-4">
							<div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
								<MapPin className="w-5 h-5 text-primary" />
							</div>
							<div>
								<div className="text-xs font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
									Topography
								</div>
								<div className="text-sm font-bold text-foreground">
									{destinationsByActivity.length} Global Hubs
									Linked
								</div>
							</div>
						</div>
					</div>

					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{[1, 2, 3].map((i) => (
								<Skeleton
									key={i}
									className="h-[500px] w-full rounded-[3rem]"
								/>
							))}
						</div>
					) : destinationsByActivity.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{destinationsByActivity.map((destination) => (
								<DestinationGridCard
									key={destination.id}
									destination={destination}
								/>
							))}
						</div>
					) : (
						<div className="min-h-[40vh] flex flex-col items-center justify-center p-20 bg-muted/20 border border-dashed border-border rounded-[3rem] text-center">
							<div className="bg-muted p-6 rounded-full mb-6">
								<MapPin className="w-10 h-10 text-muted-foreground/30" />
							</div>
							<h3 className="text-xl font-bold text-foreground mb-2">
								No Registered Hubs
							</h3>
							<p className="text-muted-foreground max-w-sm mb-6">
								We are currently verifying the topographical
								conditions for this activity. Check back soon
								for supported locations.
							</p>
							<Link
								href="/destinations"
								className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-primary/20">
								Explore All Destinations
							</Link>
						</div>
					)}
				</div>
			</section>

			{/* Decorative Accents */}
			<div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.03)_0%,transparent_50%)]" />
		</main>
	);
}
