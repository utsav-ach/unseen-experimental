import type { Metadata } from "next";
import Link from "next/link";
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
  return (
    <section className="container mx-auto max-w-2xl py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Link
          href="/profile/edit"
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Edit
        </Link>
      </header>
      {!profile ? (
        <p className="text-sm text-muted-foreground">
          {env.BACKEND_URL
            ? "Complete onboarding to see your profile."
            : "Supabase not configured."}
        </p>
      ) : (
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Username</dt>
            <dd className="font-medium">{profile.username}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">
              {[profile.first_name, profile.middle_name, profile.last_name]
                .filter(Boolean)
                .join(" ")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="font-medium">{profile.phone_number ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Guide</dt>
            <dd className="font-medium">{profile.is_guide ? "Yes" : "No"}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
