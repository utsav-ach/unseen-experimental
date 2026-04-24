import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinationService } from "@/backend/v2/services/destination-services";
import { env } from "@/lib/env";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!env.BACKEND_URL) return { title: "Package" };
  const p = await destinationService.getPackage(params.id).catch(() => null);
  if (!p) return { title: "Package" };
  return { title: p.name, description: p.description };
}

export default async function PackageDetailsPage({ params }: Props) {
  if (!env.BACKEND_URL) {
    return (
      <section className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Package #{params.id}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Supabase not configured. Data will render once credentials are set.
        </p>
      </section>
    );
  }
  const pkg = await destinationService.getPackage(params.id).catch(() => null);
  if (!pkg) notFound();
  return (
    <article className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">{pkg.name}</h1>
      <p className="mt-2 text-muted-foreground">{pkg.description}</p>
      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Type</dt>
          <dd className="font-medium">{pkg.type}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Days</dt>
          <dd className="font-medium">{pkg.total_days}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Price</dt>
          <dd className="font-medium">
            NPR {pkg.discounted_price ?? pkg.actual_price}
          </dd>
        </div>
      </dl>
    </article>
  );
}
