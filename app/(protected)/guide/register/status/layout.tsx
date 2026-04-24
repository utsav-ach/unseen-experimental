import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Application Status | Guide Portal",
	description:
		"Track your guide application status on Unseen Nepal. Review admin feedback and next steps for your certification.",
};

export default function GuideStatusLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
