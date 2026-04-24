"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="relative overflow-hidden rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
			suppressHydrationWarning>
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={theme === "dark" ? "dark" : "light"}
					initial={{ y: 20, opacity: 0, rotate: -45 }}
					animate={{ y: 0, opacity: 1, rotate: 0 }}
					exit={{ y: -20, opacity: 0, rotate: 45 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
					className="flex items-center justify-center"
					suppressHydrationWarning>
					{theme === "dark" ? (
						<Sun className="h-5 w-5 text-primary" />
					) : (
						<Moon className="h-5 w-5 text-primary-dark" />
					)}
				</motion.div>
			</AnimatePresence>
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
