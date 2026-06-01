import * as cheerio from "cheerio";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL = "https://nolotiro.org/es/ad/listall/ad_type/give";
const BASE_URL = "https://nolotiro.org";
const OUTPUT_PATH = path.join(process.cwd(), "src/data/scraped-products.json");

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
];

const lowQualityTerms = [
  "libro",
  "funda",
  "huevera",
  "pienso",
  "hueso",
  "chancla",
  "pulsera",
  "cama de perro",
  "recoge migas",
  "porta cafés",
  "porta cafes",
  "juguete de perro",
  "batidor",
];

const urgencyTerms = ["urge", "urgente", "hoy", "mañana", "recoger", "retirar", "ya"];

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function absoluteUrl(value) {
  if (!value) return "";
  return value.startsWith("http") ? value : new URL(value, BASE_URL).toString();
}

function classifyQuality(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (lowQualityTerms.some((term) => text.includes(term))) return "low";
  if (highQualityTerms.some((term) => text.includes(term))) return "high";
  return "medium";
}

function classifyBadge(quality, title, description, timeAgo) {
  const text = `${title} ${description}`.toLowerCase();
  if (urgencyTerms.some((term) => text.includes(term))) {
    return { badge: "Recoger pronto", badgeType: "urgent" };
  }
  if (quality === "high") {
    return { badge: "Buen hallazgo", badgeType: "hot" };
  }
  if (/minuto|minutos/.test(timeAgo)) {
    return { badge: "Nuevo", badgeType: "new" };
  }
  return { badge: "Disponible ahora", badgeType: "available" };
}

async function fetchHtml() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "User-Agent": "PillaloBot/0.1 (+https://pillalo.app)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Nolotiro responded ${response.status}`);
  }

  return response.text();
}

function parseProducts(html) {
  const $ = cheerio.load(html);
  const products = [];
  const seen = new Set();

  $("li.ad_excerpt").each((_, element) => {
    const row = $(element);
    const link = row.find("a.aod_content").first();
    const sourceUrl = absoluteUrl(link.attr("href") || "");
    if (!sourceUrl || seen.has(sourceUrl)) return;

    const title = normalizeText(row.find("h4").first().clone().children().remove().end().text());
    const location = normalizeText(row.find(".ad_excerpt_woeid").first().text());
    const description = normalizeText(row.find(".body-wrapper").first().text());
    const image = absoluteUrl(row.find("img").first().attr("src") || "");
    const time = row.find("time").first();
    const detectedAt = time.attr("datetime") || "";
    const timeAgo = normalizeText(time.text()) || "reciente";

    if (!title || !location.toLowerCase().includes("madrid")) return;

    const quality = classifyQuality(title, description);
    const { badge, badgeType } = classifyBadge(quality, title, description, timeAgo);

    seen.add(sourceUrl);
    products.push({
      id: products.length + 1,
      title,
      image,
      location: location.replace(", Comunidad de Madrid, España", ""),
      timeAgo,
      badge,
      badgeType,
      source: "nolotiro",
      sourceUrl,
      description,
      detectedAt,
      quality,
      isReal: true,
    });
  });

  return products
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.quality] - rank[b.quality];
    })
    .map((product, index) => ({ ...product, id: index + 1 }));
}

async function main() {
  const html = await fetchHtml();
  const products = parseProducts(html);
  const payload = {
    source: "nolotiro",
    sourceUrl: SOURCE_URL,
    generatedAt: new Date().toISOString(),
    count: products.length,
    products,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Saved ${products.length} Madrid products to ${OUTPUT_PATH}`);
  for (const product of products.slice(0, 8)) {
    console.log(`- [${product.quality}] ${product.title} (${product.timeAgo})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
