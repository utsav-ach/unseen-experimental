import { Metadata } from "next";
import { AdminSettingsPage } from "@/components/admin/admin-settings-page";

export const metadata: Metadata = {
	title: "Admin Settings | Unseen Nepal",
	description: "Operational settings and admin strategy notes.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminSettingsPage />;
}
