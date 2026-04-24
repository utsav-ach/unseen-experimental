import type { Metadata } from "next";
import Link from "next/link";
import { destinationService } from "@/backend/v2/services/destination-services";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Activities",
  description:
    "Activity-based discovery: fishing, trekking, rafting and more across Nepal.",
};

export default async function ActivitiesPage() {
  const activities = env.BACKEND_URL
    ? await destinationService.listActivities().catch(() => [])
    : [];
  return (
    <section className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Activities</h1>
        <p className="text-muted-foreground">
          Pick an activity to find destinations where you can do it.
        </p>
      </header>
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No activities yet.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <li key={a.id}>
              <Link href={`/activities/details/${a.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{a.name}</CardTitle>
                  </CardHeader>
                  {a.description && (
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {a.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
