import { Metadata } from "next";
import { AdminActivitiesPage } from "@/components/admin/admin-activities-page";

export const metadata: Metadata = {
	title: "Activities Admin | Unseen Nepal",
	description: "Manage activity catalog and metadata.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminActivitiesPage />;
}
