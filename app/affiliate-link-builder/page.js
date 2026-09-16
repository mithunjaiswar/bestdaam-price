import AmazonAffiliateLinkBuilder from "../components/AmazonAffiliateLinkBuilder";

export const metadata = {
  title: "Amazon Affiliate Link Builder | PriceVichar",
  description: "Create an Amazon India affiliate link with PriceVichar tracking.",
  robots: { index: false, follow: false },
};

export default function AffiliateLinkBuilderPage() {
  return (
    <section className="affiliate-builder-page">
      <span className="results-kicker">For PriceVichar</span>
      <h1>Amazon affiliate link builder</h1>
      <p className="affiliate-builder-intro">
        Paste an Amazon India product, share or <code>amzn.in</code> short link.
        We will add your Amazon Associates tracking tag automatically.
      </p>
      <AmazonAffiliateLinkBuilder />
      <aside className="affiliate-builder-note">
        Use only for genuine recommendations. Prices, delivery and availability must
        always be confirmed on Amazon before sharing. As an Amazon Associate,
        PriceVichar earns from qualifying purchases.
      </aside>
    </section>
  );
}
