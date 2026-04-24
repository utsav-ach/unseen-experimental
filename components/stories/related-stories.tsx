"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StoryListCard } from "./story-list-card";

export function RelatedStories({
	stories,
}: {
	stories: Array<{
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
	}>;
}) {
	if (!stories || stories.length === 0) return null;

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-foreground">
					More stories
				</h2>
				<Link
					href="/stories"
					className="flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
					View all <ChevronRight className="h-4 w-4" />
				</Link>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{stories.slice(0, 3).map((story) => (
					<StoryListCard key={story.id} story={story} />
				))}
			</div>
		</section>
	);
}
