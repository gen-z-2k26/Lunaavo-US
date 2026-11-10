"use client";

import { useEffect } from "react";
import { getCartAction, migrateLegacyCartAction } from "@/app/actions/cart";
import { HAS_CART_COOKIE } from "@/lib/cart-presence";
import { useCartStore } from "@/lib/cart-store";
import { userErrorMessage } from "@/lib/user-error";

type LegacyPersist = {
  state?: { items?: Array<{ productId?: string; quantity?: number }> };
};

function browserHasCart() {
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${HAS_CART_COOKIE}=`));
}

function readLegacyItems() {
  try {
    const raw = window.localStorage.getItem("cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LegacyPersist;
    return (parsed.state?.items ?? [])
      .map((item) => ({
        productId: String(item.productId || ""),
        quantity: Number(item.quantity) || 1,
      }))
      .filter((item) => item.productId);
  } catch {
    return [];
  }
}

export function CartHydrator() {
  const setCart = useCartStore((state) => state.setCart);
  const setHydrated = useCartStore((state) => state.setHydrated);
  const setError = useCartStore((state) => state.setError);

  useEffect(() => {
    let cancelled = false;
    const legacy = readLegacyItems();
    if (!browserHasCart() && legacy.length === 0) {
      setHydrated(true);
      return;
    }
    (async () => {
      try {
        const cart = legacy.length
          ? await migrateLegacyCartAction(legacy)
          : await getCartAction();
        if (cancelled) return;
        setCart(cart);
        window.localStorage.removeItem("cart");
        window.localStorage.removeItem("woo-cart");
      } catch (error) {
        if (!cancelled) {
          setError(
            userErrorMessage(error, "Could not load your cart."),
          );
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setCart, setError, setHydrated]);

  return null;
}
