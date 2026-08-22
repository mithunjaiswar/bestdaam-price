function formatDate(value, prefix) {
  const date = new Date(`${value}T00:00:00+05:30`);

  if (Number.isNaN(date.getTime())) return "";

  return `${prefix} ${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

export default function EarnKaroOfferGrid({ offers }) {
  if (!offers.length) return null;

  return (
    <section className="live-offers" aria-labelledby="earnkaro-offers-title">
      <div className="section-heading offer-section-heading">
        <div>
          <span className="landing-eyebrow">EarnKaro limited-time offers</span>
          <h2 id="earnkaro-offers-title">Current store promotions</h2>
          <p>
            Promotions checked on EarnKaro and automatically hidden after their
            review window. These are store offers, not verified product prices.
          </p>
        </div>
      </div>

      <div className="offer-grid">
        {offers.map((offer) => (
          <article className="offer-card" key={offer.id}>
            <div className="offer-media earnkaro-offer-media" aria-hidden="true">
              <span className="offer-image-fallback">
                {offer.merchant.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="offer-card-topline">
              <span className="offer-merchant">{offer.merchant}</span>
              <span className="offer-discount">{offer.discountLabel}</span>
            </div>
            <h3>{offer.title}</h3>
            <p>{offer.description}</p>
            <div className="offer-card-footer">
              <span>{formatDate(offer.expiresAt, "Review by")}</span>
              <a
                href={offer.destinationUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="offer-cta"
              >
                View offer <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className="offer-disclosure">
        Offer details were checked on {formatDate(offers[0].checkedAt, "")}. Final
        price, eligibility and availability must be confirmed on the retailer
        website. PriceVichar may earn a commission from eligible purchases.
      </p>
    </section>
  );
}
