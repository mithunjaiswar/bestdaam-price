import { NextResponse } from "next/server";

const ASSOCIATE_TAG = "bestdaam0a-21";

function isAmazonIndiaHost(hostname) {
  const host = hostname.toLowerCase();
  return (
    host === "amazon.in" ||
    host.endsWith(".amazon.in") ||
    host === "amzn.in" ||
    host.endsWith(".amzn.in")
  );
}

function normalizeInput(value) {
  const input = String(value || "").trim();
  if (!input) return null;

  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return null;
  }
}

function getAmazonProductId(url) {
  const match = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  return match?.[1]?.toUpperCase() || null;
}

export async function POST(request) {
  const { url } = await request.json().catch(() => ({}));
  const sourceUrl = normalizeInput(url);

  if (!sourceUrl || !isAmazonIndiaHost(sourceUrl.hostname)) {
    return NextResponse.json(
      { error: "Paste an Amazon India or amzn.in link." },
      { status: 400 }
    );
  }

  let destination = sourceUrl;
  try {
    const response = await fetch(sourceUrl, {
      redirect: "follow",
      headers: { "User-Agent": "PriceVichar Affiliate Link Builder" },
      signal: AbortSignal.timeout(10_000),
    });
    destination = new URL(response.url);
  } catch {
    if (sourceUrl.hostname.endsWith("amzn.in")) {
      return NextResponse.json(
        { error: "Amazon short link could not be resolved. Please try again." },
        { status: 422 }
      );
    }
  }

  if (!isAmazonIndiaHost(destination.hostname)) {
    return NextResponse.json(
      { error: "That link did not resolve to Amazon India." },
      { status: 400 }
    );
  }

  const productId = getAmazonProductId(destination);
  if (productId) {
    return NextResponse.json({
      url: `https://www.amazon.in/dp/${productId}?tag=${ASSOCIATE_TAG}`,
    });
  }

  destination.protocol = "https:";
  destination.search = "";
  destination.searchParams.set("tag", ASSOCIATE_TAG);
  return NextResponse.json({ url: destination.toString() });
}
