import { z } from "zod";

export const GeoPoint = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof GeoPoint>;

export const GeoCircle = z.object({
  center: GeoPoint,
  radius_meters: z.number().positive(),
});
export type GeoCircle = z.infer<typeof GeoCircle>;

export const GeoPointWKT = z.string().regex(/^POINT\s*\(-?\d+(\.\d+)?\s-?\d+(\.\d+)?\)$/i);
export type GeoPointWKT = z.infer<typeof GeoPointWKT>;

export function toWkt(point: GeoPoint): string {
  return `POINT(${point.longitude} ${point.latitude})`;
}
