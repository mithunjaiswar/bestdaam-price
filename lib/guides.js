import { getLowestPrice } from "./helpers";

export const BUYING_GUIDES = {
  "best-earbuds-under-2000": {
    title: "Best earbuds under ₹2,000 in India",
    shortTitle: "Earbuds under ₹2,000",
    description:
      "Compare affordable earbuds under ₹2,000 using current PriceVichar catalog prices.",
    category: "Earbuds",
    maxPrice: 2000,
    tips: [
      "Prioritise fit and battery life over advertised bass claims.",
      "Check whether the case supports fast charging and USB-C.",
      "Confirm the seller, warranty and final checkout price before ordering.",
    ],
  },
  "best-smartwatches-under-5000": {
    title: "Best smartwatches under ₹5,000 in India",
    shortTitle: "Smartwatches under ₹5,000",
    description:
      "Explore smartwatches under ₹5,000 and compare the best currently listed prices.",
    category: "Smartwatch",
    maxPrice: 5000,
    tips: [
      "Choose display quality and battery life before extra sports modes.",
      "Verify phone compatibility and companion-app reviews.",
      "Health readings are useful trends but are not medical measurements.",
    ],
  },
  "best-phones-under-20000": {
    title: "Best mobile phones under ₹20,000 in India",
    shortTitle: "Phones under ₹20,000",
    description:
      "Compare mobile phones under ₹20,000 across available Indian store listings.",
    category: "Mobile",
    maxPrice: 20000,
    tips: [
      "Compare processor, display and software-update policy together.",
      "Check the exact RAM and storage variant before comparing prices.",
      "Bank discounts may require a specific card and should not be treated as the base price.",
    ],
  },
  "best-laptops-under-50000": {
    title: "Best laptops under ₹50,000 in India",
    shortTitle: "Laptops under ₹50,000",
    description:
      "Find laptops under ₹50,000 and compare current catalog prices before buying.",
    category: "Laptop",
    maxPrice: 50000,
    tips: [
      "Prefer at least 8 GB RAM and an SSD for everyday use.",
      "Compare processor generation, display panel and upgrade options.",
      "Check bundled software, warranty and seller details on the retailer page.",
    ],
  },
};

export function getGuideProducts(products, guide, limit = 24) {
  return products
    .filter((product) => {
      const price = getLowestPrice(product);
      return product.category === guide.category && price > 0 && price <= guide.maxPrice;
    })
    .sort((a, b) => getLowestPrice(a) - getLowestPrice(b))
    .slice(0, limit);
}
