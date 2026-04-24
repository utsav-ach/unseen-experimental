import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Trek-Dai Guides | Unseen Nepal",
	description:
		"Find trusted local Trek-Dai guides in Nepal, compare ratings, and start your booking negotiation.",
	openGraph: {
		title: "Trek-Dai Guides | Unseen Nepal",
		description:
			"Browse approved and available local guides for your next trip in Nepal.",
	},
};

export default function TrekDaiLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
