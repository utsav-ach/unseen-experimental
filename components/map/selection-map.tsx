"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeoPoint } from "@/backend/v2/schemas/gis-types";

interface Props {
  initial?: GeoPoint | null;
  onChange?: (point: GeoPoint) => void;
  label?: string;
}

/**
 * Minimal coordinate input. A full map implementation (leaflet/maplibre)
 * can drop in here later. Exposes the same onChange(GeoPoint) contract.
 */
export function SelectionMap({ initial, onChange, label = "Location" }: Props) {
  const [lat, setLat] = useState<string>(initial ? String(initial.latitude) : "");
  const [lon, setLon] = useState<string>(
    initial ? String(initial.longitude) : "",
  );

  function emit(nextLat: string, nextLon: string) {
    const latitude = parseFloat(nextLat);
    const longitude = parseFloat(nextLon);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      onChange?.({ latitude, longitude });
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="any"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => {
            setLat(e.target.value);
            emit(e.target.value, lon);
          }}
        />
        <Input
          type="number"
          step="any"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => {
            setLon(e.target.value);
            emit(lat, e.target.value);
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Interactive map picker lands in a follow-up PR. Enter coordinates for
        now.
      </p>
    </div>
  );
}
