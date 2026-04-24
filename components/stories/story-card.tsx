"use client";

import Image from "next/image";
import Link from "next/link";
import {
	Heart,
	MessageSquare,
	ArrowRight,
	Calendar,
	ChevronRight,
	Tag,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import GFMRender from "../ui/gfm-render";

interface StoryGridCardProps {
	story: any; // We use any because RPC returns hydrated story with author
	className?: string;
}

export default function StoryGridCard({
	story,
	className,
}: StoryGridCardProps) {
	const authorName = story.author
		? `${story.author.name || story.author.username}`
		: "Anonymous Explorer";

	const authorAvatar =
		story.author?.avatar ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

	return (
		<motion.div
			whileHover={{ y: -8 }}
			className={cn("group flex flex-col h-full", className)}>
			<Link href={`/stories/${story.id}`} className="block h-full">
				<Card className="h-full border-none shadow-none bg-transparent flex flex-col overflow-hidden">
					{/* Media Container */}
					<div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-muted mb-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] group-hover:shadow-[0_40px_64px_-16px_rgba(0,0,0,0.2)] transition-all duration-700">
						<Image
							src={story.feature_image}
							alt={story.title}
							fill
							className="object-cover transition-transform duration-1000 group-hover:scale-110"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

						{/* Overlay Metadata */}
						<div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
							{story.categories && (
								<Badge className="bg-white/95 text-primary border-none py-1.5 px-4 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-sm">
									{story.categories}
								</Badge>
							)}
							<div className="bg-black/20 backdrop-blur-md border border-white/20 text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
								<ArrowRight className="w-4 h-4" />
							</div>
						</div>

						{/* Author Info Bottom Overlay */}
						<div className="absolute bottom-6 left-6 right-6 z-10 flex items-center gap-3">
							<div className="relative h-10 w-10 rounded-full border-2 border-white/30 overflow-hidden shadow-2xl">
								<Image
									src={authorAvatar}
									alt={authorName}
									fill
									className="object-cover"
								/>
							</div>
							<div className="flex flex-col">
								<span className="text-white font-black text-[10px] uppercase tracking-widest leading-none mb-1 shadow-black/40 drop-shadow-sm">
									{authorName}
								</span>
								<span className="text-white/70 font-bold text-[9px] uppercase tracking-widest leading-none drop-shadow-sm">
									{format(
										new Date(story.created_at),
										"MMM dd, yyyy",
									)}
								</span>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="px-2 flex flex-col flex-grow">
						<h3 className="text-3xl font-display font-black text-foreground mb-4 leading-[1.1] transition-colors group-hover:text-primary uppercase tracking-tighter line-clamp-2">
							{story.title}
						</h3>

						<GFMRender
							className="text-muted-foreground/80 font-bold mb-8 line-clamp-3 text-xs leading-relaxed uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity"
							content={story.description}
						/>

						<div className="mt-auto pt-6 border-t border-primary/5 flex items-center justify-between">
							<div className="flex items-center gap-6">
								<div className="flex items-center gap-2 group/icon">
									<Heart
										className={cn(
											"w-4 h-4 transition-colors",
											story.likes_count > 0
												? "fill-red-500 text-red-500"
												: "text-muted-foreground group-hover/icon:text-red-500",
										)}
									/>
									<span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
										{story.likes_count}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<MessageSquare className="w-4 h-4 text-muted-foreground" />
									<span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
										{story.comments_count}
									</span>
								</div>
							</div>

							<div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
								Read Story <ChevronRight className="w-4 h-4" />
							</div>
						</div>
					</div>
				</Card>
			</Link>
		</motion.div>
	);
}
