export const metadata = {
  title: "Affiliate Disclosure — BestDaam",
  description:
    "How BestDaam earns affiliate commissions from stores like Amazon and Flipkart.",
};

export default function DisclosurePage() {
  return (
    <article className="content-page">
      <h1>Affiliate Disclosure</h1>
      <p>
        BestDaam.in is a free price comparison service. To keep it free, we
        participate in affiliate programs offered by online stores and
        affiliate networks.
      </p>
      <p>
        When you click a link on BestDaam and make a purchase on a store like
        Amazon, Flipkart, Croma or Reliance Digital, we may earn a small
        commission from that store. <strong>This never costs you anything
        extra</strong> — you pay exactly the same price you would pay by
        visiting the store directly.
      </p>
      <p>
        As an Amazon Associate, we earn from qualifying purchases.
      </p>
      <h2>Our promise</h2>
      <ul>
        <li>Commissions never influence which store we highlight as cheapest —
          that is decided purely by price</li>
        <li>We do not accept payment to rank one store above another</li>
        <li>Prices shown are indicative and may change on the store&apos;s
          website; always check the final price on the store before buying</li>
      </ul>
    </article>
  );
}
