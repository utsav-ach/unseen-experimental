import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Destinations",
  description: "Admin destinations management.",
};

export default function AdminPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold">Destinations</h1>
      <p className="mt-2 text-muted-foreground">
        Destinations management lands in a follow-up PR. CRUD RPCs already exist in{" "}
        <code>AdminService</code>.
      </p>
    </section>
  );
}
