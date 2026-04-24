import { Metadata } from "next";
import { AdminUsersPage } from "@/components/admin/admin-users-page";

export const metadata: Metadata = {
	title: "Users & Roles Admin | Unseen Nepal",
	description: "Manage profile roles and admin access flags.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminUsersPage />;
}
