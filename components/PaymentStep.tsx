"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeCheckoutAction } from "@/app/actions/checkout";
import { unwrapResult } from "@/lib/cart-result";
import { userErrorMessage } from "@/lib/user-error";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store-context";
import type {
  Address,
  CheckoutPaymentKind,
  CreateOrderResult,
} from "@/lib/types";

export type PaymentStepProps = {
  amount: number;
  currency: string;
  clientSecret: string;
  orderId: string;
  orderKey: string;
  email: string;
  shipping: Address;
  billing: Address;
  mockPayment?: boolean;
  paymentKind?: CheckoutPaymentKind | "mock";
  redirectUrl?: string;
  stripePublishableKey?: string;
  paypalClientId?: string;
  affirmPublicKey?: string;
  affirmEnv?: "sandbox" | "live";
  onPaid: (order: CreateOrderResult) => void;
  onError: (message: string) => void;
};

function SecureNote({ children }: { children: string }) {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground/75">
      <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

function Unavailable({ children }: { children: string }) {
  return (
    <p className="rounded-2xl border border-foreground/15 bg-muted px-4 py-4 text-sm font-medium text-foreground">
      {children}
    </p>
  );
}

function MockPaymentForm({
  amount,
  currency,
  orderId,
  orderKey,
  clientSecret,
  onPaid,
  onError,
}: Pick<
  PaymentStepProps,
  | "amount"
  | "currency"
  | "orderId"
  | "orderKey"
  | "clientSecret"
  | "onPaid"
  | "onError"
>) {
  const { settings } = useStore();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = unwrapResult(
        await completeCheckoutAction({
          orderId,
          orderKey,
          paymentIntentId: clientSecret,
        }),
      );
      onPaid(result);
    } catch (submitError) {
      onError(userErrorMessage(submitError, "Could not complete the development checkout."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting
          ? "Confirming order..."
          : `Place order ${formatPrice(amount, settings, currency)} (dev)`}
      </Button>
    </form>
  );
}


const paypalScripts = new Map<string, Promise<void>>();
const PAYPAL_SESSION_KEY = "drovia-paypal-checkout";

function rememberPayPalSession(session: {
  orderId: string;
  orderKey: string;
  paypalOrderId: string;
}) {
  try {
    sessionStorage.setItem(PAYPAL_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private mode can block storage; the pending checkout cookie still has the ids.
  }
}

function rememberedPayPalSession(): {
  orderId: string;
  orderKey: string;
  paypalOrderId: string;
} | null {
  try {
    const raw = sessionStorage.getItem(PAYPAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      orderId?: string;
      orderKey?: string;
      paypalOrderId?: string;
    };
    if (!parsed.orderId || !parsed.paypalOrderId) return null;
    return {
      orderId: parsed.orderId,
      orderKey: parsed.orderKey || "",
      paypalOrderId: parsed.paypalOrderId,
    };
  } catch {
    return null;
  }
}

function loadPayPal(clientId: string, currency: string) {
  const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
  const loaded = paypalScripts.get(src);
  if (loaded) return loaded;
  const task = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      paypalScripts.delete(src);
      script.remove();
      reject(new Error("PayPal could not be loaded."));
    };
    document.body.appendChild(script);
  });
  paypalScripts.set(src, task);
  return task;
}

export function PayPalPayment({
  amount,
  currency,
  orderId,
  orderKey,
  clientSecret,
  paypalClientId,
  onPaid,
  onError,
  prepare,
  canStart,
}: Pick<
  PaymentStepProps,
  | "amount"
  | "currency"
  | "orderId"
  | "orderKey"
  | "clientSecret"
  | "paypalClientId"
  | "onPaid"
  | "onError"
> & {
  paypalClientId: string;
  prepare?: () => Promise<{
    orderId: string;
    orderKey: string;
    paypalOrderId: string;
  } | null>;
  canStart?: () => boolean;
}) {
  const slot = useRef<HTMLDivElement>(null);
  const onPaidRef = useRef(onPaid);
  const onErrorRef = useRef(onError);
  const prepareRef = useRef(prepare);
  const canStartRef = useRef(canStart);
  const orderRef = useRef({ orderId, orderKey, paypalOrderId: clientSecret });
  const preparedRef = useRef<{
    orderId: string;
    orderKey: string;
    paypalOrderId: string;
  } | null>(null);
  const payingRef = useRef(false);
  const { settings } = useStore();
  const clientId = paypalClientId.trim();
  useEffect(() => {
    onPaidRef.current = onPaid;
    onErrorRef.current = onError;
    prepareRef.current = prepare;
    canStartRef.current = canStart;
    if (orderId && clientSecret) {
      orderRef.current = { orderId, orderKey, paypalOrderId: clientSecret };
    }
  }, [onPaid, onError, prepare, canStart, orderId, orderKey, clientSecret]);

  useEffect(() => {
    const code = currency.trim();
    if (!clientId || !code || !slot.current || payingRef.current) return;
    let cancelled = false;
    let buttons: { close?: () => Promise<void> } | null = null;

    function render() {
      const paypal = (
        window as Window & {
          paypal?: {
            Buttons: (options: {
              createOrder: () => Promise<string>;
              onApprove: (data?: { orderID?: string }) => Promise<void>;
              onError: (error: { message?: string }) => void;
              onCancel: () => void;
            }) => {
              render: (target: HTMLElement) => Promise<void>;
              close?: () => Promise<void>;
            };
          };
        }
      ).paypal;
      if (!paypal || !slot.current || cancelled) return;
      const target = document.createElement("div");
      slot.current.replaceChildren(target);
      const instance = paypal
        .Buttons({
          createOrder: async () => {
            payingRef.current = true;
            try {
            if (canStartRef.current && !canStartRef.current()) {
              throw new Error("Fill in all the required fields.");
            }
            if (prepareRef.current) {
              const next = await prepareRef.current();
              if (!next?.paypalOrderId || !next.orderId) {
                throw new Error("PayPal could not be started.");
              }
              preparedRef.current = {
                orderId: next.orderId,
                orderKey: next.orderKey,
                paypalOrderId: next.paypalOrderId,
              };
              orderRef.current = preparedRef.current;
              rememberPayPalSession(preparedRef.current);
              return next.paypalOrderId;
            }
            return orderRef.current.paypalOrderId;
            } catch (error) {
              payingRef.current = false;
              throw error;
            }
          },
          onApprove: async (data) => {
            const saved = preparedRef.current ?? rememberedPayPalSession() ?? orderRef.current;
            const paypalOrderId = data?.orderID || saved.paypalOrderId || "";
            preparedRef.current = {
              orderId: saved.orderId,
              orderKey: saved.orderKey,
              paypalOrderId,
            };
            try {
              const result = unwrapResult(
                await completeCheckoutAction({
                  orderId: saved.orderId,
                  orderKey: saved.orderKey,
                  paymentIntentId: paypalOrderId,
                  provider: "paypal",
                }),
              );
              onPaidRef.current(result);
            } catch (error) {
              onErrorRef.current(userErrorMessage(error, "PayPal could not be completed."));
            } finally {
              payingRef.current = false;
            }
          },
          onCancel: () => {
            payingRef.current = false;
            onErrorRef.current("PayPal payment was cancelled.");
          },
          onError: (error) => {
            payingRef.current = false;
            const message = error.message || "";
            if (message === "Fill in all the required fields.") return;
            onErrorRef.current(message || "PayPal could not be completed.");
          },
        });
      buttons = instance;
      instance.render(target).catch(() => {
        // Unmounted before PayPal finished drawing; the next mount renders again.
      });
    }

    loadPayPal(clientId, code)
      .then(() => {
        if (!cancelled) render();
      })
      .catch((error: unknown) => {
        if (!cancelled) onErrorRef.current(userErrorMessage(error, "PayPal could not be loaded."));
      });
    return () => {
      if (payingRef.current) return;
      cancelled = true;
      void buttons?.close?.().catch(() => undefined);
    };
  }, [clientId, currency]);

  if (!clientId) {
    return <Unavailable>PayPal is not available right now.</Unavailable>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">
        Pay {formatPrice(amount, settings, currency)} with PayPal.
      </p>
      <div
        ref={slot}
        className="min-h-12 rounded-2xl border border-foreground/15 bg-card p-3"
      />
      <SecureNote>
        You will approve this payment in PayPal. We only receive the result.
      </SecureNote>
    </div>
  );
}

export function AfterpayPayment({
  amount,
  currency,
  redirectUrl,
  showAction = true,
}: Pick<PaymentStepProps, "amount" | "currency" | "redirectUrl"> & {
  showAction?: boolean;
}) {
  const { settings } = useStore();
  if (!redirectUrl) {
    return <Unavailable>Afterpay is not available right now.</Unavailable>;
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/80">
        You will complete {formatPrice(amount, settings, currency)} on Afterpay,
        then return here to confirm the order.
      </p>
      {showAction ? (
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => {
            window.location.assign(redirectUrl);
          }}
        >
          Continue to Afterpay
        </Button>
      ) : null}
      <SecureNote>
        Afterpay collects the installment details. This store never sees them.
      </SecureNote>
    </div>
  );
}

export function AffirmPayment({
  prepare,
  ...affirmProps
}: Pick<
  PaymentStepProps,
  | "amount"
  | "currency"
  | "orderId"
  | "orderKey"
  | "email"
  | "shipping"
  | "billing"
  | "affirmPublicKey"
  | "affirmEnv"
  | "onPaid"
  | "onError"
> & {
  prepare?: () => Promise<{
    orderId: string;
    orderKey: string;
    amount: number;
    currency: string;
    email: string;
  } | null>;
}) {
  return <AffirmPaymentForm {...affirmProps} prepare={prepare} />;
}

function AffirmPaymentForm({
  amount,
  currency,
  orderId,
  orderKey,
  email,
  shipping,
  billing,
  affirmPublicKey,
  affirmEnv,
  onPaid,
  onError,
  prepare,
}: Pick<
  PaymentStepProps,
  | "amount"
  | "currency"
  | "orderId"
  | "orderKey"
  | "email"
  | "shipping"
  | "billing"
  | "affirmPublicKey"
  | "affirmEnv"
  | "onPaid"
  | "onError"
> & {
  prepare?: () => Promise<{
    orderId: string;
    orderKey: string;
    amount: number;
    currency: string;
    email: string;
  } | null>;
}) {
  const { settings } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const publicKey = affirmPublicKey?.trim() || "";

  async function start() {
    if (!publicKey) {
      onError("Affirm is not available right now.");
      return;
    }
    setSubmitting(true);
    try {
      let nextOrderId = orderId;
      let nextOrderKey = orderKey;
      let nextAmount = amount;
      let nextCurrency = currency;
      let nextEmail = email;
      if (prepare) {
        const started = await prepare();
        if (!started) {
          setSubmitting(false);
          return;
        }
        nextOrderId = started.orderId;
        nextOrderKey = started.orderKey;
        nextAmount = started.amount;
        nextCurrency = started.currency;
        nextEmail = started.email;
      }
      await loadAffirm(publicKey, affirmEnv === "live" ? "live" : "sandbox");
      type AffirmApi = {
        checkout: ((payload: unknown) => void) & {
          open: (handlers: {
            onSuccess: (result: { checkout_token?: string }) => void;
            onFail: () => void;
          }) => void;
        };
      };
      const affirm = (window as unknown as { affirm?: AffirmApi }).affirm;
      if (!affirm) throw new Error("Affirm could not be loaded.");
      const shipTo = {
        name: { first: shipping.firstName, last: shipping.lastName },
        address: {
          line1: shipping.address1,
          line2: shipping.address2 || undefined,
          city: shipping.city,
          state: shipping.state,
          zipcode: shipping.postcode,
          country: shipping.country,
        },
        email: nextEmail,
      };
      affirm.checkout({
        merchant: {
          public_api_key: publicKey,
          user_confirmation_url: window.location.href,
          user_cancel_url: window.location.href,
          user_confirmation_url_action: "GET",
        },
        shipping: shipTo,
        billing: {
          name: { first: billing.firstName, last: billing.lastName },
          address: {
            line1: billing.address1,
            line2: billing.address2 || undefined,
            city: billing.city,
            state: billing.state,
            zipcode: billing.postcode,
            country: billing.country,
          },
          email: nextEmail,
        },
        items: [
          {
            display_name: `Order ${nextOrderId}`,
            sku: nextOrderId,
            unit_price: Math.round(nextAmount * 100),
            qty: 1,
          },
        ],
        order_id: nextOrderId,
        currency: nextCurrency.toUpperCase(),
        total: Math.round(nextAmount * 100),
        metadata: { mode: "modal" },
      });
      affirm.checkout.open({
        onSuccess: (checkout) => {
          const token = checkout.checkout_token || "";
          if (!token) {
            onError("Affirm did not return a payment.");
            setSubmitting(false);
            return;
          }
          void completeCheckoutAction({
            orderId: nextOrderId,
            orderKey: nextOrderKey,
            paymentIntentId: token,
            provider: "affirm",
          })
            .then(unwrapResult)
            .then(onPaid)
            .catch((error: unknown) => {
              onError(userErrorMessage(error, "Affirm payment failed."));
            })
            .finally(() => setSubmitting(false));
        },
        onFail: () => {
          onError("Affirm payment was cancelled.");
          setSubmitting(false);
        },
      });
    } catch (error) {
      onError(userErrorMessage(error, "Affirm could not be started."));
      setSubmitting(false);
    }
  }

  if (!publicKey) {
    return <Unavailable>Affirm is not available right now.</Unavailable>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">
        Pay {formatPrice(amount, settings, currency)} with Affirm.
      </p>
      <Button type="button" size="lg" className="w-full" disabled={submitting} onClick={() => void start()}>
        {submitting ? "Opening Affirm..." : "Continue with Affirm"}
      </Button>
      <SecureNote>
        Affirm reviews the installment plan. This store only receives the approval.
      </SecureNote>
    </div>
  );
}

function loadAffirm(publicKey: string, env: "sandbox" | "live") {
  const scriptUrl =
    env === "live"
      ? "https://cdn1.affirm.com/js/v2/affirm.js"
      : "https://cdn1-sandbox.affirm.com/js/v2/affirm.js";
  return new Promise<void>((resolve, reject) => {
    const runtime = window as unknown as {
      affirm?: unknown;
      _affirm_config?: Record<string, string>;
    };
    if (runtime.affirm) {
      resolve();
      return;
    }
    runtime._affirm_config = { public_api_key: publicKey, script: scriptUrl };
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Affirm could not be loaded."));
    document.body.appendChild(script);
  });
}

export function PaymentStep(props: PaymentStepProps) {
  if (props.mockPayment) {
    return (
      <MockPaymentForm
        amount={props.amount}
        currency={props.currency}
        orderId={props.orderId}
        orderKey={props.orderKey}
        clientSecret={props.clientSecret}
        onPaid={props.onPaid}
        onError={props.onError}
      />
    );
  }

  if (props.paymentKind === "paypal") {
    return (
      <PayPalPayment
        amount={props.amount}
        currency={props.currency}
        orderId={props.orderId}
        orderKey={props.orderKey}
        clientSecret={props.clientSecret}
        paypalClientId={props.paypalClientId || ""}
        onPaid={props.onPaid}
        onError={props.onError}
      />
    );
  }

  if (props.paymentKind === "affirm") {
    return (
      <AffirmPayment
        amount={props.amount}
        currency={props.currency}
        orderId={props.orderId}
        orderKey={props.orderKey}
        email={props.email}
        shipping={props.shipping}
        billing={props.billing}
        affirmPublicKey={props.affirmPublicKey}
        affirmEnv={props.affirmEnv}
        onPaid={props.onPaid}
        onError={props.onError}
      />
    );
  }

  if (props.paymentKind === "afterpay") {
    return (
      <AfterpayPayment
        amount={props.amount}
        currency={props.currency}
        redirectUrl={props.redirectUrl}
      />
    );
  }

  return <Unavailable>This payment method is not available.</Unavailable>;
}
