"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Navigation,
	MapPin,
	Compass,
	Loader2,
	Plus,
	Minus,
	Trash2,
	Maximize2,
	CheckCircle2,
	Info,
	Settings2,
	Layers,
	X,
	Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic imports for react-leaflet components
const MapContainer = dynamic(
	() => import("react-leaflet").then((m) => m.MapContainer),
	{ ssr: false },
);
const TileLayer = dynamic(
	() => import("react-leaflet").then((m) => m.TileLayer),
	{ ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
	ssr: false,
});
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), {
	ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
	ssr: false,
});

export interface SelectionPin {
	id: string;
	lat: number;
	lng: number;
	radius: number; // in meters (default 2km)
	address?: string;
}

interface AreaSelectorMapProps {
	initialPins?: SelectionPin[];
	onPinsChange?: (pins: SelectionPin[]) => void;
	className?: string;
}

// Fix Leaflet marker icon issue
const fixLeafletIcon = async () => {
	const L = await import("leaflet");
	// @ts-ignore
	delete L.Icon.Default.prototype._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl:
			"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
		iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
		shadowUrl:
			"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	});
};

let ReactLeaflet: any = null;

const loadReactLeaflet = async () => {
	if (ReactLeaflet) return ReactLeaflet;
	ReactLeaflet = await import("react-leaflet");
	return ReactLeaflet;
};

// Internal Components to handle map events
function MapEventsHandler({
	onAddPin,
}: {
	onAddPin: (lat: number, lng: number) => void;
}) {
	const { useMapEvents } = ReactLeaflet || {};
	if (!useMapEvents) return null;

	useMapEvents({
		click(e: any) {
			if (e.originalEvent.defaultPrevented) return;
			onAddPin(e.latlng.lat, e.latlng.lng);
		},
	});

	return null;
}

function ZoomControls({
	onZoomIn,
	onZoomOut,
}: {
	onZoomIn: () => void;
	onZoomOut: () => void;
}) {
	return (
		<div className="flex flex-col gap-1.5 shadow-2xl">
			<Button
				variant="outline"
				size="icon"
				onClick={onZoomIn}
				className="h-10 w-10 rounded-t-xl bg-background border-border text-foreground hover:bg-muted transition-all">
				<Plus className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onClick={onZoomOut}
				className="h-10 w-10 rounded-b-xl bg-background border-border text-foreground hover:bg-muted transition-all">
				<Minus className="h-4 w-4" />
			</Button>
		</div>
	);
}

export function SelectionMap({
	initialPins = [],
	onPinsChange,
	className,
}: AreaSelectorMapProps) {
	const [isClient, setIsClient] = useState(false);
	const [pins, setPins] = useState<SelectionPin[]>(initialPins);
	const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
	const [isLocating, setIsLocating] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [showResults, setShowResults] = useState(false);
	const mapRef = useRef<any>(null);

	useEffect(() => {
		const init = async () => {
			await fixLeafletIcon();
			await loadReactLeaflet();
			setIsClient(true);
		};
		init();
	}, []);

	const handleAddPin = useCallback(
		async (lat: number, lng: number, address?: string) => {
			let resolvedAddress = address;
			if (!resolvedAddress) {
				try {
					const resp = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
					);
					const data = await resp.json();
					resolvedAddress = data.display_name;
				} catch (err) {
					console.error("Reverse geocoding error", err);
				}
			}

			const newPin: SelectionPin = {
				id: Math.random().toString(36).substring(7),
				lat,
				lng,
				radius: 1000, // Default 1km
				address: resolvedAddress || "Custom Location",
			};

			setPins((prev) => {
				const updated = [...prev, newPin];
				onPinsChange?.(updated);
				return updated;
			});

			setSelectedPinId(newPin.id);
		},
		[onPinsChange],
	);

	const updatePinRadius = (id: string, radius: number) => {
		setPins((prev) => {
			const updated = prev.map((p) =>
				p.id === id ? { ...p, radius } : p,
			);
			onPinsChange?.(updated);
			return updated;
		});
	};

	const deletePin = (id: string) => {
		setPins((prev) => {
			const updated = prev.filter((p) => p.id !== id);
			onPinsChange?.(updated);
			return updated;
		});
		if (selectedPinId === id) setSelectedPinId(null);
	};

	const handleLocateMe = () => {
		if (isLocating) return;
		setIsLocating(true);

		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					handleAddPin(latitude, longitude);
					setIsLocating(false);
					mapRef.current?.flyTo([latitude, longitude], 13);
				},
				() => setIsLocating(false),
				{ enableHighAccuracy: true },
			);
		} else {
			setIsLocating(false);
		}
	};

	const handleSearch = useDebouncedCallback(async (query: string) => {
		if (!query || query.length < 3) {
			setSearchResults([]);
			setShowResults(false);
			return;
		}
		setSearchLoading(true);
		setShowResults(true);
		try {
			const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
			const resp = await fetch(url);
			const data = await resp.json();
			const results = data.features.map((f: any) => ({
				place_id: f.properties.osm_id + Math.random(),
				display_name: [
					f.properties.name,
					f.properties.city,
					f.properties.country,
				]
					.filter(Boolean)
					.join(", "),
				lat: f.geometry.coordinates[1],
				lon: f.geometry.coordinates[0],
			}));
			setSearchResults(results);
		} catch (err) {
			console.error("Search error", err);
		} finally {
			setSearchLoading(false);
		}
	}, 300);

	const selectSearchResult = (res: any) => {
		handleAddPin(
			parseFloat(res.lat),
			parseFloat(res.lon),
			res.display_name,
		);
		setShowResults(false);
		mapRef.current?.flyTo([res.lat, res.lon], 13);
	};

	if (!isClient) {
		return (
			<div
				className={cn(
					"w-full h-[500px] rounded-[2rem] bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center",
					className,
				)}>
				<Loader2 className="h-8 w-8 animate-spin text-primary/30" />
			</div>
		);
	}

	const selectedPin = pins.find((p) => p.id === selectedPinId);

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			{/* Immersive Clean Map Container */}
			<div className="relative w-full h-[500px] rounded-[2rem] overflow-hidden border border-border bg-muted/20 group/map shadow-inner">
				<MapContainer
					center={[27.7172, 85.324]}
					zoom={13}
					className="w-full h-full z-0"
					zoomControl={false}
					ref={mapRef}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					{pins.map((pin) => (
						<div key={pin.id}>
							<Marker
								position={[pin.lat, pin.lng]}
								eventHandlers={{
									click: (e) => {
										e.originalEvent.preventDefault();
										e.originalEvent.stopPropagation();
										setSelectedPinId(pin.id);
										mapRef.current?.flyTo(
											[pin.lat, pin.lng],
											mapRef.current.getZoom(),
										);
									},
								}}
							/>
							<Circle
								center={[pin.lat, pin.lng]}
								radius={pin.radius}
								pathOptions={{
									color:
										selectedPinId === pin.id
											? "#009B4D"
											: "#64748b",
									fillColor:
										selectedPinId === pin.id
											? "#009B4D"
											: "#64748b",
									fillOpacity:
										selectedPinId === pin.id ? 0.15 : 0.05,
									weight: selectedPinId === pin.id ? 2 : 1,
									dashArray:
										selectedPinId === pin.id ? "" : "5, 5",
								}}
							/>
						</div>
					))}

					<MapEventsHandler onAddPin={handleAddPin} />
				</MapContainer>

				{/* Minimal Toolbars */}
				<div className="absolute top-6 left-6 z-10 flex items-center gap-3 w-full max-w-[calc(100%-48px)]">
					<div className="relative flex-1 max-w-sm pointer-events-auto">
						<SearchBar
							placeholder="Identify target zone..."
							onSearch={handleSearch}
							className="shadow-xl bg-background/80 backdrop-blur-md rounded-2xl h-11 border-border"
							isLoading={searchLoading}
						/>
						{showResults && searchResults.length > 0 && (
							<Card className="absolute top-full mt-2 w-full glass-card overflow-hidden z-20 border-border rounded-2xl shadow-2xl">
								<div className="max-h-60 overflow-y-auto">
									{searchResults.map((res) => (
										<button
											key={res.place_id}
											onClick={() =>
												selectSearchResult(res)
											}
											className="w-full text-left px-4 py-2.5 hover:bg-muted flex items-center gap-2 border-b last:border-0 transition-all font-medium text-xs">
											<MapPin className="h-3 w-3 text-primary shrink-0" />
											<span className="truncate">
												{res.display_name}
											</span>
										</button>
									))}
								</div>
							</Card>
						)}
					</div>

					<div className="flex items-center gap-2 pointer-events-auto">
						<Button
							variant="outline"
							size="icon"
							onClick={handleLocateMe}
							disabled={isLocating}
							className="h-11 w-11 rounded-2xl bg-background/80 backdrop-blur-md border-border text-foreground hover:bg-primary hover:text-white transition-all shadow-xl">
							{isLocating ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<Navigation className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Fixed Visual Zoom */}
				<div className="absolute bottom-6 left-6 z-10 pointer-events-auto">
					<ZoomControls
						onZoomIn={() => mapRef.current?.zoomIn()}
						onZoomOut={() => mapRef.current?.zoomOut()}
					/>
				</div>

				{/* Dynamic Multi-Area Pulse - Only show if pins > 0 */}
				{pins.length > 0 && (
					<div className="absolute bottom-6 right-6 z-10 pointer-events-none">
						<Badge className="bg-background/80 backdrop-blur-md text-foreground border-border px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl ring-1 ring-primary/20 pointer-events-auto">
							<Map className="h-3.5 w-3.5 text-primary" />
							<span className="text-[10px] font-black tracking-widest uppercase">
								{pins.length} TARGETS DEFINED
							</span>
						</Badge>
					</div>
				)}

				{/* Interactive Overlay Tooltip */}
				<div className="absolute inset-0 pointer-events-none flex items-center justify-center">
					<AnimatePresence>
						{!selectedPinId && pins.length === 0 && (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="glass px-6 py-3 rounded-[2rem] border-primary/20 flex items-center gap-3 shadow-lg">
								<MapPin className="h-4 w-4 text-primary animate-bounce-subtle" />
								<span className="text-xs font-bold text-muted-foreground tracking-tight uppercase">
									Click anywhere to set first target
								</span>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* External Multi-Target Management Dashboard */}
			<AnimatePresence mode="wait">
				{selectedPin && (
					<motion.div
						key={selectedPin.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.3 }}>
						<Card className="border border-border bg-card/30 rounded-3xl overflow-hidden shadow-sm">
							<div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
								{/* Selected Area Info */}
								<div className="md:col-span-4 space-y-1">
									<div className="flex items-center gap-2">
										<div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
											<Settings2 className="h-4 w-4 text-primary" />
										</div>
										<div>
											<h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
												Selected Target Area
											</h3>
											<p className="text-sm font-bold truncate max-w-[150px] md:max-w-xs">
												{selectedPin.address?.split(
													",",
												)[0] || "Custom Point"}
											</p>
										</div>
									</div>
								</div>

								{/* Radius Slider Section */}
								<div className="md:col-span-6 space-y-2">
									<div className="flex items-center justify-between font-bold">
										<span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
											Radius Limits
										</span>
										<Badge
											variant="secondary"
											className="bg-primary/10 text-primary font-black px-2 py-0.5 rounded-full text-[10px]">
											{(
												selectedPin.radius / 1000
											).toFixed(1)}{" "}
											KM
										</Badge>
									</div>
									<div className="relative">
										<input
											type="range"
											min="250"
											max="20000"
											step="250"
											value={selectedPin.radius}
											onChange={(e) =>
												updatePinRadius(
													selectedPin.id,
													parseInt(e.target.value),
												)
											}
											className="w-full accent-primary h-1 bg-muted rounded-full appearance-none cursor-pointer hover:accent-primary-light transition-all"
										/>
										<div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase opacity-40 mt-1 tracking-widest">
											<span>0.25 KM</span>
											<span>10 KM</span>
											<span>20 KM</span>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="md:col-span-2 flex justify-end gap-2">
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-10 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 transition-all"
										onClick={() =>
											deletePin(selectedPin.id)
										}>
										<Trash2 className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-10 rounded-xl bg-muted border-border hover:bg-muted/80 transition-all"
										onClick={() => setSelectedPinId(null)}>
										<X className="h-4 w-4 font-black" />
									</Button>
								</div>
							</div>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Target Queue Summary - Show when multiple tags exist and none or one is selected */}
			{pins.length > 1 && (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
					{pins.map((pin, i) => (
						<button
							key={pin.id}
							onClick={() => {
								setSelectedPinId(pin.id);
								mapRef.current?.flyTo(
									[pin.lat, pin.lng],
									mapRef.current.getZoom(),
								);
							}}
							className={cn(
								"p-3 rounded-2xl border transition-all text-left space-y-1.5 group",
								selectedPinId === pin.id
									? "bg-primary/5 border-primary shadow-lg shadow-primary/5 ring-1 ring-primary"
									: "bg-muted/20 border-border hover:border-primary/30",
							)}>
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-black text-primary opacity-60">
									ZONE {i + 1}
								</span>
								<MapPin
									className={cn(
										"h-3 w-3",
										selectedPinId === pin.id
											? "text-primary"
											: "text-muted-foreground",
									)}
								/>
							</div>
							<p className="text-[11px] font-bold truncate tracking-tight">
								{pin.address?.split(",")[0]}
							</p>
							<p className="text-[9px] font-bold text-muted-foreground uppercase">
								{(pin.radius / 1000).toFixed(1)} KM
							</p>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
