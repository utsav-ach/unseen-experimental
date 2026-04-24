import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Story | Unseen Nepal",
	description:
		"Immerse yourself in authentic narratives, hidden gems, and localized experiences shared by the Unseen Nepal community.",
};

export default function StoryDetailLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
