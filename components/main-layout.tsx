"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import Footer from "./home-page/Footer";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAuthPage =
		pathname === "/login" ||
		pathname === "/signup" ||
		pathname.startsWith("/auth");
	const isHomePage = pathname === "/";
	const isAdminPage = pathname.startsWith("/admin");
	const hideNavbar = isAuthPage || isHomePage || isAdminPage;
	const hideFooter = isAdminPage || isAuthPage;

	return (
		<div className="flex min-h-screen flex-col bg-background transition-all duration-500">
			{!hideNavbar && <Navbar />}
			{/* <ScrollPlane /> */}
			<main
				className={cn(
					"flex-1 transition-all duration-500",
					!hideNavbar && "pt-20",
				)}>
				<div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
					{children}
				</div>
			</main>
			{!hideFooter && <Footer />}
		</div>
	);
}
