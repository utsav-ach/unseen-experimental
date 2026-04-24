"use client";

import { useState } from "react";
import { SelectionMap } from "@/components/map/selection-map";
import type { GeoPoint } from "@/backend/v2/schemas/gis-types";

export default function AreaSelectorDevPage() {
  const [point, setPoint] = useState<GeoPoint | null>(null);
  return (
    <section className="container mx-auto max-w-xl py-10">
      <h1 className="text-2xl font-bold">Area selector (dev)</h1>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        Scratch page to iterate on the <code>SelectionMap</code> component.
      </p>
      <SelectionMap onChange={setPoint} />
      <pre className="mt-6 rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(point, null, 2)}
      </pre>
    </section>
  );
}
