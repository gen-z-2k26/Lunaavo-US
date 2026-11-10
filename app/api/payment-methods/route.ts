import { NextResponse } from "next/server";
import { getEnabledCheckoutMethods } from "@/lib/api/payments";
import { PAYMENT_METHODS_REVALIDATE_SECONDS } from "@/lib/cache-policy";
import { publicPaymentMethods } from "@/lib/payment-methods-public";

export const revalidate = 300;

// A public, read-only list of the checkout's payment options and whether each is on, from the
// same function the checkout page uses. It holds no keys or account details. The shopping
// assistant reads it to answer "which payment methods do you accept?".
export async function GET() {
  try {
    const enabled = await getEnabledCheckoutMethods();
    return NextResponse.json(
      { methods: publicPaymentMethods(enabled) },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${PAYMENT_METHODS_REVALIDATE_SECONDS}, stale-while-revalidate=${PAYMENT_METHODS_REVALIDATE_SECONDS}`,
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Payment methods are unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
