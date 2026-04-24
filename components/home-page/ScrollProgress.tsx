"use client";

import { useScroll, motion } from "framer-motion";

export default function ScrollProgress() {
	const { scrollYProgress } = useScroll();

	return (
		<motion.div
			style={{ scaleX: scrollYProgress }}
			className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent via-yellow-500 to-accent origin-left z-50"
		/>
	);
}
