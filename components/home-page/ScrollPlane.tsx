"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function ScrollPlane() {
	const { scrollYProgress } = useScroll();

	// First plane - enters from left, exits right
	const x1 = useTransform(scrollYProgress, [0.05, 0.7], ["-50%", "150%"]);
	const y1 = useTransform(scrollYProgress, [0.05, 0.7], [150, -100]);
	const rotate1 = useTransform(scrollYProgress, [0.05, 0.7], [15, -8]);
	const scale1 = useTransform(
		scrollYProgress,
		[0.05, 0.4, 0.7],
		[0.7, 1.2, 0.9],
	);
	const opacity1 = useTransform(
		scrollYProgress,
		[0.05, 0.1, 0.65, 0.7],
		[0, 1, 1, 0],
	);

	// Second plane (mirrored) - enters from right, exits left, different timing
	const x2 = useTransform(scrollYProgress, [0.2, 0.85], ["150%", "-50%"]);
	const y2 = useTransform(scrollYProgress, [0.2, 0.85], [-50, 200]);
	const rotate2 = useTransform(scrollYProgress, [0.2, 0.85], [-15, 8]);
	const scale2 = useTransform(
		scrollYProgress,
		[0.2, 0.5, 0.85],
		[0.6, 1.1, 0.8],
	);
	const opacity2 = useTransform(
		scrollYProgress,
		[0.2, 0.25, 0.8, 0.85],
		[0, 1, 1, 0],
	);

	return (
		<>
			{/* First Plane */}
			<motion.div
				style={{
					x: x1,
					y: y1,
					rotate: rotate1,
					opacity: opacity1,
					scale: scale1,
				}}
				className="fixed top-1/3 left-0 z-30 pointer-events-none hidden md:block">
				<div className="relative">
					<div className="absolute -inset-2 bg-white/6 blur-2xl rounded-full" />
					<Image
						src="/plane.png"
						alt="Flying plane"
						width={500}
						height={500}
						className="drop-shadow-2xl"
						style={{
							opacity: 0.65,
							filter: "drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))",
						}}
						priority
					/>
					<motion.div
						className="absolute -right-16 top-1/2 -translate-y-1/2 w-32 h-2 bg-gradient-to-r from-white/20 to-transparent blur-md rounded-full"
						animate={{
							opacity: [0.2, 0.35, 0.2],
							scaleX: [0.8, 1.2, 0.8],
						}}
						transition={{
							duration: 2,
							ease: "easeInOut",
							repeat: Infinity,
						}}
					/>
				</div>
			</motion.div>

			{/* Second Plane (Mirrored) */}
			<motion.div
				style={{
					x: x2,
					y: y2,
					rotate: rotate2,
					opacity: opacity2,
					scale: scale2,
				}}
				className="fixed top-2/3 left-0 z-30 pointer-events-none hidden md:block">
				<div className="relative">
					<div className="absolute -inset-2 bg-white/6 blur-2xl rounded-full" />
					<Image
						src="/plane.png"
						alt="Flying plane"
						width={500}
						height={500}
						className="drop-shadow-2xl"
						style={{
							opacity: 0.5,
							filter: "drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))",
							transform: "scaleX(-1)", // Mirror horizontally
						}}
						priority
					/>
					<motion.div
						className="absolute -left-16 top-1/2 -translate-y-1/2 w-32 h-2 bg-gradient-to-l from-white/20 to-transparent blur-md rounded-full"
						animate={{
							opacity: [0.2, 0.35, 0.2],
							scaleX: [0.8, 1.2, 0.8],
						}}
						transition={{
							duration: 2,
							ease: "easeInOut",
							repeat: Infinity,
							delay: 0.5,
						}}
					/>
				</div>
			</motion.div>
		</>
	);
}
