import { NextResponse } from "next/server";
import {
  convertCuelinksUrl,
  isSupportedCuelinksUrl,
} from "../../lib/cuelinks";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const destination = requestUrl.searchParams.get("url");

  if (!destination || !isSupportedCuelinksUrl(destination)) {
    return NextResponse.redirect(new URL("/", requestUrl));
  }

  try {
    const converted = await convertCuelinksUrl(destination, {
      productId: requestUrl.searchParams.get("product") || undefined,
      store: requestUrl.searchParams.get("store") || undefined,
      placement: requestUrl.searchParams.get("placement") || "product_page",
    });

    return NextResponse.redirect(converted.trackingUrl);
  } catch {
    // A temporary Cuelinks failure must never prevent a shopper from reaching
    // the merchant. The original verified merchant URL remains the fallback.
    return NextResponse.redirect(destination);
  }
}
