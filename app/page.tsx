import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import Hero from "@/components/home-page/Hero";
import FeaturedDestinations from "@/components/home-page/FeaturedDestinations";
import ExperienceSection from "@/components/home-page/ExperienceSection";
import StatsSection from "@/components/home-page/StatsSection";
import TopPackages from "@/components/home-page/TopPackages";
import FeaturedStories from "@/components/home-page/FeaturedStories";
import TestimonialsSlider from "@/components/home-page/TestimonialsSlider";
import { callRpcArray, ssrClient } from "@/supabase/server";
import {
	MinimalDestinationSchema,
	TopTrendingPackageSchema,
	TopTrendingStorySchema,
} from "@/backend/schemas";

export const metadata: Metadata = {
	title: "Unseen Nepal | Travel Destinations, Guides and Packages",
	description:
		"Explore featured destinations, trusted local guides, and ready travel packages across Nepal. Plan your trip with a clean three-step booking flow.",
};

export default async function Home() {
	const supabase = await ssrClient();

	const [destinations, packages, stories] = await Promise.all([
		callRpcArray(
			supabase,
			"get_top_trending_destinations",
			MinimalDestinationSchema,
			{ limit: 10 },
		),
		callRpcArray(
			supabase,
			"get_top_trending_packages",
			TopTrendingPackageSchema,
			{ p_limit: 6 },
		),
		callRpcArray(
			supabase,
			"get_top_trending_stories",
			TopTrendingStorySchema,
			{ p_limit: 6 },
		),
	]);

	return (
		<>
			<Navbar />
			<Hero />
			<main
				className="bg-background transition-colors duration-500"
				>
				<FeaturedDestinations data={destinations} />
				<ExperienceSection />
				<StatsSection />
				<TopPackages packages={packages} />
				<FeaturedStories stories={stories} />
				<TestimonialsSlider />
			</main>
		</>
	);
}
