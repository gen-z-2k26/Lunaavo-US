import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderFromQuery } from "@/components/OrderFromQuery";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <p className="py-24 text-center text-sm text-muted-foreground">
          Loading order...
        </p>
      }
    >
      <OrderFromQuery />
    </Suspense>
  );
}
