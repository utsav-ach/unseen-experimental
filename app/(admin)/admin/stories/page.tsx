import { Metadata } from "next";
import { AdminStoriesPage } from "@/components/admin/admin-stories-page";

export const metadata: Metadata = {
	title: "Stories Moderation | Unseen Nepal",
	description: "Moderate community stories from the admin workspace.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminStoriesPage />;
}
