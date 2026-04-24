import type { Metadata } from "next";
import Link from "next/link";
import { bookingService } from "@/backend/v2/services/booking-services";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "My requests",
  description: "Your hiring proposals with guides.",
};

export default async function RequestsPage() {
  const proposals = env.BACKEND_URL
    ? await bookingService.listMyProposals().catch(() => [])
    : [];
  return (
    <section className="container mx-auto max-w-3xl py-10">
      <h1 className="text-3xl font-bold">My requests</h1>
      {proposals.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          You have no active hiring requests.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {proposals.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-md border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">Proposal {p.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {p.duration_days} days · {p.people_count} people · {p.status}
                </p>
              </div>
              <Link
                href={`/bookings/details/${p.id}`}
                className="text-sm underline underline-offset-2"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
