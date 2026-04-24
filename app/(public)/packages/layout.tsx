import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Direct Booking | Travel Packages - Unseen Nepal",
	description:
		"Masterfully curated itineraries through Nepal's most breathtaking landscapes. Zero negotiation, direct booking, and professional coordination.",
};

export default function PackagesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
