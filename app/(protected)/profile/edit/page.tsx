import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit profile",
};

export default function EditProfilePage() {
  return (
    <section className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Edit profile</h1>
      <p className="mt-2 text-muted-foreground">
        Profile editor lands in a follow-up PR.
      </p>
    </section>
  );
}
