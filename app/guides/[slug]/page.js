import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProducts } from "../../../lib/products";
import { BUYING_GUIDES, getGuideProducts } from "../../../lib/guides";
import { absoluteUrl, safeJsonLd } from "../../../lib/seo";
import DealGrid from "../../components/DealGrid";

export const revalidate = 600;

export function generateStaticParams() {
  return Object.keys(BUYING_GUIDES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = BUYING_GUIDES[slug];
  if (!guide) return {};
  return {
    title: `${guide.title} | PriceVichar`,
    description: guide.description,
    alternates: { canonical: `/guides/${slug}` },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = BUYING_GUIDES[slug];
  if (!guide) notFound();

  const products = getGuideProducts(await fetchProducts(), guide);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: guide.title,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/product/${product.id}`),
      name: product.name,
    })),
  };

  return (
    <>
      <section className="landing-hero guide-hero">
        <span className="landing-eyebrow">Updated from the PriceVichar catalog</span>
        <h1>{guide.title}</h1>
        <p>{guide.description} Prices can change at the retailer.</p>
        <Link href="/guides" className="text-link">← All buying guides</Link>
      </section>

      <section className="guide-tips" aria-labelledby="guide-tips-title">
        <h2 id="guide-tips-title">What to check before buying</h2>
        <ul>{guide.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
      </section>

      <section className="catalog-deals" aria-labelledby="guide-products-title">
        <div className="section-heading-row">
          <div>
            <span className="results-kicker">Current catalog shortlist</span>
            <h2 id="guide-products-title">{products.length} options to compare</h2>
          </div>
        </div>
        {products.length ? (
          <DealGrid products={products} />
        ) : (
          <p className="no-results">No matching verified listings are available right now.</p>
        )}
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />
    </>
  );
}
