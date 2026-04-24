"use client";

import { useEffect, useState, useCallback } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	useMapEvents,
	useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

interface HomeLocationMapProps {
	onLocationSelect: (lat: number, lng: number) => void;
	onLocationNameUpdate?: (name: string) => void;
	initialLocation?: [number, number];
}

function LocationMarker({
	onLocationSelect,
	position,
}: {
	onLocationSelect: (lat: number, lng: number) => void;
	position: [number, number] | null;
}) {
	useMapEvents({
		click(e) {
			onLocationSelect(e.latlng.lat, e.latlng.lng);
		},
	});

	return position === null ? null : (
		<Marker position={position} icon={icon} />
	);
}

// Component to handle map view updates manually
function MapUpdater({
	center,
	zoom,
}: {
	center: [number, number];
	zoom: number;
}) {
	const map = useMap();
	useEffect(() => {
		map.setView(center, zoom, { animate: true });
	}, [center, zoom, map]);
	return null;
}

export default function HomeLocationMap({
	onLocationSelect,
	onLocationNameUpdate,
	initialLocation,
}: HomeLocationMapProps) {
	const [position, setPosition] = useState<[number, number]>(
		initialLocation || [27.7172, 85.324],
	);
	const [zoom, setZoom] = useState(13);
	const [isNaming, setIsNaming] = useState(false);
	const [readableName, setReadableName] = useState<string | null>(null);

	const reverseGeocode = async (lat: number, lng: number) => {
		setIsNaming(true);
		try {
			// Using OpenStreetMap's Nominatim API (Free, but slow/rate-limited - OK for onboarding)
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
			);
			const data = await res.json();
			const name = data.display_name || "Nepal Highland Area";
			setReadableName(name);
			onLocationNameUpdate?.(name);
		} catch (err) {
			console.error("Geocoding failed:", err);
			const fallback = "Custom Base Camp";
			setReadableName(fallback);
			onLocationNameUpdate?.(fallback);
		} finally {
			setIsNaming(false);
		}
	};

	const handleLocateMe = useCallback(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const { latitude, longitude } = pos.coords;
					const newPos: [number, number] = [latitude, longitude];
					setPosition(newPos);
					setZoom(16);
					onLocationSelect(latitude, longitude);
					reverseGeocode(latitude, longitude);
				},
				(err) => {
					// User denied or error - just log it
					console.warn(
						"Geolocation denied by user. Falling back to default center.",
					);
				},
			);
		}
	}, [onLocationSelect]);

	const handleMapClick = (lat: number, lng: number) => {
		setPosition([lat, lng]);
		onLocationSelect(lat, lng);
		reverseGeocode(lat, lng);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="relative w-full h-[350px] rounded-3xl overflow-hidden border border-border shadow-2xl transition-all duration-500 hover:shadow-primary/5">
				<MapContainer
					center={position}
					zoom={zoom}
					style={{ height: "100%", width: "100%" }}
					scrollWheelZoom={true}
					zoomControl={true}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<LocationMarker
						onLocationSelect={handleMapClick}
						position={position}
					/>
					<MapUpdater center={position} zoom={zoom} />
				</MapContainer>

				{/* Readable Name Overlay */}
				{readableName && (
					<div className="absolute top-4 left-4 z-[1000] max-w-[70%]">
						<div className="bg-background/90 backdrop-blur-md text-foreground border border-border px-4 py-2 rounded-2xl shadow-xl text-xs font-bold truncate flex items-center gap-2">
							{isNaming ? (
								<Loader2 className="h-3 w-3 animate-spin text-primary" />
							) : (
								<MapPin className="h-3 w-3 text-primary" />
							)}
							{readableName}
						</div>
					</div>
				)}
			</div>

			<Button
				onClick={handleLocateMe}
				type="button"
				variant="outline"
				className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary transition-all duration-300 font-bold">
				<Navigation className="h-5 w-5 text-primary" />
				<span>Use My Current Location</span>
			</Button>
		</div>
	);
}
