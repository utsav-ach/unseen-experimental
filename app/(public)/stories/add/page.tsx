import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share a story",
  description: "Write and publish a new travel story.",
};

export default function AddStoryPage() {
  return (
    <section className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Share a story</h1>
      <p className="mt-2 text-muted-foreground">
        Story editor lands in a follow-up PR. The data contract lives in{" "}
        <code>backend/v2/models/story-models.ts</code>.
      </p>
    </section>
  );
}
