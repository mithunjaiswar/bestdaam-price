export const metadata = {
  title: "About Us — PriceVichar",
  description:
    "Learn how PriceVichar helps Indian shoppers review verified prices and recorded price information before buying.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="content-page">
      <h1>About PriceVichar</h1>
      <p>
        <strong>PriceVichar.com</strong> is an Indian price comparison website.
        Our mission is simple: help you compare clearly and buy wisely.
      </p>
      <p>
        The same product can be sold at different prices across online stores.
        Where we have verified listings for the exact same product, we bring
        those prices together and highlight the lowest available price. We also
        show recorded price information when enough history is available.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>Search for a product (for example: iPhone, mixer grinder, earbuds)</li>
        <li>Review one or more verified store prices currently in our catalog</li>
        <li>Compare stores side by side when an exact multi-store match exists</li>
        <li>Check available recorded price history before deciding</li>
        <li>Click through to the store and buy at the best price</li>
      </ul>
      <h2>Why trust us?</h2>
      <p>
        We never charge you anything, and we never mark up prices — you always
        pay the store&apos;s own price. PriceVichar may earn a small affiliate
        commission from stores when you buy through our links, which is how we
        keep the site free. See our{" "}
        <a href="/disclosure">Affiliate Disclosure</a> for details.
      </p>
      <h2>Contact</h2>
      <p>
        Questions or suggestions? Email us at{" "}
        <a href="mailto:contact@pricevichar.com">contact@pricevichar.com</a>.
      </p>
    </article>
  );
}
