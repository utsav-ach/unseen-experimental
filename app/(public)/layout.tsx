import Footer from "@/components/home-page/Footer";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";

export default function PublicRouteGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navbar />
			<main className={cn("flex-1 transition-all duration-500 pt-20")}>
				<div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
					{children}
				</div>
			</main>

			<Footer />
		</>
	);
}
