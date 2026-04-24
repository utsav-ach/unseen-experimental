"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation, MapPin, Layers, Compass, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

// We import the types only for the hooks, but the actual components will be used inside the dynamic wrapper
import type { MapContainer as MapContainerType } from "react-leaflet";

// This component will be loaded only on the client
const MapInner = () => {
	return null; // Placeholder
};

// We dynamic-import the components from react-leaflet
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

// Helper for hooks - we need a way to use them that doesn't break SSR
// The best way is to have a component that is itself dynamic-imported
// and contains all the leaflet logic.

interface MapProps {
	initialLat?: number;
	initialLng?: number;
	initialZoom?: number;
	onLocationChange?: (lat: number, lng: number, address: string) => void;
	className?: string;
	showSearch?: boolean;
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

/**
 * IMPORTANT: Component that actually uses Leaflet hooks.
 * This MUST be rendered inside MapContainer.
 * Since react-leaflet hooks only work on client, we import them dynamically
 * but as FUNCTIONS, not components.
 */
let ReactLeaflet: any = null;

const loadReactLeaflet = async () => {
	if (ReactLeaflet) return ReactLeaflet;
	ReactLeaflet = await import("react-leaflet");
	return ReactLeaflet;
};

function MapEventsHandler({
	onLocationChange,
	setAddress,
	setPos,
}: {
	onLocationChange: any;
	setAddress: any;
	setPos: any;
}) {
	const { useMap, useMapEvents } = ReactLeaflet;
	const map = useMap();

	const reverseGeocode = async (lat: number, lng: number) => {
		try {
			const resp = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
			);
			const data = await resp.json();
			const display_name = data.display_name || "Unknown Location";
			setAddress(display_name);
			onLocationChange?.(lat, lng, display_name);
		} catch (err) {
			console.error("Geocoding error", err);
		}
	};

	useMapEvents({
		click(e: any) {
			const { lat, lng } = e.latlng;
			setPos([lat, lng]);
			reverseGeocode(lat, lng);
			map.flyTo(e.latlng, map.getZoom());
		},
	});

	return null;
}

function MapControllerHandler({
	center,
	zoom,
}: {
	center: [number, number];
	zoom?: number;
}) {
	const { useMap } = ReactLeaflet;
	const map = useMap();
	useEffect(() => {
		if (center && map) {
			map.flyTo(center, zoom || map.getZoom(), {
				duration: 1.5,
			});
		}
	}, [center, zoom, map]);
	return null;
}

export function LeafletMap(props: MapProps) {
	const [isClient, setIsClient] = useState(false);
	const [pos, setPos] = useState<[number, number]>([
		props.initialLat || 27.7172,
		props.initialLng || 85.324,
	]);
	const [address, setAddress] = useState<string>("Locating...");
	const [isLocating, setIsLocating] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [showResults, setShowResults] = useState(false);

	useEffect(() => {
		const init = async () => {
			await fixLeafletIcon();
			await loadReactLeaflet();
			setIsClient(true);
			handleLocateMe();
		};
		init();
	}, []);

	const handleLocateMe = () => {
		if (isLocating) return;
		setIsLocating(true);

		if ("geolocation" in navigator) {
			// Check for Secure Context (GPS requires HTTPS or localhost)
			if (
				!window.isSecureContext &&
				window.location.hostname !== "localhost"
			) {
				console.error("Location requires HTTPS");
				setIsLocating(false);
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;

					setPos([latitude, longitude]);
					reverseGeocode(latitude, longitude);
					setIsLocating(false);
				},
				(error) => {
					if (error.code == 1) {
						console.error(
							"You havent allowed the location access. Please allow location access in your browser settings.",
						);
					} else if (error.code == 2) {
						console.error("Location is unavailable.");
					} else if (error.code == 3) {
						console.error("Location request timed out.");
					} else {
						console.error(
							"An unknown error occurred." +
								JSON.stringify(error),
						);
					}
				},
				{
					enableHighAccuracy: true,
					timeout: 15000,
					maximumAge: 0,
				},
			);
		} else {
			setIsLocating(false);
		}
	};

	const reverseGeocode = async (lat: number, lng: number) => {
		try {
			const resp = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
			);
			const data = await resp.json();
			const display_name = data.display_name || "Unknown Location";
			setAddress(display_name);
			props.onLocationChange?.(lat, lng, display_name);
		} catch (err) {
			console.error("Geocoding error", err);
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
			const [currentLat, currentLng] = pos;
			const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=${currentLat}&lon=${currentLng}&location_bias_scale=0.5`;

			const resp = await fetch(url);
			const data = await resp.json();

			// Photon returns data in GeoJSON format
			const results = data.features.map((f: any) => ({
				place_id: f.properties.osm_id,
				display_name: [
					f.properties.name,
					f.properties.city,
					f.properties.state,
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

	const selectResult = (result: any) => {
		const lat = parseFloat(result.lat);
		const lon = parseFloat(result.lon);
		setPos([lat, lon]);
		setAddress(result.display_name);
		props.onLocationChange?.(lat, lon, result.display_name);
		setShowResults(false);
	};

	if (!isClient) {
		return (
			<div
				className={cn(
					"w-full h-[500px] rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center",
					props.className,
				)}>
				<Loader2 className="h-8 w-8 animate-spin text-primary/30" />
			</div>
		);
	}

	return (
		<div
			className={cn(
				"relative w-full h-[500px] rounded-3xl overflow-hidden border-2 border-primary/10 shadow-2xl group/map",
				props.className,
			)}>
			{/* Map Components */}
			<MapContainer
				center={pos}
				zoom={props.initialZoom || 13}
				scrollWheelZoom={true}
				className="w-full h-full z-0"
				zoomControl={false}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={pos} />
				<MapEventsHandler
					onLocationChange={props.onLocationChange}
					setAddress={setAddress}
					setPos={setPos}
				/>
				<MapControllerHandler center={pos} zoom={16} />
			</MapContainer>

			{/* Overlay: Search Bar */}
			{props.showSearch !== false && (
				<div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4 pointer-events-none">
					<div className="relative pointer-events-auto">
						<SearchBar
							placeholder="Search hidden gems in Nepal..."
							onSearch={handleSearch}
							className="shadow-2xl shadow-primary/10 border-primary/20 backdrop-blur-md bg-background/80"
							isLoading={searchLoading}
						/>

						{showResults && searchResults.length > 0 && (
							<Card className="absolute top-full mt-2 w-full glass-card overflow-hidden z-20 border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
								<div className="max-h-60 overflow-y-auto">
									{searchResults.map((res) => (
										<button
											key={res.place_id}
											onClick={() => selectResult(res)}
											className="w-full text-left px-4 py-3 hover:bg-primary/10 flex items-start gap-3 border-b border-primary/5 last:border-0 transition-all">
											<div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
												<MapPin className="h-4 w-4 text-primary" />
											</div>
											<div className="flex flex-col overflow-hidden">
												<span className="text-sm font-semibold truncate">
													{
														res.display_name.split(
															",",
														)[0]
													}
												</span>
												<span className="text-[11px] text-muted-foreground truncate">
													{res.display_name
														.split(",")
														.slice(1)
														.join(",")}
												</span>
											</div>
										</button>
									))}
								</div>
							</Card>
						)}
					</div>
				</div>
			)}

			{/* Overlay: Bottom Address Info */}
			<div className="absolute bottom-6 right-6 z-10 flex flex-col sm:flex-row gap-4 pointer-events-none">
				{/* <Card className="flex-1 glass-card p-4 flex items-center gap-4 border-primary/20 animate-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Navigation className="h-6 w-6 text-primary animate-bounce-subtle" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-black text-primary/60 mb-0.5">Selected Location</p>
            <p className="text-sm font-bold truncate text-foreground/90">{address}</p>
            <p className="text-[10px] font-medium text-muted-foreground">
              Lat: {pos[0].toFixed(5)} • Lng: {pos[1].toFixed(5)}
            </p>
          </div>
        </Card> */}

				{/* Action Buttons */}
				<div className="flex gap-2 pointer-events-auto">
					<Button
						variant="outline"
						size="icon"
						onClick={handleLocateMe}
						disabled={isLocating}
						className="h-14 w-14 rounded-2xl glass border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-xl group">
						{isLocating ? (
							<Loader2 className="h-6 w-6 animate-spin" />
						) : (
							<Compass className="h-6 w-6 group-hover:rotate-45 transition-transform duration-500" />
						)}
					</Button>

					{/* dont show useless buttons */}
					{/* <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-2xl glass border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-xl group"
          >
            <Layers className="h-6 w-6" />
          </Button> */}
				</div>
			</div>
		</div>
	);
}
