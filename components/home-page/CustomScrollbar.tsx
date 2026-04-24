"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function CustomScrollbar() {
	const [scrollProgress, setScrollProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const rafRef = useRef<number | null>(null);
	const trackRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (isDragging) return; // Don't update while dragging

			// Cancel previous animation frame
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}

			// Use requestAnimationFrame for smooth updates
			rafRef.current = requestAnimationFrame(() => {
				const windowHeight = window.innerHeight;
				const documentHeight = document.documentElement.scrollHeight;
				const scrollTop = window.scrollY;
				const scrollableHeight = documentHeight - windowHeight;
				const progress = (scrollTop / scrollableHeight) * 100;
				setScrollProgress(Math.min(100, Math.max(0, progress)));
			});
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [isDragging]);

	const scrollToPosition = (clientY: number) => {
		if (!trackRef.current) return;

		const rect = trackRef.current.getBoundingClientRect();
		const y = clientY - rect.top;
		const percentage = Math.min(100, Math.max(0, (y / rect.height) * 100));

		const documentHeight = document.documentElement.scrollHeight;
		const windowHeight = window.innerHeight;
		const scrollableHeight = documentHeight - windowHeight;
		const scrollTo = (percentage / 100) * scrollableHeight;

		window.scrollTo({ top: scrollTo, behavior: "auto" });
		setScrollProgress(percentage);
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
		scrollToPosition(e.clientY);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		e.preventDefault();
		scrollToPosition(e.clientY);
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleTrackClick = (e: React.MouseEvent) => {
		scrollToPosition(e.clientY);
	};

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.userSelect = "none";
			document.body.style.cursor = "grabbing";
		} else {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
		};
	}, [isDragging]);

	return (
		<div className="fixed right-8 top-24 bottom-24 z-50 hidden md:flex items-center">
			{/* Vertical Track (Box) - Made bigger */}
			<div
				ref={trackRef}
				onClick={handleTrackClick}
				className="relative w-3 h-full cursor-pointer">
				{/* Track background */}
				<div
					className="absolute inset-0 bg-gradient-to-b from-gold/30 via-gold/20 to-gold/30 rounded-full"
					style={{
						boxShadow: "0 0 20px rgba(201, 169, 110, 0.4)",
					}}
				/>

				{/* Plane (Circle) that moves along the track */}
				<div
					onMouseDown={handleMouseDown}
					className={`absolute left-1/2 -translate-x-1/2 will-change-transform z-10 ${
						isDragging ? "cursor-grabbing" : "cursor-grab"
					}`}
					style={{
						top: `${scrollProgress}%`,
						transform: `translate(-50%, -50%)`,
					}}>
					{/* Glow Effect */}
					<div className="absolute inset-0 -m-8 bg-gold/40 blur-2xl rounded-full animate-pulse" />

					{/* Plane Image */}
					<div className="relative w-20 h-20 pointer-events-none">
						<Image
							src="/nav.png"
							alt="Scroll indicator"
							fill
							className="drop-shadow-2xl object-contain"
							style={{
								filter: "drop-shadow(0 8px 20px rgba(201, 169, 110, 0.8))",
							}}
							draggable={false}
							priority
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
