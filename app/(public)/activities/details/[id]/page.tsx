import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity details",
  description: "Details for a specific activity in Nepal.",
};

export default function ActivityDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <section className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Activity #{params.id}</h1>
      <p className="mt-2 text-muted-foreground">
        Activity detail rendering will populate here once an activity is
        selected. See <code>DestinationService.listActivities()</code>.
      </p>
    </section>
  );
}
