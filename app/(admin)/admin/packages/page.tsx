import { Metadata } from "next";
import { AdminPackagesPage } from "@/components/admin/admin-packages-page";

export const metadata: Metadata = {
	title: "Packages Admin | Unseen Nepal",
	description: "Manage direct-booking package inventory.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminPackagesPage />;
}
