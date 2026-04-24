import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trek details",
};

export default function TrekDaiDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <section className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Trek #{params.id}</h1>
      <p className="mt-2 text-muted-foreground">
        Trek detail view is pending.
      </p>
    </section>
  );
}
