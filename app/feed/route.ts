import { NextResponse } from "next/server";
import { FEED_REVALIDATE_SECONDS } from "@/lib/cache-policy";
import { feedStoreOrigin, rewriteProductLinks } from "@/lib/ctx-feed";

export const revalidate = 900;

function originOf(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

export async function GET() {
  const feedUrl = process.env.CTX_FEED_URL?.trim();
  if (!feedUrl) {
    return NextResponse.json(
      { error: "CTX_FEED_URL is not configured." },
      { status: 500 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(feedUrl, {
      next: { revalidate: FEED_REVALIDATE_SECONDS },
    });
  } catch {
    return NextResponse.json(
      { error: "CTX feed could not be fetched." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "CTX feed could not be fetched." },
      { status: 502 },
    );
  }

  const wpOrigin = originOf(process.env.WC_URL?.trim() || feedUrl);
  const storeOrigin = feedStoreOrigin(wpOrigin, process.env.NEXT_PUBLIC_SITE_URL);
  const body = rewriteProductLinks(await upstream.text(), wpOrigin, storeOrigin);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS}`,
    },
  });
}
