"use client";

import { addItemToCartAction, shopNowAction } from "@/app/actions/cart";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "@/lib/toast-store";
import { userErrorMessage } from "@/lib/user-error";
import type { Product } from "@/lib/types";

export class CatalogConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogConflictError";
  }
}

export function isCatalogConflictError(error: unknown) {
  return error instanceof Error && error.name === "CatalogConflictError";
}

function rejectCart(result: { ok: false; message: string; catalogStale?: boolean }) {
  const error = result.catalogStale
    ? new CatalogConflictError(result.message)
    : new Error(result.message);
  return error;
}

export async function addProductToCart(product: Product, quantity = 1) {
  try {
    const result = await addItemToCartAction({
      id: Number(product.id),
      quantity,
    });
    if (!result.ok) throw rejectCart(result);
    const cart = result.cart;
    useCartStore.getState().setCart(cart, { open: true, bump: true });
    toast({
      title: "Added to cart",
      description:
        quantity > 1 ? `${product.name} (${quantity})` : product.name,
    });
    return cart;
  } catch (error) {
    toast({
      title: "Could not add to cart",
      description: userErrorMessage(error, "Please try again."),
      variant: "error",
    });
    throw error;
  }
}

export async function shopNowToCheckout(
  product: Product,
  quantity = 1,
  emptyCart = false,
) {
  try {
    const result = await shopNowAction({
      id: Number(product.id),
      quantity,
      emptyCart,
    });
    if (!result.ok) throw rejectCart(result);
    const cart = result.cart;
    useCartStore.getState().setCart(cart, { open: false, bump: true });
    return cart;
  } catch (error) {
    toast({
      title: "Could not start checkout",
      description: userErrorMessage(error, "Please try again."),
      variant: "error",
    });
    throw error;
  }
}
