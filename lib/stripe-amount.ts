const ZERO_DECIMAL = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

/**
 * PayPal, Affirm, and Afterpay are separate checkout integrations.
 * They must not be offered inside the Stripe Payment Element or wallets.
 */
export const STRIPE_SEPARATE_CHECKOUT_METHODS = [
  "paypal",
  "affirm",
  "afterpay_clearpay",
] as const;

export function toStripeMinor(total: string | number, currency: string) {
  const amount = Number(total);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Order total is invalid.");
  }
  const code = currency.trim().toUpperCase();
  if (ZERO_DECIMAL.has(code)) return Math.round(amount);
  return Math.round(amount * 100);
}

export function toStripeAmount(total: string | number, currency: string) {
  const amount = Number(total);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Order total is invalid.");
  }
  return toStripeMinor(amount, currency);
}

export function stripeAmountMatches(
  total: string | number,
  currency: string,
  stripeAmount: number,
  stripeCurrency: string,
) {
  const expected = toStripeAmount(total, currency);
  return (
    expected === stripeAmount &&
    currency.trim().toLowerCase() === stripeCurrency.trim().toLowerCase()
  );
}
