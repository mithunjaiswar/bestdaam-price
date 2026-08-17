import { NextResponse } from "next/server";

const CUELINKS_API_BASE = "https://developers.cuelinks.com/pub_api/v3";

function isAllowedImageUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "cdn0.cuelinks.com" ||
        url.hostname.endsWith(".cuelinks.com"))
    );
  } catch {
    return false;
  }
}

export async function GET(_request, { params }) {
  const { campaignId } = await params;
  const apiKey = process.env.CUELINKS_READ_API_KEY;

  if (!apiKey || !/^\d+$/.test(campaignId)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const campaignResponse = await fetch(
      `${CUELINKS_API_BASE}/campaigns/${campaignId}`,
      {
        headers: { Authorization: `Token ${apiKey}` },
        next: { revalidate: 86400 },
      }
    );

    if (!campaignResponse.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const campaignPayload = await campaignResponse.json();
    const imageUrl = campaignPayload?.data?.image;

    if (!isAllowedImageUrl(imageUrl)) {
      return new NextResponse(null, { status: 404 });
    }

    const imageResponse = await fetch(imageUrl, {
      next: { revalidate: 86400 },
    });
    const contentType = imageResponse.headers.get("content-type") || "";

    if (!imageResponse.ok || !contentType.startsWith("image/")) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(await imageResponse.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

