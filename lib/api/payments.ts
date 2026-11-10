import { isAffirmConfigured } from "@/lib/affirm";
import { isAfterpayConfigured } from "@/lib/afterpay";
import { isPayPalConfigured } from "@/lib/paypal";
import { getPaymentAccounts } from "@/lib/payment-config";
import { isStripeConfigured } from "@/lib/stripe";
import type { CheckoutPaymentKind, CheckoutPaymentMethod } from "@/lib/types";

const KIND_ORDER: CheckoutPaymentKind[] = ["stripe", "paypal", "affirm", "afterpay"];

const DEFAULT_TITLE: Record<CheckoutPaymentKind, string> = {
  paypal: "PayPal",
  stripe: "Card",
  affirm: "Affirm",
  afterpay: "Afterpay",
};

export async function getEnabledCheckoutMethods(): Promise<
  CheckoutPaymentMethod[]
> {
  const accounts = await getPaymentAccounts();
  const enabled: CheckoutPaymentKind[] = [];
  if (accounts.paypal.enabled && (await isPayPalConfigured())) enabled.push("paypal");
  if (
    accounts.stripe.enabled &&
    (await isStripeConfigured()) &&
    accounts.stripe.publishableKey
  ) {
    enabled.push("stripe");
  }
  if (accounts.affirm.enabled && (await isAffirmConfigured())) enabled.push("affirm");
  if (accounts.afterpay.enabled && (await isAfterpayConfigured())) enabled.push("afterpay");
  return KIND_ORDER.filter((kind) => enabled.includes(kind)).map((kind) => ({
    kind,
    wooId: kind,
    title: DEFAULT_TITLE[kind],
  }));
}

