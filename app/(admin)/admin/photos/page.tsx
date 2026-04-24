import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Photos",
  description: "Admin photos management.",
};

export default function AdminPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold">Photos</h1>
      <p className="mt-2 text-muted-foreground">
        Photos management lands in a follow-up PR. CRUD RPCs already exist in{" "}
        <code>AdminService</code>.
      </p>
    </section>
  );
}
