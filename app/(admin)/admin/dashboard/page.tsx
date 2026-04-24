import type { Metadata } from "next";
import { adminService } from "@/backend/v2/services/admin-services";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  description: "Platform overview.",
};

export default async function AdminDashboardPage() {
  const overview = env.BACKEND_URL
    ? await adminService.getSystemOverview().catch(() => null)
    : null;

  const stats = [
    { label: "Total users", value: overview?.total_users ?? 0 },
    { label: "Total guides", value: overview?.total_guides ?? 0 },
    {
      label: "Pending applications",
      value: overview?.pending_guide_applications ?? 0,
    },
    { label: "Active bookings", value: overview?.active_bookings ?? 0 },
    {
      label: "Payment reviews",
      value: overview?.pending_payment_reviews ?? 0,
    },
    { label: "Suspended guides", value: overview?.suspended_guides ?? 0 },
  ];

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Platform at a glance.</p>
      <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
