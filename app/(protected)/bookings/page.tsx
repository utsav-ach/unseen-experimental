import type { Metadata } from "next";
import Link from "next/link";
import { bookingService } from "@/backend/v2/services/booking-services";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "My bookings",
  description: "Your confirmed guide and package bookings.",
};

export default async function BookingsPage() {
  const [guideBookings, packageBookings] = env.BACKEND_URL
    ? await Promise.all([
        bookingService.listMyGuideBookings().catch(() => []),
        bookingService.listMyPackageBookings().catch(() => []),
      ])
    : [[], []];
  return (
    <section className="container mx-auto max-w-3xl py-10">
      <h1 className="text-3xl font-bold">My bookings</h1>

      <h2 className="mt-8 text-xl font-semibold">Guide bookings</h2>
      {guideBookings.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No guide bookings yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {guideBookings.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-md border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">Booking {b.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {b.status} · paid NPR {b.paid_amount} / {b.final_amount}
                </p>
              </div>
              <Link
                href={`/bookings/details/${b.id}`}
                className="text-sm underline underline-offset-2"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-xl font-semibold">Package bookings</h2>
      {packageBookings.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No package bookings yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {packageBookings.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-md border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">Package {b.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {b.status} · paid NPR {b.paid_amount} / {b.total_amount}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
