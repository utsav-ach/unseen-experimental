import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Request Details | Guide Dashboard | Unseen Nepal",
	description:
		"View request details and send approval or rejection with pricing and remarks for each traveler request.",
	openGraph: {
		title: "Request Details | Guide Dashboard | Unseen Nepal",
		description:
			"Detailed view of traveler request data for guide-side negotiation.",
	},
};

export default function GuideRequestDetailLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
