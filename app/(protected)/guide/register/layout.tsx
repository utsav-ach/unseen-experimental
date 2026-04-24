import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Become a Guide | Unseen Nepal",
	description:
		"Join the Unseen Nepal community as a certified guide. Share your local knowledge, lead explorers through hidden gems, and monetize your passion for adventure.",
};

export default function GuideRegisterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
