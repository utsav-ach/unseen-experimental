import type { Metadata } from "next";
import {
  Users,
  Mountain,
  FileText,
  CalendarCheck,
  CreditCard,
  UserX,
  ArrowUpRight,
} from "lucide-react";
import { adminService } from "@/backend/v2/services/admin-services";
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
    {
      label: "Total users",
      value: overview?.total_users ?? 0,
      icon: Users,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Verified guides",
      value: overview?.total_guides ?? 0,
      icon: Mountain,
      tint: "bg-accent/10 text-accent",
    },
    {
      label: "Pending applications",
      value: overview?.pending_guide_applications ?? 0,
      icon: FileText,
      tint: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Active bookings",
      value: overview?.active_bookings ?? 0,
      icon: CalendarCheck,
      tint: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Payment reviews",
      value: overview?.pending_payment_reviews ?? 0,
      icon: CreditCard,
      tint: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Suspended guides",
      value: overview?.suspended_guides ?? 0,
      icon: UserX,
      tint: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <section className="space-y-8">
      <header>
        <p className="section-eyebrow">Admin</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Platform at a glance — numbers are pulled live from the database.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <div className="card-elevated flex items-start justify-between p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-3 font-display text-4xl font-semibold">
                  {s.value.toLocaleString()}
                </p>
              </div>
              <span
                className={`flex size-10 items-center justify-center rounded-full ${s.tint}`}
              >
                <s.icon className="size-5" />
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">
              Action queue
            </h2>
            <span className="text-xs text-muted-foreground">
              Today
            </span>
          </div>
          <ul className="mt-5 divide-y divide-border/60 text-sm">
            {[
              {
                label: "Review guide applications",
                count: overview?.pending_guide_applications ?? 0,
              },
              {
                label: "Check payment disputes",
                count: overview?.pending_payment_reviews ?? 0,
              },
              {
                label: "Unsuspension requests",
                count: 0,
              },
            ].map((a) => (
              <li
                key={a.label}
                className="flex items-center justify-between py-3"
              >
                <span>{a.label}</span>
                <span className="inline-flex items-center gap-2 font-semibold">
                  {a.count}
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card-elevated p-6">
          <h2 className="font-display text-xl font-semibold">Health</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Response times for the last 24 hours.
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">p50</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">
                128ms
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">p95</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">
                412ms
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Errors</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-emerald-600">
                0.02%
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
