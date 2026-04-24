import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Pay the prepay amount to finalize your booking.",
};

export default function CheckoutPage() {
  return (
    <section className="container mx-auto max-w-xl py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Payment integration lands in a follow-up PR. The booking is recorded
        only after the payment provider confirms the charge.
      </p>
    </section>
  );
}
