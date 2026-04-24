import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Community Stories | Unseen Nepal",
	description:
		"Read real experiences from adventurers exploring the hidden corners of the Himalayas. Discover trails through the eyes of those who walked them.",
};

export default function StoriesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
