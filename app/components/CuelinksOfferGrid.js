function formatEndDate(value) {
  if (!value) return "Limited-time offer";

  const date = new Date(`${value}T00:00:00+05:30`);

  if (Number.isNaN(date.getTime())) return "Limited-time offer";

  return `Valid till ${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

export default function CuelinksOfferGrid({ offers }) {
  if (!offers.length) return null;

  return (
    <section className="live-offers" aria-labelledby="live-offers-title">
      <div className="section-heading offer-section-heading">
        <div>
          <span className="landing-eyebrow">Live partner offers</span>
          <h2 id="live-offers-title">Coupons and store-wide deals</h2>
          <p>
            Current India-focused offers supplied by Cuelinks. These are
            merchant promotions, not verified product-price comparisons.
          </p>
        </div>
      </div>

      <div className="offer-grid">
        {offers.map((offer) => (
          <article className="offer-card" key={offer.id}>
            <div className="offer-card-topline">
              <span className="offer-merchant">{offer.campaign}</span>
              {offer.percentOff ? (
                <span className="offer-discount">Up to {offer.percentOff}% off</span>
              ) : (
                <span className="offer-discount">Live offer</span>
              )}
            </div>
            <h3>{offer.title}</h3>
            {offer.description ? <p>{offer.description}</p> : null}
            {offer.couponCode ? (
              <div className="coupon-code">
                Code: <strong>{offer.couponCode}</strong>
              </div>
            ) : null}
            <div className="offer-card-footer">
              <span>{formatEndDate(offer.endDate)}</span>
              <a
                href={offer.trackingUrl}
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
        Affiliate disclosure: BestDaam may earn a commission from qualifying
        purchases. Offer eligibility and final price are confirmed by the
        retailer.
      </p>
    </section>
  );
}

