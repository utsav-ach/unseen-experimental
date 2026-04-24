import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Guide Portal | Unseen Nepal",
	description:
		"Guide workspace for managing registration, request reviews, and booking negotiations on Unseen Nepal.",
	openGraph: {
		title: "Guide Portal | Unseen Nepal",
		description:
			"Secure guide workspace for request management and traveler negotiations.",
	},
};

export default function GuideLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
