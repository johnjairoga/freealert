const MARKETPLACE_URLS = [
  "https://www.facebook.com/marketplace/madrid/search?query=gratis&minPrice=0&maxPrice=0",
  "https://www.facebook.com/marketplace/madrid/search?query=regalo&minPrice=0&maxPrice=0",
];

const CACHE_KEY = "marketplace:madrid:latest";
const LAST_RUN_KEY = "apify:last-run-id";

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

const lowQualityTerms = ["pulsera", "anuncio", "publicidad", "pegatina", "flyer", "funda", "libro"];

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60",
    },
  });
}

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

  if (reason) return { rejected: true, reason };

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

function buildPayload(rawItems) {
  const rejected = {};
  const seen = new Set();
  const products = [];

  rawItems.map(normalizeItem).forEach((item) => {
    if (item.rejected) {
      rejected[item.reason] = (rejected[item.reason] || 0) + 1;
      return;
    }

    const key = item.product.sourceUrl || `${item.product.title}:${item.product.image}`;
    if (seen.has(key)) return;
    seen.add(key);
    products.push(item.product);
  });

  const rank = { high: 0, medium: 1, low: 2 };
  products.sort((a, b) => rank[a.quality] - rank[b.quality]);

  return {
    source: "facebook_marketplace_apify",
    sourceUrl: MARKETPLACE_URLS.join(" | "),
    generatedAt: new Date().toISOString(),
    count: products.length,
    rejected,
    products: products.map((product, index) => ({ ...product, id: index + 1 })),
  };
}

async function apifyRequest(path, env, init) {
  const response = await fetch(`https://api.apify.com/v2/${path}${path.includes("?") ? "&" : "?"}token=${env.APIFY_TOKEN}`, init);
  if (!response.ok) {
    throw new Error(`Apify ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function startApifyRun(env) {
  const body = env.APIFY_TASK_INPUT || undefined;
  const payload = await apifyRequest(`actor-tasks/${encodeURIComponent(env.APIFY_TASK_ID)}/runs`, env, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body,
  });
  await env.PRODUCT_CACHE.put(LAST_RUN_KEY, payload.data.id);
  return payload.data;
}

async function ingestFinishedRun(env) {
  const runId = await env.PRODUCT_CACHE.get(LAST_RUN_KEY);
  if (!runId) return { status: "no-run" };

  const run = (await apifyRequest(`actor-runs/${runId}`, env)).data;
  if (run.status !== "SUCCEEDED") return { status: run.status };

  const rawItems = await apifyRequest(`datasets/${run.defaultDatasetId}/items?clean=true&format=json`, env);
  const payload = buildPayload(Array.isArray(rawItems) ? rawItems : []);
  await env.PRODUCT_CACHE.put(CACHE_KEY, JSON.stringify(payload));
  await env.PRODUCT_CACHE.delete(LAST_RUN_KEY);

  return { status: "ingested", count: payload.count, rejected: payload.rejected };
}

async function refresh(env) {
  if (!env.APIFY_TOKEN || !env.APIFY_TASK_ID) {
    throw new Error("Missing APIFY_TOKEN or APIFY_TASK_ID");
  }

  const previousRun = await ingestFinishedRun(env);
  if (["READY", "RUNNING"].includes(previousRun.status)) {
    return { previousRun, nextRun: null };
  }

  const nextRun = await startApifyRun(env);
  return { previousRun, nextRun: { id: nextRun.id, status: nextRun.status } };
}

const worker = {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(refresh(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "pillalo-marketplace-radar" });
    }

    if (url.pathname === "/api/refresh") {
      if (url.searchParams.get("secret") !== env.WORKER_SECRET) return json({ error: "Unauthorized" }, 401);
      return json(await refresh(env));
    }

    if (url.pathname === "/api/products") {
      const cached = await env.PRODUCT_CACHE.get(CACHE_KEY);
      if (!cached) return json({ source: "facebook_marketplace_apify", count: 0, products: [] });
      return new Response(cached, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60",
        },
      });
    }

    return json({ error: "Not found" }, 404);
  },
};

export default worker;
