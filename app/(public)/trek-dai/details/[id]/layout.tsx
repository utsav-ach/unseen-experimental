import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Guide Details | Trek-Dai | Unseen Nepal",
	description:
		"View full Trek-Dai guide profile, service areas, reviews, and start negotiation for your trip.",
	openGraph: {
		title: "Guide Details | Trek-Dai | Unseen Nepal",
		description:
			"Detailed profile for Trek-Dai guides including bio, ratings, and booking action.",
	},
};

export default function TrekDaiGuideDetailsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
