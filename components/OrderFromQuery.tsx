"use client";

import { useParams, useSearchParams } from "next/navigation";
import { OrderConfirmation } from "@/components/OrderConfirmation";

export function OrderFromQuery() {
  const params = useParams<{ id: string }>();
  const query = useSearchParams();
  const value = (key: string) => query.get(key) || "";
  const id = Array.isArray(params.id) ? params.id[0] || "" : params.id || "";

  return (
    <OrderConfirmation
      orderId={id}
      orderKey={value("key")}
      email={value("email")}
      paymentIntentId={value("payment_intent") || value("orderToken")}
      redirectStatus={value("redirect_status") || value("status")}
      provider={value("orderToken") ? "afterpay" : "stripe"}
    />
  );
}
