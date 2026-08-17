export const metadata = {
  title: "About Us — PriceVichar",
  description:
    "PriceVichar is an Indian price comparison website that helps you find the lowest price across Amazon, Flipkart, Croma and Reliance Digital.",
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
        The same product is often sold at different prices on Amazon, Flipkart,
        Croma and Reliance Digital. Checking each site one by one wastes time —
        so we bring all the prices to one page, highlight the cheapest store,
        and show you how the price has moved over the last 30 days.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>Search for a product (for example: iPhone, mixer grinder, earbuds)</li>
        <li>See prices from multiple stores side by side</li>
        <li>The cheapest store is highlighted in green</li>
        <li>Check the price history to decide if now is a good time to buy</li>
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
