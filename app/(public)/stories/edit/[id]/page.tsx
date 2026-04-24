import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit story",
};

export default function EditStoryPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <section className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Edit story #{params.id}</h1>
      <p className="mt-2 text-muted-foreground">Editor UI is pending.</p>
    </section>
  );
}
