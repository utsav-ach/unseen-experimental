"use client";

export default function ParallaxDivider() {
	return (
		<div className="relative h-[400px] md:h-[500px] overflow-hidden">
			{/* Animated Gradient Background */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-cream" />
				<div
					className="absolute inset-0 opacity-40"
					style={{
						background:
							"radial-gradient(ellipse at 50% 50%, rgba(201, 169, 110, 0.3) 0%, transparent 70%)",
						animation: "float 10s ease-in-out infinite",
					}}
				/>
				<div
					className="absolute inset-0 opacity-30"
					style={{
						background:
							"linear-gradient(45deg, rgba(196, 112, 74, 0.15) 0%, rgba(107, 140, 107, 0.15) 100%)",
						animation: "slide 12s ease-in-out infinite alternate",
					}}
				/>
			</div>

			{/* Animation defined in globals.css or using standard style tag */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                @keyframes slide {
                    0% { transform: translateX(-20px); }
                    100% { transform: translateX(20px); }
                }
            `,
				}}
			/>

			{/* Overlay gradient for depth */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
		</div>
	);
}
