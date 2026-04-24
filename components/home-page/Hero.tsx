import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
	return (
		<section
			className="relative min-h-[78vh] overflow-hidden bg-background"
			suppressHydrationWarning>
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{
					backgroundImage: "url('/bg.jpg')",
				}}
			/>
			<div className="absolute inset-0 bg-linear-to-b from-black/65 via-black/45 to-background" />

			<div className="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
				<div className="w-full max-w-3xl">
					<h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
						Plan your Nepal trip with trusted guides and clear
						pricing.
					</h1>

					<p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
						Choose a featured destination, pick a guide, and
						complete your booking in a simple three-step flow.
					</p>

					<div className="mt-8 flex flex-wrap items-center gap-3">
						<Link href="/destinations">
							<Button size="lg" className="h-11 px-6">
								Explore Destinations
							</Button>
						</Link>
						<Link href="/packages">
							<Button size="lg" variant="secondary" className="h-11 px-6">
								Explore Packages
							</Button>
						</Link>
						<Link href="/stories">
							<Button
								size="lg"
								variant="outline"
								className="h-11 border-white/30 bg-transparent px-6 text-white hover:bg-white/10">
								Read Stories
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
