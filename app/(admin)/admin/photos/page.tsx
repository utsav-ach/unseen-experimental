import { Metadata } from "next";
import { AdminPhotosPage } from "@/components/admin/admin-photos-page";

export const metadata: Metadata = {
	title: "Photos Moderation | Unseen Nepal",
	description: "Moderate public gallery posts from admin panel.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminPhotosPage />;
}
