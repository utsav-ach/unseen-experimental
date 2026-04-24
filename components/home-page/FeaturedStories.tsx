import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Heart, MessageSquare, ArrowRight } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TopTrendingStory } from "@/backend/schemas";

export default function FeaturedStories({
	stories,
}: {
	stories: TopTrendingStory[];
}) {
	const featuredStories = stories.slice(0, 3);
	const isLoading = false;

	return (
		<section className="bg-background py-16 sm:py-20">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
					<div className="max-w-2xl">
						<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							Traveler stories
						</h2>
						<p className="mt-2 text-sm text-muted-foreground sm:text-base">
							Read real travel stories from our community and
							learn what to expect before your trip.
						</p>
					</div>
					<Link href="/stories">
						<Button variant="outline" className="w-fit">
							Read all stories
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{isLoading ? (
						Array(3)
							.fill(0)
							.map((_, i) => <StorySkeleton key={i} />)
					) : featuredStories.length > 0 ? (
						featuredStories.map((story) => (
							<StoryCard key={story.id} story={story} />
						))
					) : (
						<div className="col-span-full rounded-xl border bg-muted/20 py-16 text-center">
							<p className="text-muted-foreground">
								No stories shared yet. Be the first to share
								your journey!
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

function StoryCard({ story }: { story: TopTrendingStory }) {
	const authorName =
		story.author?.name || story.author?.username || "Anonymous Explorer";

	return (
		<Link href={`/stories/${story.id}`} className="group block h-full">
			<Card className="h-full overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/20">
				<div className="relative aspect-16/10 overflow-hidden">
					<Image
						src={
							story.feature_image ||
							"/images/placeholder-story.jpg"
						}
						alt={story.title}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</div>

				<CardContent className="space-y-4 p-4">
					<div className="flex items-center gap-3">
						<Avatar className="h-9 w-9 border">
							<AvatarImage src={story.author?.avatar || undefined} />
							<AvatarFallback className="text-xs">
								{authorName.slice(0, 1)}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium text-foreground leading-none">
								{authorName}
							</span>
							<span className="text-xs text-muted-foreground">
								{format(
									new Date(story.created_at),
									"MMM dd, yyyy",
								)}
							</span>
						</div>
					</div>

					<CardTitle className="line-clamp-2 text-lg font-semibold leading-snug text-foreground">
						{story.title}
					</CardTitle>

					<CardDescription className="line-clamp-3 text-sm text-muted-foreground">
							{story.description || "Read the full experience from this traveler."}
					</CardDescription>

					<div className="flex items-center gap-5 border-t pt-3 text-muted-foreground">
						<div className="flex items-center gap-1.5">
							<Heart className="h-4 w-4" />
							<span className="text-xs">{story.likes_count}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<MessageSquare className="h-4 w-4" />
							<span className="text-xs">
								{story.comments_count}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

function StorySkeleton() {
	return (
		<div className="space-y-3">
			<Skeleton className="aspect-16/10 w-full rounded-xl" />
			<div className="space-y-3">
				<div className="flex items-center gap-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="space-y-2 flex-1">
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-3 w-1/4" />
					</div>
				</div>
				<div className="space-y-2">
					<Skeleton className="h-5 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			</div>
		</div>
	);
}
