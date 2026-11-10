import { toWooCommerceApiError, WooCommerceApiError } from "@/lib/api/errors";

const CODE =
  /out_of_stock|not_purchasable|invalid_product|product_invalid|product_not_found|cart_invalid_product/;

const MESSAGE =
  /not enough stock|out of stock|insufficient stock|sold out|cannot be purchased|cannot be added to the cart|no longer available|not available for purchase|is not available|does not exist|do not exist/i;

/** Woo rejected a product the cached page still offered. */
export function isCatalogConflict(error: unknown) {
  const mapped =
    error instanceof WooCommerceApiError ? error : toWooCommerceApiError(error);
  const code = (mapped.code || "").toLowerCase();
  if (CODE.test(code)) return true;
  if (
    mapped.status === 404 &&
    /product/i.test(`${mapped.endpoint || ""} ${mapped.message}`)
  ) {
    return true;
  }
  return MESSAGE.test(mapped.message);
}
