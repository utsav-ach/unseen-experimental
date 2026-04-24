import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Mountain } from "lucide-react";
import { userService } from "@/backend/v2/services/user-services";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "My profile",
  description: "View your Unseen Nepal profile.",
};

export default async function ProfilePage() {
  const profile = env.BACKEND_URL
    ? await userService.fetchProfile().catch(() => null)
    : null;

  const fullName = profile
    ? [profile.first_name, profile.middle_name, profile.last_name]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <section className="container-narrow py-12">
      <div className="card-elevated overflow-hidden">
        <div className="relative h-40 w-full bg-gradient-to-br from-primary/80 via-primary to-accent/60">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="relative px-8 pb-8">
          <div className="-mt-12 flex items-end justify-between">
            <div className="flex size-24 items-center justify-center rounded-full border-4 border-background bg-secondary text-2xl font-semibold text-foreground shadow-md">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  width={96}
                  height={96}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                (profile?.username?.[0] ?? "U").toUpperCase()
              )}
            </div>
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              <Pencil className="size-4" />
              Edit
            </Link>
          </div>
          <div className="mt-5">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {fullName ?? "Your profile"}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{profile?.username ?? "username"}
              {profile?.is_guide && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  <Mountain className="size-3" />
                  Verified guide
                </span>
              )}
            </p>
          </div>

          {!profile ? (
            <div className="mt-8 rounded-[calc(var(--radius)-2px)] border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {env.BACKEND_URL
                  ? "Complete onboarding to see your profile."
                  : "Supabase not configured — profile preview only."}
              </p>
              <Link
                href="/onboarding"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Start onboarding
              </Link>
            </div>
          ) : (
            <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-border/60 pt-8 sm:grid-cols-2">
              <Field label="Phone">{profile.phone_number ?? "—"}</Field>
              <Field label="Emergency contact">
                {profile.emergency_contact ?? "—"}
              </Field>
              <Field label="Home">{profile.home_location_name ?? "—"}</Field>
              <Field label="Onboarding">
                {profile.is_onboarding_complete ? "Complete" : "In progress"}
              </Field>
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{children}</dd>
    </div>
  );
}
