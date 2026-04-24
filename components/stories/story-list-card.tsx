"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Heart, MessageSquare, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StoryListCard({
	story,
}: {
	story: {
		id: string;
		title: string;
		description: string;
		feature_image?: string | null;
		categories?: string | null;
		created_at: string;
		likes_count: number;
		comments_count: number;
		author?: {
			name?: string;
			username: string;
			avatar?: string | null;
		} | null;
	};
}) {
	const authorName =
		story.author?.name || story.author?.username || "Anonymous";
	const authorAvatar =
		story.author?.avatar ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;

	return (
		<Link href={`/stories/${story.id}`}>
			<Card className="group h-full border bg-card hover:border-primary/50 transition-all rounded-lg overflow-hidden hover:shadow-lg">
				<div className="flex flex-col sm:flex-row h-full">
					{/* Image - Left on desktop, top on mobile */}
					{story.feature_image && (
						<div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-muted">
							<Image
								src={story.feature_image}
								alt={story.title}
								fill
								className="object-cover group-hover:scale-105 transition-transform duration-300"
							/>
							{story.categories && (
								<Badge className="absolute top-3 left-3 bg-white/95 text-foreground border-none text-xs">
									{story.categories}
								</Badge>
							)}
						</div>
					)}

					{/* Content */}
					<div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
						<div className="space-y-3">
							<h3 className="text-lg sm:text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
								{story.title}
							</h3>
							<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
								{story.description}
							</p>
						</div>

						{/* Meta */}
						<div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
							<div className="flex items-center gap-3">
								{story.author && (
									<div className="flex items-center gap-2">
										<div className="relative w-8 h-8 rounded-full overflow-hidden">
											<Image
												src={authorAvatar}
												alt={authorName}
												fill
												className="object-cover"
											/>
										</div>
										<div className="flex flex-col">
											<span className="text-xs font-semibold text-foreground">
												{authorName}
											</span>
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Calendar className="h-3 w-3" />
												{format(
													new Date(story.created_at),
													"MMM dd",
												)}
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="flex items-center gap-4">
								<div className="flex items-center gap-1 text-muted-foreground">
									<Heart className="h-4 w-4" />
									<span className="text-xs font-medium">
										{story.likes_count || 0}
									</span>
								</div>
								<div className="flex items-center gap-1 text-muted-foreground">
									<MessageSquare className="h-4 w-4" />
									<span className="text-xs font-medium">
										{story.comments_count || 0}
									</span>
								</div>
								<ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
						</div>
					</div>
				</div>
			</Card>
		</Link>
	);
}
