import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Edit Story | Unseen Nepal Creator Studio",
	description:
		"Refine your narrative. Manage tags, categories, and cover visuals for your stories in the Unseen Nepal community.",
};

export default function EditStoryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
