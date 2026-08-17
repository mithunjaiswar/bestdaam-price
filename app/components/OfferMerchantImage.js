"use client";

import { useState } from "react";

export default function OfferMerchantImage({ campaignId, campaign }) {
  const [failed, setFailed] = useState(false);

  if (failed || !campaignId) {
    return (
      <span className="offer-image-fallback" aria-hidden="true">
        {campaign.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`/merchant-image/${campaignId}`}
      alt={`${campaign} logo`}
      loading="lazy"
      className="offer-image"
      onError={() => setFailed(true)}
    />
  );
}

