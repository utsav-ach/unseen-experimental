import { redirect } from "next/navigation";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { authService } from "@/backend/v2/services/auth-services";
import { env } from "@/lib/env";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (env.BACKEND_URL) {
    const user = await authService.getSessionUser().catch(() => null);
    if (!user) redirect("/login");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <AuthInitializer />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
