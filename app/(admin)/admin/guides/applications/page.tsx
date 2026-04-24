import { Metadata } from "next";
import { AdminGuideApplicationsPage } from "@/components/admin/admin-guide-applications-page";

export const metadata: Metadata = {
	title: "Guide Applications Admin | Unseen Nepal",
	description: "Review and process incoming guide applications.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminGuideApplicationsPage />;
}
