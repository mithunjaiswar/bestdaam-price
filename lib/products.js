import localProducts from "../data/products.json";

// "BestDaam Products" Google Sheet — the product catalog lives here so it can
// be edited without touching code. The sheet must be shared as "Anyone with
// the link: Viewer" for the CSV export to work; until then (or on any fetch
// problem) the site silently falls back to the snapshot in data/products.json.
const SHEET_ID = "1NQZgDW12nG1Gu2BCxEKndAZMDxl5cW6KEerBC4aJ5n8";
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

const STORES = [
  ["amazon", "Amazon"],
  ["flipkart", "Flipkart"],
  ["croma", "Croma"],
  ["reliance", "Reliance Digital"],
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toPrice(value) {
  const n = parseInt(String(value ?? "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function rowsToProducts(rows) {
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const idx = {};
  header.forEach((h, i) => {
    idx[h.trim().toLowerCase()] = i;
  });
  const cell = (r, key) => (idx[key] === undefined ? "" : (r[idx[key]] ?? ""));

  const products = [];
  for (const r of data) {
    const name = cell(r, "name").trim();
    if (!name) continue;
    const prices = [];
    for (const [key, store] of STORES) {
      const price = toPrice(cell(r, `${key}_price`));
      if (!price) continue;
      const url = cell(r, `${key}_url`).trim() || "#";
      prices.push({ store, price, url });
    }
    if (!prices.length) continue;
    products.push({
      id: cell(r, "id").trim() || slugify(name),
      name,
      category: cell(r, "category").trim() || "Other",
      emoji: cell(r, "emoji").trim() || "🛍️",
      prices,
    });
  }
  return products;
}

// Server-side only: current catalog, refreshed from the sheet every 10 min.
export async function fetchProducts() {
  try {
    const res = await fetch(SHEET_CSV_URL, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`sheet fetch failed: ${res.status}`);
    const text = await res.text();
    if (text.trim().startsWith("<")) throw new Error("sheet is not public");
    const products = rowsToProducts(parseCsv(text));
    if (!products.length) throw new Error("sheet has no products");
    return products;
  } catch {
    return localProducts;
  }
}

// Build-time snapshot, used for pre-rendering known product pages.
export function getLocalProducts() {
  return localProducts;
}
