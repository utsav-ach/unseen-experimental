import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Package Details | Unseen Nepal",
	description:
		"View package itinerary, pricing, included activities, and direct booking information.",
};

export default function PackageDetailsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
