import type { StoreCart } from "@/lib/types";

export type CartMutation =
  | { ok: true; cart: StoreCart }
  | { ok: false; message: string; catalogStale?: boolean };

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  times: "×",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  hellip: "…",
};

export function plainStoreMessage(value: string) {
  const decoded = value
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
      const key = body.toLowerCase();
      if (key.startsWith("#x")) {
        const code = Number.parseInt(key.slice(2), 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
      }
      if (key.startsWith("#")) {
        const code = Number.parseInt(key.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
      }
      return NAMED_ENTITIES[key] ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();
  return decoded.slice(0, 280);
}

export function cartErrorMessage(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : "";
  const plain = plainStoreMessage(raw);
  if (
    !plain ||
    /minified react|server components render|digest|turbopack/i.test(plain)
  ) {
    return fallback;
  }
  return plain;
}

export function unwrapCart(result: CartMutation): StoreCart {
  if (!result.ok) throw new Error(result.message);
  return result.cart;
}

export type PublicResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export function publicError(
  error: unknown,
  fallback: string,
): { ok: false; message: string } {
  return { ok: false, message: cartErrorMessage(error, fallback) };
}

export function unwrapResult<T>(result: PublicResult<T>): T {
  if (!result.ok) throw new Error(result.message);
  return result.data;
}
