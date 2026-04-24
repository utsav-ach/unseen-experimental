"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function MarkdownPreviewDevPage() {
  const [value, setValue] = useState(
    "# Hello\n\nType markdown on the left.",
  );
  return (
    <section className="container mx-auto grid max-w-5xl grid-cols-1 gap-6 py-10 md:grid-cols-2">
      <div>
        <h2 className="mb-2 text-sm font-medium">Source</h2>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-96"
        />
      </div>
      <div>
        <h2 className="mb-2 text-sm font-medium">Preview</h2>
        <pre className="h-96 overflow-auto rounded-md border border-border bg-muted/50 p-3 text-sm">
          {value}
        </pre>
      </div>
    </section>
  );
}
