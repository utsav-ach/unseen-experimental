"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function FloatingCTA() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.scrollY > 650) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	return (
		<>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: 20 }}
					className="fixed bottom-8 right-8 z-40">
					<Link
						href="/destinations"
						className="group relative inline-flex items-center gap-2 bg-primary hover:bg-primaryDark text-white px-6 py-4 rounded-full font-semibold shadow-2xl hover:shadow-accent/50 transition-all duration-300 hover:scale-110">
						<span>Explore Now</span>
						<motion.span
							animate={{ x: [0, 5, 0] }}
							transition={{ duration: 1.5, repeat: Infinity }}>
							→
						</motion.span>

						{/* Ripple effect but smaller */}
						<span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
					</Link>
				</motion.div>
			)}
		</>
	);
}
