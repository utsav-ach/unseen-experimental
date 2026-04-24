import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Guide Dashboard | Requests | Unseen Nepal",
	description:
		"Review incoming travel requests, open request details, and manage guide negotiation responses.",
	openGraph: {
		title: "Guide Dashboard | Requests | Unseen Nepal",
		description:
			"Guide request dashboard for approvals, rejections, and trip cost proposals.",
	},
};

export default function GuideRequestsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
