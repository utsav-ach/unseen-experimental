import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking details",
};

export default function BookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <section className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Booking #{params.id}</h1>
      <p className="mt-2 text-muted-foreground">
        Full booking detail view is pending. The data contract lives in{" "}
        <code>guide_bookings_info</code> and <code>package_bookings_info</code>{" "}
        views.
      </p>
    </section>
  );
}
