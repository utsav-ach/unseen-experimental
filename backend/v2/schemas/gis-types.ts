import z, { regex } from "zod";

/**
 * Schema to transform postgis point coming from db into the understandable format that the
 * openstreetmap and leaflet can understand
 *
 * The postgis point is in the format of "POINT(lon lat)" or "SRID=4326;POINT(lon lat)"
 * Use this for incoming data from db only
 *
 * For converting to the postgis refer below for the object to gis schema
 *
 */
export const gisToObjectSchema = z
	.string()
	.refine(
		(val) =>
			/^(?:SRID=\d+;)?POINT\((-?\d+(\.\d+)?) (-?\d+(\.\d+)?)\)$/.test(
				val,
			),
		"Invalid PostGIS POINT format Must be in 'POINT(lon lat)' or 'SRID=4326;POINT(lon lat)' format",
	)
	.transform((val) => {
		// Match both formats:
		// SRID=4326;POINT(lon lat)
		// POINT(lon lat)
		const match = val.match(
			/^(?:SRID=\d+;)?POINT\((-?\d+(\.\d+)?) (-?\d+(\.\d+)?)\)$/,
		);

		/// Not possible to reach here because of the refine above
		// but typescript needs this to be sure that match is not null
		if (!match) {
			throw new Error("Invalid PostGIS POINT format");
		}

		const lng = parseFloat(match[1]);
		const lat = parseFloat(match[3]);

		return { lat, lng };
	});

export const objectToGisSchema = z
	.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
	})
	.transform(({ lat, lng }) => {
		return `SRID=4326;POINT(${lng} ${lat})`;
	});

    