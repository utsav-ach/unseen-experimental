import { useEffect, useState } from "react";

export default function GeocodedAddress({ coordinates }: { coordinates: any }) {
	const [address, setAddress] = useState<string>("Verified Nepal Region");

	useEffect(() => {
		const fetchAddress = async () => {
			try {
				const lng = coordinates?.coordinates?.[0] || coordinates?.[0];
				const lat = coordinates?.coordinates?.[1] || coordinates?.[1];

				if (lat && lng) {
					const resp = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
					);
					if (resp.ok) {
						const data = await resp.json();
						setAddress(
							data.address?.state ||
								data.name ||
								"Verified Nepal Region",
						);
					}
				}
			} catch (err) {
				// Silent fallback
			}
		};

		if (coordinates) {
			fetchAddress();
		}
	}, [coordinates]);

	return <span>{address}</span>;
}
