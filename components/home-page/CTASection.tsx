import Link from "next/link";

export default function CTASection() {
	return (
		<section className="relative py-28 px-4 bg-black overflow-hidden">
			{/* Golden glow effect */}
			<div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gold/20 blur-[120px] pointer-events-none" />

			{/* Subtle dot pattern */}
			<div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

			{/* Floating elements */}
			<div className="absolute w-32 h-32 bg-gold/10 rounded-full top-10 left-10 animate-pulse" />
			<div className="absolute w-24 h-24 bg-gold/10 rounded-full bottom-20 right-20 animate-pulse delay-1000" />

			{/* Plane trail continuation */}
			<div className="absolute bottom-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

			{/* Content */}
			<div className="relative z-10 max-w-4xl mx-auto text-center">
				<h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 animate-float">
					Start Your Journey Today
				</h2>
				<p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
					Let us guide you through the hidden wonders of Nepal. Your
					adventure of a lifetime awaits.
				</p>
				<Link
					href="/destinations"
					className="inline-block bg-gold hover:bg-goldLight text-ink px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:scale-105 transform hover:shadow-gold/50">
					Explore Now
				</Link>
			</div>
		</section>
	);
}
