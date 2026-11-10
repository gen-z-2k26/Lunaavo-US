"use client";

import {
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type {
  Appearance,
  Stripe,
  StripeElements,
  StripeElementsOptionsMode,
  StripeExpressCheckoutElementConfirmEvent,
} from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeCheckoutAction } from "@/app/actions/checkout";
import { unwrapResult } from "@/lib/cart-result";
import { getStripeJs } from "@/lib/stripe-browser";
import {
  STRIPE_SEPARATE_CHECKOUT_METHODS,
  toStripeAmount,
  toStripeMinor,
} from "@/lib/stripe-amount";
import { stripePersonName } from "@/lib/stripe-address";
import {
  isWalletShippingCountry,
  walletShippingCountries,
} from "@/lib/stripe-wallet-countries";
import { useStore } from "@/lib/store-context";
import { useThemeMode } from "@/lib/theme-mode";
import type {
  Address,
  CheckoutSessionResult,
  CreateOrderResult,
  ThemePalette,
} from "@/lib/types";
import { userErrorMessage } from "@/lib/user-error";

type StripeConfig = {
  stripe: Promise<Stripe | null>;
  options: StripeElementsOptionsMode;
  elementsKey: string;
};

const StripeConfigContext = createContext<StripeConfig | null>(null);

export type WalletRate = { id: string; amount: number; displayName: string };

export type WalletQuote = {
  rates: WalletRate[];
  totalMinor: number;
};

type WalletBlock = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export type WalletPayer = {
  email: string;
  phone: string;
  rateId: string | null;
  shipping: WalletBlock;
  billing: WalletBlock | null;
};

const PENDING_RATE_ID = "pending";

class StripeBoundary extends Component<
  { fallback?: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Stripe element failed", error, info.componentStack);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

function stripeAppearance(palette: ThemePalette): Appearance {
  return {
    theme: "stripe",
    variables: {
      colorPrimary: palette.accent,
      colorBackground: palette.background,
      colorText: palette.foreground,
      colorTextSecondary: palette.mutedForeground,
      colorDanger: "#b91c1c",
      fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif",
      borderRadius: "8px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        border: `1px solid ${palette.border}`,
        boxShadow: "none",
      },
      ".Tab": {
        border: `1px solid ${palette.border}`,
        boxShadow: "none",
      },
      ".Tab--selected": {
        borderColor: palette.accent,
      },
    },
  };
}

export function StripeCheckoutProvider({
  enabled,
  publishableKey,
  amount,
  currency,
  children,
}: {
  enabled: boolean;
  publishableKey: string;
  amount: number;
  currency: string;
  children: ReactNode;
}) {
  const { settings } = useStore();
  const { resolved } = useThemeMode();
  const palette =
    resolved === "dark" ? settings.theme.dark : settings.theme.light;
  const appearance = useMemo(() => stripeAppearance(palette), [palette]);
  const code = (currency || "usd").trim().toLowerCase();
  const minor = useMemo(() => {
    try {
      return toStripeMinor(amount, code);
    } catch {
      return 0;
    }
  }, [amount, code]);
  const key = publishableKey.trim();
  const config = useMemo<StripeConfig | null>(() => {
    if (!enabled || !key || minor < 1) return null;
    return {
      stripe: getStripeJs(key),
      elementsKey: `${key}:${code}`,
      options: {
        mode: "payment",
        amount: minor,
        currency: code,
        appearance,
        excludedPaymentMethodTypes: [...STRIPE_SEPARATE_CHECKOUT_METHODS],
        loader: "auto",
      },
    };
  }, [appearance, code, enabled, key, minor]);

  return (
    <StripeConfigContext.Provider value={config}>
      {children}
    </StripeConfigContext.Provider>
  );
}

function StripeElementsScope({ children }: { children: ReactNode }) {
  const config = useContext(StripeConfigContext);
  if (!config) return null;
  return (
    <Elements
      key={config.elementsKey}
      stripe={config.stripe}
      options={config.options}
    >
      {children}
    </Elements>
  );
}

function orderReturnUrl(session: CheckoutSessionResult) {
  const url = new URL(
    `/order/${encodeURIComponent(session.orderId)}`,
    window.location.origin,
  );
  url.searchParams.set("key", session.orderKey);
  url.searchParams.set("email", session.email);
  return url.toString();
}

function fullBillingDetails(address: Address, email: string) {
  return {
    name: stripePersonName(address) || "Customer",
    email: email.trim() || address.email.trim(),
    phone: address.phone.trim(),
    address: {
      line1: address.address1.trim(),
      line2: address.address2.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      postal_code: address.postcode.trim(),
      country: address.country.trim().toUpperCase().slice(0, 2),
    },
  };
}

function friendlyStripeError(message: string) {
  if (message.includes("No such payment_intent")) {
    return "This payment could not be started. Please refresh the page and try again.";
  }
  return message;
}

async function confirmStripePayment(input: {
  stripe: Stripe;
  elements: StripeElements;
  session: CheckoutSessionResult;
  billingDetails?: ReturnType<typeof fullBillingDetails>;
}): Promise<
  | { ok: true; order: CreateOrderResult }
  | { ok: false; message: string }
> {
  const confirmed = await input.stripe.confirmPayment({
    elements: input.elements,
    clientSecret: input.session.clientSecret,
    confirmParams: {
      return_url: orderReturnUrl(input.session),
      ...(input.billingDetails
        ? { payment_method_data: { billing_details: input.billingDetails } }
        : {}),
    },
    redirect: "if_required",
  });
  if (confirmed.error) {
    return {
      ok: false,
      message: friendlyStripeError(
        confirmed.error.message || "Payment could not be completed.",
      ),
    };
  }
  const status = confirmed.paymentIntent?.status;
  if (status === "succeeded") {
    const order = unwrapResult(
      await completeCheckoutAction({
        orderId: input.session.orderId,
        orderKey: input.session.orderKey,
        paymentIntentId: confirmed.paymentIntent.id,
      }),
    );
    return { ok: true, order };
  }
  if (status === "processing") {
    return {
      ok: false,
      message: "Payment is still processing. Check your email for confirmation.",
    };
  }
  return { ok: false, message: "Payment was not completed. Try again." };
}

type ExpressProps = {
  needsShipping: boolean;
  countryCodes: string[];
  deliveryCountry: string;
  initialRates: WalletRate[];
  businessName: string;
  onQuoteShipping: (input: {
    name: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  }) => Promise<WalletQuote | null>;
  onSelectRate: (rateId: string) => Promise<number | null>;
  onSync: (payer: WalletPayer) => Promise<number | null>;
  onCreate: (payer: WalletPayer) => Promise<CheckoutSessionResult | null>;
  onPaid: (order: CreateOrderResult) => void;
  onError: (message: string) => void;
};

/**
 * Wallet buttons run in their own Elements group so an unfinished card form
 * never blocks `elements.submit()` for Apple Pay, Google Pay, or Amazon Pay.
 */
export function ExpressCheckoutRow(props: ExpressProps) {
  const walletCountries = useMemo(
    () => walletShippingCountries(props.countryCodes),
    [props.countryCodes],
  );
  const country = props.deliveryCountry.trim().toUpperCase();
  const eligible =
    !props.needsShipping ||
    (walletCountries.length > 0 &&
      (!country || walletCountries.includes(country)));
  if (!eligible) return null;
  return (
    <StripeBoundary>
      <StripeElementsScope>
        <ExpressCheckoutInner {...props} walletCountries={walletCountries} />
      </StripeElementsScope>
    </StripeBoundary>
  );
}

function ExpressCheckoutInner({
  needsShipping,
  walletCountries,
  initialRates,
  businessName,
  ...callbacks
}: ExpressProps & { walletCountries: string[] }) {
  const stripe = useStripe();
  const elements = useElements();
  const [available, setAvailable] = useState(false);
  const handlers = useRef(callbacks);
  const ratesRef = useRef(initialRates);
  const allowed = useMemo(() => new Set(walletCountries), [walletCountries]);
  useEffect(() => {
    handlers.current = callbacks;
    ratesRef.current = initialRates;
  });

  const countryOk = useCallback(
    (code: string) => {
      const value = code.trim().toUpperCase();
      return isWalletShippingCountry(value) && (!allowed.size || allowed.has(value));
    },
    [allowed],
  );

  const onConfirm = useCallback(
    async (event: StripeExpressCheckoutElementConfirmEvent) => {
      const fail = (message: string) => {
        event.paymentFailed({ reason: "fail", message });
        handlers.current.onError(message);
      };
      if (!stripe || !elements) {
        fail("Payment is still loading. Try again in a moment.");
        return;
      }
      try {
        const submitted = await elements.submit();
        if (submitted.error) {
          fail(submitted.error.message || "Payment could not be started.");
          return;
        }
        const payer = payerFromWallet(event);
        if (!payer.email || !payer.shipping.line1 || !payer.shipping.country) {
          fail("The wallet did not share a complete email and address. Please pay by card.");
          return;
        }
        if (needsShipping && !countryOk(payer.shipping.country)) {
          event.paymentFailed({ reason: "address_unserviceable" });
          handlers.current.onError(
            "Express checkout does not ship to this country. Please pay by card below.",
          );
          return;
        }
        const syncedMinor = await handlers.current.onSync(payer);
        if (syncedMinor == null) {
          event.paymentFailed({ reason: "address_unserviceable" });
          handlers.current.onError("No shipping is available for this address.");
          return;
        }
        const session = await handlers.current.onCreate(payer);
        if (!session?.clientSecret) {
          fail("Could not start checkout. Please try again.");
          return;
        }
        if (toStripeAmount(session.amount, session.currency) !== syncedMinor) {
          fail("Your total changed. Review your order and try again.");
          return;
        }
        const result = await confirmStripePayment({ stripe, elements, session });
        if (result.ok) handlers.current.onPaid(result.order);
        else fail(result.message);
      } catch (error) {
        fail(userErrorMessage(error, "Payment could not be completed."));
      }
    },
    [countryOk, elements, needsShipping, stripe],
  );

  return (
    <div className={available ? "space-y-4" : undefined}>
      {available ? (
        <p className="text-center text-sm text-muted-foreground">Express checkout</p>
      ) : null}
      <ExpressCheckoutElement
        onConfirm={(event) => {
          void onConfirm(event);
        }}
        onClick={(event) => {
          if (!needsShipping) {
            event.resolve();
            return;
          }
          const rates = ratesRef.current.length
            ? ratesRef.current
            : [{ id: PENDING_RATE_ID, amount: 0, displayName: "Calculated after address" }];
          event.resolve({ shippingRates: rates });
        }}
        onAvailablePaymentMethodsChange={(event) => {
          const methods = event.paymentMethods;
          setAvailable(
            Boolean(methods && Object.values(methods).some((method) => method?.available)),
          );
        }}
        onLoadError={() => setAvailable(false)}
        options={{
          buttonHeight: 48,
          buttonTheme: { applePay: "black", googlePay: "black" },
          buttonType: { applePay: "check-out", googlePay: "checkout" },
          layout: { maxColumns: 3, maxRows: 1, overflow: "auto" },
          paymentMethodOrder: ["apple_pay", "google_pay", "amazon_pay", "link"],
          paymentMethods: {
            applePay: "always",
            googlePay: "always",
            amazonPay: "auto",
            link: "auto",
            paypal: "never",
            klarna: "never",
          },
          business: { name: businessName },
          emailRequired: true,
          phoneNumberRequired: false,
          billingAddressRequired: false,
          shippingAddressRequired: needsShipping,
          ...(needsShipping && walletCountries.length
            ? { allowedShippingCountries: walletCountries }
            : {}),
        }}
        onShippingAddressChange={(event) => {
          if (!countryOk(event.address.country)) {
            event.reject();
            return;
          }
          void handlers.current
            .onQuoteShipping({
              name: event.name,
              city: event.address.city,
              state: event.address.state,
              postcode: event.address.postal_code,
              country: event.address.country,
            })
            .then((quote) => {
              if (!quote || !quote.rates.length) {
                event.reject();
                return;
              }
              elements?.update({ amount: quote.totalMinor });
              event.resolve({ shippingRates: quote.rates });
            })
            .catch(() => event.reject());
        }}
        onShippingRateChange={(event) => {
          if (event.shippingRate.id === PENDING_RATE_ID) {
            event.resolve();
            return;
          }
          void handlers.current
            .onSelectRate(event.shippingRate.id)
            .then((totalMinor) => {
              if (totalMinor == null) {
                event.reject();
                return;
              }
              elements?.update({ amount: totalMinor });
              event.resolve();
            })
            .catch(() => event.reject());
        }}
      />
      {available ? (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>
      ) : null}
    </div>
  );
}

type CardProps = {
  wallets: "auto" | "never";
  amountMinor: number;
  billing: Address;
  email: string;
  disabled?: boolean;
  payRef?: RefObject<(() => void) | null>;
  canPay?: () => boolean;
  onCreate: () => Promise<CheckoutSessionResult | null>;
  onPaid: (order: CreateOrderResult) => void;
  onError: (message: string) => void;
  /** Rendered between the card fields and the Pay now button. */
  children?: ReactNode;
};

/** Card fields plus the Pay now button, sharing one Elements group. */
export function StripeCardCheckout(props: CardProps) {
  return (
    <StripeBoundary
      fallback={
        <p className="rounded-md border border-border bg-muted px-4 py-4 text-sm">
          Card payment could not load. Please refresh the page or choose another payment method.
        </p>
      }
    >
      <StripeElementsScope>
        <StripeCardInner {...props} />
      </StripeElementsScope>
    </StripeBoundary>
  );
}

function StripeCardInner({
  wallets,
  amountMinor,
  billing,
  email,
  disabled,
  payRef,
  canPay,
  onCreate,
  onPaid,
  onError,
  children,
}: CardProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState("");
  const submittingRef = useRef(false);
  const latest = useRef({ billing, email, onCreate, onPaid, onError, amountMinor, canPay });
  useEffect(() => {
    latest.current = { billing, email, onCreate, onPaid, onError, amountMinor, canPay };
  });

  const pay = useCallback(async () => {
    if (!stripe || !elements || submittingRef.current) return;
    const current = latest.current;
    if (current.canPay && !current.canPay()) return;
    submittingRef.current = true;
    setSubmitting(true);
    setCardError("");
    try {
      if (current.amountMinor > 0) elements.update({ amount: current.amountMinor });
      const submitted = await elements.submit();
      if (submitted.error) {
        setCardError(submitted.error.message || "Check the card details and try again.");
        return;
      }
      const session = await current.onCreate();
      if (!session) return;
      const finalMinor = toStripeAmount(session.amount, session.currency);
      if (finalMinor !== current.amountMinor) {
        elements.update({ amount: finalMinor });
        const again = await elements.submit();
        if (again.error) {
          setCardError(again.error.message || "Check the card details and try again.");
          return;
        }
      }
      const result = await confirmStripePayment({
        stripe,
        elements,
        session,
        billingDetails: fullBillingDetails(current.billing, current.email),
      });
      if (result.ok) current.onPaid(result.order);
      else setCardError(result.message);
    } catch (error) {
      setCardError(userErrorMessage(error, "Payment could not be completed."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [elements, stripe]);

  useEffect(() => {
    if (!payRef) return;
    payRef.current = () => void pay();
    return () => {
      payRef.current = null;
    };
  }, [pay, payRef]);

  return (
    <div className="space-y-4">
      <PaymentElement
        onReady={() => setReady(true)}
        onLoadError={(event) => {
          setCardError(
            event.error?.message ||
              "Card payment could not load. Please refresh the page.",
          );
        }}
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
          wallets: { applePay: wallets, googlePay: wallets },
          fields: {
            billingDetails: {
              name: "never",
              email: "never",
              phone: "never",
              address: "never",
            },
          },
        }}
      />
      {children}
      {cardError ? (
        <p className="text-sm text-destructive" role="alert">
          {cardError}
        </p>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="h-12 w-full rounded-md bg-accent text-sm font-medium text-accent-foreground hover:bg-accent/90"
        disabled={disabled || submitting || !stripe || !elements || !ready}
        aria-busy={submitting}
        onClick={() => void pay()}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Pay now
      </Button>
    </div>
  );
}

function payerFromWallet(event: StripeExpressCheckoutElementConfirmEvent): WalletPayer {
  const shipping = event.shippingAddress;
  const billing = event.billingDetails;
  const block = (
    name: string | undefined,
    address:
      | {
          line1?: string | null;
          line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
        }
      | undefined,
  ): WalletBlock => ({
    name: name || "",
    line1: address?.line1 || "",
    line2: address?.line2 || "",
    city: address?.city || "",
    state: address?.state || "",
    postcode: address?.postal_code || "",
    country: (address?.country || "").toUpperCase(),
  });
  return {
    email: billing?.email?.trim() || "",
    phone: billing?.phone?.trim() || "",
    rateId:
      event.shippingRate?.id && event.shippingRate.id !== PENDING_RATE_ID
        ? event.shippingRate.id
        : null,
    shipping: shipping
      ? block(shipping.name, shipping.address)
      : block(billing?.name, billing?.address),
    billing: billing?.address?.line1 ? block(billing.name, billing.address) : null,
  };
}
