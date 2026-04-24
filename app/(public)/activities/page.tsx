"use client";

import { useEffect } from "react";
import { useActivityStore } from "@/backend/v2/stores/useActivityStore";
import { ActivityCard } from "@/components/activities/activity-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";

export default function ActivitiesPage() {
	const { activities, isLoading, fetchActivities, error } =
		useActivityStore();

	useEffect(() => {
		fetchActivities();
	}, [fetchActivities]);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive p-8 animate-in fade-in slide-in-from-bottom-4">
				<div className="bg-destructive/10 p-4 rounded-full mb-4">
					<Sparkles className="w-8 h-8" />
				</div>
				<h2 className="text-2xl font-serif font-bold mb-2">
					Discovery Interrupted
				</h2>
				<p className="text-muted-foreground text-center max-w-md">
					{error}
				</p>
				<button
					onClick={() => fetchActivities(true)}
					className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/20">
					Try Discovery Again
				</button>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-background relative overflow-hidden">
			{/* Visual Accents (Background patterns) */}
			<div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/2 rounded-full blur-[120px] -z-10 pointer-events-none" />
			<div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-primary/2 rounded-full blur-[150px] -z-10 pointer-events-none" />

			{/* Hero Section (Aesthetic alignment with Signature Activities header) */}
			<section className="relative pt-32 pb-16 px-4 md:px-8">
				<div className="max-w-7xl mx-auto">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center gap-2 text-primary tracking-[0.2em] font-bold text-[10px] uppercase mb-4">
						<Sparkles className="w-3.5 h-3.5" />
						Signature Activities
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="max-w-3xl">
						<h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
							Curated{" "}
							<span className="italic text-primary/80">
								Experiences
							</span>
						</h1>
						<p className="text-lg text-muted-foreground leading-relaxed font-medium">
							Choose your adventure — each crafted for comfort,
							safety, and unforgettable memories. Our activities
							are designed to immerse you in the authentic heart
							of legendary Nepal.
						</p>
					</motion.div>
				</div>
			</section>

			{/* Content Grid */}
			<section className="pb-32 px-4 md:px-8">
				<div className="max-w-7xl mx-auto">
					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<div key={i} className="space-y-4">
									<Skeleton className="aspect-[4/3] w-full rounded-2xl" />
									<div className="space-y-4 pt-2">
										<Skeleton className="h-4 w-1/4 rounded-full" />
										<Skeleton className="h-8 w-3/4" />
										<Skeleton className="h-20 w-full" />
									</div>
								</div>
							))}
						</div>
					) : activities.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
							{activities.map((activity, idx) => (
								<ActivityCard
									key={activity.id}
									activity={activity}
									index={idx}
								/>
							))}
						</div>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="min-h-[40vh] flex flex-col items-center justify-center p-12 bg-muted/20 border border-border/50 rounded-3xl backdrop-blur-sm">
							<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
								<Compass className="w-8 h-8 text-muted-foreground/30 animate-pulse" />
							</div>
							<p className="text-muted-foreground/60 font-medium text-lg italic">
								Our team is currently scouting new adventures.
								Stay tuned.
							</p>
						</motion.div>
					)}
				</div>
			</section>
		</main>
	);
}
