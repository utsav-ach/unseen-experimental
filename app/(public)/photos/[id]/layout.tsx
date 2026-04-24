import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Photo Details | Unseen Nepal",
	description:
		"View a shared travel photo with its optional location and community caption.",
};

export default function PhotoDetailsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
