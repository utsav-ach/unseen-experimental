import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Destination Discovery | Unseen Nepal",
	description:
		"Explore featured destinations across Nepal. Filter by rating, zone, and find your next Himalayan target.",
};

export default function DestinationsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
