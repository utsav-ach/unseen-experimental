"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity } from "@/backend/schemas";
import { Clock, BarChart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityCardProps {
	activity: Activity;
	index: number;
}

export function ActivityCard({ activity, index }: ActivityCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full">
			{/* Visual Header */}
			<div className="relative aspect-[4/3] overflow-hidden">
				<Image
					src={
						activity.featured_image ||
						"https://images.unsplash.com/photo-1544558635-667480601430?auto=format&fit=crop&q=80"
					}
					alt={activity.name}
					fill
					className="object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				{/* Category Overlay */}
				<div className="absolute top-4 left-4 z-10">
					<Badge
						variant="secondary"
						className="bg-background/80 backdrop-blur-md border-none px-3 py-1 text-[10px] tracking-widest font-bold uppercase text-muted-foreground shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
						{activity.display_category || "ADVENTURE"}
					</Badge>
				</div>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
			</div>

			{/* Content Body */}
			<div className="p-6 flex flex-col flex-grow">
				<h3 className="text-xl font-serif font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
					{activity.name}
				</h3>
				<p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow leading-relaxed">
					{activity.description}
				</p>

				{/* Enrichment Meta */}
				<div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground/80 mb-6 border-t border-border/40 pt-4">
					<div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
						<Clock className="w-3 h-3 text-primary/70" />
						<span>{activity.duration_range || "1-3 Days"}</span>
					</div>
					<div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
						<BarChart className="w-3 h-3 text-primary/70" />
						<span>{activity.difficulty || "Moderate"}</span>
					</div>
				</div>

				{/* Action Call */}
				<Link
					href={`/activities/details/${activity.id}`}
					className="inline-flex items-center gap-2 text-[12px] font-bold text-primary hover:gap-3 transition-all duration-300 group/link">
					Explore
					<ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
				</Link>
			</div>
		</motion.div>
	);
}
