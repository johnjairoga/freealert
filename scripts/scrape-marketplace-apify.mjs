import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_PATH = path.join(process.cwd(), "src/data/marketplace-products.json");
const APP_FEED_PATH = path.join(process.cwd(), "src/data/scraped-products.json");
const MADRID_MARKETPLACE_URLS = [
  "https://www.facebook.com/marketplace/madrid/search?query=gratis&minPrice=0&maxPrice=0",
  "https://www.facebook.com/marketplace/madrid/search?query=regalo&minPrice=0&maxPrice=0",
];

const paidSignals = [
  /\bvendo\b/i,
  /\bventa\b/i,
  /\bprecio\b/i,
  /\bcuesta\b/i,
  /\bvale\b/i,
  /\bpago\b/i,
  /\bbizum\b/i,
  /\btransferencia\b/i,
  /\bnegociable\b/i,
  /\brebajad[oa]\b/i,
  /\breservad[oa]\b/i,
  /\bno\s+gratis\b/i,
  /\bno\s+regalo\b/i,
  /\b[1-9]\d{0,4}(?:[,.]\d{1,2})?\s?(?:€|eur|euros?)\b/i,
];

const freeSignals = [
  /\bgratis\b/i,
  /\bregalo\b/i,
  /\bregal[ao]\b/i,
  /\bse\s+regala\b/i,
  /\b0\s?(?:€|eur|euros?)\b/i,
  /\bsin\s+coste\b/i,
];

const nonProductSignals = [
  /\bservicio\b/i,
  /\bclases\b/i,
  /\bcurso\b/i,
  /\bevento\b/i,
  /\brutas?\b/i,
  /\balquiler\b/i,
  /\binmobiliaria\b/i,
  /\bcomisi[oó]n\b/i,
  /\bapertura\b/i,
];

const highQualityTerms = [
  "sofá",
  "sofa",
  "cama",
  "colchón",
  "colchon",
  "armario",
  "mesa",
  "silla",
  "lavadora",
  "secadora",
  "nevera",
  "frigorífico",
  "frigorifico",
  "bicicleta",
  "bici",
  "mueble",
  "estantería",
  "estanteria",
  "televisión",
  "television",
  "ordenador",
  "herramienta",
  "máquina de coser",
  "maquina de coser",
  "lámpara",
  "lampara",
  "espejo",
  "vitrina",
  "sillón",
  "sillon",
];

const lowQualityTerms = [
  "pulsera",
  "anuncio",
  "publicidad",
  "pegatina",
  "flyer",
  "funda",
  "libro",
  "ropa bebé",
  "ropa bebe",
];

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function firstString(...values) {
  for (const value of values.flat(Infinity)) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function extractImage(item) {
  return firstString(
    item.image,
    item.imageUrl,
    item.primaryImage,
    item.thumbnail,
    item.picture,
    item.photo,
    item.photos?.[0],
    item.images?.[0],
    item.media?.[0]?.url,
  );
}

function extractUrl(item) {
  return firstString(item.url, item.href, item.link, item.listingUrl, item.marketplaceUrl, item.shareUrl);
}

function extractLocation(item) {
  const location = item.location;
  if (typeof location === "string") return normalizeText(location);
  return firstString(location?.name, location?.city, item.city, item.region, "Madrid");
}

function extractPriceText(item) {
  if (item.price === 0 || item.listingPrice === 0) return "0";
  return firstString(item.price, item.priceText, item.listingPrice, item.formattedPrice);
}

function isZeroPrice(priceText) {
  const value = normalizeText(priceText).toLowerCase();
  return !value || value === "0" || value === "0€" || value === "gratis" || value.includes("free");
}

function rejectReason({ title, description, priceText, image, sourceUrl }) {
  const titleText = normalizeText(title);
  const descriptionText = normalizeText(description);
  const combined = `${titleText} ${descriptionText}`;

  if (!titleText) return "missing-title";
  if (!sourceUrl) return "missing-source-url";
  if (!image) return "missing-image";
  if (!isZeroPrice(priceText)) return "non-zero-price";
  if (!freeSignals.some((signal) => signal.test(combined))) return "no-free-signal";
  if (paidSignals.some((signal) => signal.test(descriptionText))) return "paid-signal-in-description";
  if (nonProductSignals.some((signal) => signal.test(combined))) return "not-a-physical-product";
  return "";
}

function classifyQuality(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (lowQualityTerms.some((term) => text.includes(term))) return "low";
  if (highQualityTerms.some((term) => text.includes(term))) return "high";
  return "medium";
}

function classifyBadge(quality, title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (/\b(hoy|urgente|recoger|retirar|pronto|ya)\b/i.test(text)) {
    return { badge: "Recoger pronto", badgeType: "urgent" };
  }
  if (quality === "high") return { badge: "Buen hallazgo", badgeType: "hot" };
  return { badge: "Gratis real", badgeType: "available" };
}

function normalizeItem(item, index) {
  const title = normalizeText(firstString(item.title, item.name, item.marketplaceListingTitle, item.listingTitle));
  const description = normalizeText(firstString(item.description, item.text, item.details, item.body));
  const sourceUrl = extractUrl(item);
  const image = extractImage(item);
  const priceText = extractPriceText(item);
  const reason = rejectReason({ title, description, priceText, image, sourceUrl });

  if (reason) return { rejected: true, reason, title: title || "(sin título)" };

  const quality = classifyQuality(title, description);
  const { badge, badgeType } = classifyBadge(quality, title, description);

  return {
    rejected: false,
    product: {
      id: index + 1,
      title,
      image,
      location: extractLocation(item),
      timeAgo: normalizeText(firstString(item.timeAgo, item.relativeTime, item.postedAtText, "detectado ahora")),
      badge,
      badgeType,
      source: "facebook_marketplace_apify",
      sourceUrl,
      description,
      detectedAt: new Date().toISOString(),
      quality,
      isReal: true,
    },
  };
}

function uniqueProducts(products) {
  const seen = new Set();
  return products.filter((product) => {
    const key = product.sourceUrl || `${product.title}:${product.image}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function rankProducts(products) {
  const rank = { high: 0, medium: 1, low: 2 };
  return products
    .sort((a, b) => rank[a.quality] - rank[b.quality])
    .map((product, index) => ({ ...product, id: index + 1 }));
}

function buildPayload(rawItems) {
  const rejected = {};
  const normalized = rawItems.map(normalizeItem);
  const products = [];

  for (const item of normalized) {
    if (item.rejected) {
      rejected[item.reason] = (rejected[item.reason] || 0) + 1;
    } else {
      products.push(item.product);
    }
  }

  const approved = rankProducts(uniqueProducts(products));

  return {
    source: "facebook_marketplace_apify",
    sourceUrl: MADRID_MARKETPLACE_URLS.join(" | "),
    generatedAt: new Date().toISOString(),
    count: approved.length,
    rejected,
    products: approved,
  };
}

async function runApifyTask() {
  const token = process.env.APIFY_TOKEN;
  const taskId = process.env.APIFY_TASK_ID;
  if (!token || !taskId) {
    throw new Error("Missing APIFY_TOKEN or APIFY_TASK_ID. Configure a Facebook Marketplace Apify task first.");
  }

  const runResponse = await fetch(`https://api.apify.com/v2/actor-tasks/${encodeURIComponent(taskId)}/runs?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: process.env.APIFY_TASK_INPUT ? process.env.APIFY_TASK_INPUT : undefined,
  });

  if (!runResponse.ok) {
    throw new Error(`Apify task run failed: ${runResponse.status} ${await runResponse.text()}`);
  }

  const runPayload = await runResponse.json();
  let run = runPayload.data;

  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(run.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${run.id}?token=${token}`);
    if (!statusResponse.ok) {
      throw new Error(`Apify status failed: ${statusResponse.status} ${await statusResponse.text()}`);
    }
    run = (await statusResponse.json()).data;
  }

  if (run.status !== "SUCCEEDED") {
    throw new Error(`Apify run did not succeed. Status: ${run.status}`);
  }

  return fetchDataset(run.defaultDatasetId);
}

async function fetchDataset(datasetId) {
  const token = process.env.APIFY_TOKEN;
  const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json&token=${token || ""}`);
  if (!response.ok) {
    throw new Error(`Dataset fetch failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function readInput() {
  if (process.env.APIFY_INPUT_PATH) {
    return JSON.parse(await readFile(path.resolve(process.env.APIFY_INPUT_PATH), "utf8"));
  }
  if (process.env.APIFY_DATASET_ID) {
    return fetchDataset(process.env.APIFY_DATASET_ID);
  }
  return runApifyTask();
}

async function main() {
  const rawItems = await readInput();
  const payload = buildPayload(Array.isArray(rawItems) ? rawItems : rawItems.items || []);
  const outputPath = process.argv.includes("--apply") ? APP_FEED_PATH : OUTPUT_PATH;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Approved ${payload.count} real-free Marketplace products`);
  console.log(`Rejected: ${JSON.stringify(payload.rejected)}`);
  console.log(`Saved ${outputPath}`);
  for (const product of payload.products.slice(0, 12)) {
    console.log(`- [${product.quality}] ${product.title} (${product.location})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
