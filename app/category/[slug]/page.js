import { notFound } from "next/navigation";
import { fetchProducts, getLocalProducts } from "../../../lib/products";
import { getCategories } from "../../../lib/helpers";
import { findCategoryBySlug, slugify } from "../../../lib/slugs";
import DealGrid from "../../components/DealGrid";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  safeJsonLd,
} from "../../../lib/seo";

export const revalidate = 600;

export function generateStaticParams() {
  return getCategories(getLocalProducts()).map((category) => ({
    slug: slugify(category),
  }));
}

export function generateMetadata({ params }) {
  const categories = getCategories(getLocalProducts());
  const category = findCategoryBySlug(categories, params.slug);

  if (!category) {
    return {};
  }

  return {
    title: `Compare ${category} Prices | BestDaam`,
    description: `Compare verified ${category} prices and find the best available deal on BestDaam.`,
    alternates: { canonical: `/category/${params.slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const products = await fetchProducts();
  const categories = getCategories(products);
  const category = findCategoryBySlug(categories, params.slug);

  if (!category) {
    notFound();
  }

  const matches = products.filter((product) => product.category === category);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category} price comparison`,
    numberOfItems: matches.length,
    itemListElement: matches.slice(0, 100).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/product/${product.id}`),
    })),
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: category, path: `/category/${params.slug}` },
  ]);

  return (
    <>
      <section className="landing-hero compact">
        <span className="landing-eyebrow">Compare verified listings</span>
        <h1>{category}</h1>
        <p>
          Compare current prices for {category.toLowerCase()} products across
          available stores.
        </p>
      </section>
      <DealGrid products={matches} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
    </>
  );
}
