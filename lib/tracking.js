"use client";

const TRACKING_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_URL ||
  process.env.NEXT_PUBLIC_PRODUCT_REQUEST_URL ||
  "https://script.google.com/macros/s/AKfycbwAtwt08dqP0Hx2QonKSrJITCR_CxIKY_FUZmjn_qJUabK_1ueIxuG0xwESbwa5TSH0/exec";

function getTrafficSource() {
  if (typeof window === "undefined") {
    return "direct";
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");

  if (utmSource) {
    const campaignSource = [utmSource, utmMedium, utmCampaign]
      .filter(Boolean)
      .join("/")
      .slice(0, 180);
    window.sessionStorage.setItem("bestdaam-traffic-source", campaignSource);
    return campaignSource;
  }

  const saved = window.sessionStorage.getItem("bestdaam-traffic-source");

  if (saved) {
    return saved;
  }

  try {
    return document.referrer
      ? new URL(document.referrer).hostname.replace(/^www\./, "")
      : "direct";
  } catch {
    return "direct";
  }
}

export function trackEvent(eventName, details = {}) {
  if (!TRACKING_URL || typeof window === "undefined") {
    return;
  }

  const body = new URLSearchParams({
    action: "track",
    event_name: eventName,
    source: getTrafficSource(),
    path: `${window.location.pathname}${window.location.search}`,
    product_id: details.productId || "",
    product_name: details.productName || "",
    category: details.category || "",
    store: details.store || "",
    query: details.query || "",
    value: details.value ? String(details.value) : "",
    website: "",
  });

  fetch(TRACKING_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
    keepalive: true,
  }).catch(() => {});
}
