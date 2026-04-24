import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Users",
  description: "Admin users management.",
};

export default function AdminPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-2 text-muted-foreground">
        Users management lands in a follow-up PR. CRUD RPCs already exist in{" "}
        <code>AdminService</code>.
      </p>
    </section>
  );
}
