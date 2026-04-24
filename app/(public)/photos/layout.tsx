import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Photos | Unseen Nepal",
	description:
		"Browse community travel photos from Nepal and share your own moments with an optional location pin.",
};

export default function PhotosLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
