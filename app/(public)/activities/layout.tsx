import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Signature Activities | Unseen Nepal",
	description:
		"Curated cultural and adventure experiences. From high-altitude yoga to pristine river fishing, discover the authentic heart of mythical Nepal.",
	openGraph: {
		title: "Signature Activities | Unseen Nepal",
		description:
			"Curated cultural and adventure experiences in the Himalayas.",
		images: [
			"https://images.unsplash.com/photo-1544558635-667480601430?auto=format&fit=crop&q=80",
		],
	},
};

export default function ActivitiesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
