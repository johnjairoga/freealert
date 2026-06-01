const MARKETPLACE_URLS = [
  "https://www.facebook.com/marketplace/madrid/search?query=gratis&minPrice=0&maxPrice=0",
  "https://www.facebook.com/marketplace/madrid/search?query=regalo&minPrice=0&maxPrice=0",
];

const CACHE_KEY = "marketplace:madrid:latest";
const LAST_RUN_KEY = "apify:last-run-id";
const DEFAULT_ACTOR_ID = "apify/facebook-marketplace-scraper";

const paidSignals = [
  /\benv[ií]o\s+gratis\b/i,
  /\bfree\s+shipping\b/i,
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
  /\bcursos\b/i,
  /\bf[oó]rmate\b/i,
  /\bformaci[oó]n\b/i,
  /\bonline\b/i,
  /\bbig\s+data\b/i,
  /\biot\b/i,
  /\bmary\s+kay\b/i,
  /\blimpieza\s+facial\b/i,
  /\bdesayuno\b/i,
  /\bpersonalizad[oa]s?\b/i,
  /\bflores?\s+amarillas?\b/i,
  /\bdetalles?\b/i,
  /\bgraduaci[oó]n\b/i,
  /\bgarduacion\b/i,
  /\bd[ií]a\s+de\s+la\s+madre\b/i,
  /\bd[ií]a\s+del\s+padre\b/i,
  /\bsan\s+valent[ií]n\b/i,
  /\bbares?\b/i,
  /\brestaurantes?\b/i,
  /\bemplead[oa]s?\b/i,
  /\brecojo\b/i,
  /\bchatarra\b/i,
  /\bapp\s+de\s+citas\b/i,
  /\bbeta\s+madrid\b/i,
  /\bmodelo\s+corte\b/i,
  /\bcorte\s+gratis\b/i,
  /\bmundial\s+gratis\b/i,
  /\bera\s+gratis\b/i,
  /\bpatitos?\b/i,
  /\bcorydoras?\b/i,
  /\bcomida\s+perro\b/i,
  /\bpienso\b/i,
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
    item.primary_listing_photo?.photo_image_url,
  );
}

function extractUrl(item) {
  return firstString(item.url, item.href, item.link, item.listingUrl, item.marketplaceUrl, item.shareUrl);
}

function extractLocation(item) {
  const location = item.location;
  if (typeof location === "string") return normalizeText(location);
  return firstString(location?.name, location?.city, location?.reverse_geocode?.city_page?.display_name, location?.reverse_geocode?.city, item.city, item.region, "Madrid");
}

function extractPriceText(item) {
  if (item.price === 0 || item.listingPrice === 0) return "0";
  return firstString(
    item.price,
    item.priceText,
    item.listingPrice,
    item.formattedPrice,
    item.listing_price?.formatted_amount,
    item.listing_price?.amount,
    item.listing_price?.amount_with_offset_in_currency,
  );
}

function isMadridRegion(item) {
  const state = item.location?.reverse_geocode?.state;
  if (state) return state === "MD";

  const location = extractLocation(item).toLowerCase();
  return /\bmadrid\b/.test(location);
}

function isWeakFreeTitle(title) {
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return ["gratis", "regalo", "se regala", "100 gratis"].includes(normalized);
}

function isZeroPrice(priceText) {
  const value = normalizeText(priceText).toLowerCase();
  return !value || value === "0" || value === "0.00" || value === "$0" || value === "€0" || value === "0€" || value === "gratis" || value.includes("free");
}

function rejectReason({ title, description, priceText, image, sourceUrl }) {
  const titleText = normalizeText(title);
  const descriptionText = normalizeText(description);
  const combined = `${titleText} ${descriptionText}`;

  if (!titleText) return "missing-title";
  if (!sourceUrl) return "missing-source-url";
  if (!image) return "missing-image";
  if (isWeakFreeTitle(titleText)) return "weak-free-title";
  if (!isZeroPrice(priceText)) return "non-zero-price";
  if (!freeSignals.some((signal) => signal.test(combined))) return "no-free-signal";
  if (paidSignals.some((signal) => signal.test(titleText))) return "paid-signal-in-title";
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
  if (item.is_hidden || item.is_sold || item.is_pending || item.is_live === false) {
    return { rejected: true, reason: "inactive-listing" };
  }
  if (!isMadridRegion(item)) {
    return { rejected: true, reason: "outside-madrid" };
  }

  const title = normalizeText(firstString(item.title, item.name, item.marketplaceListingTitle, item.marketplace_listing_title, item.listingTitle));
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

function actorPathId(actorId) {
  return actorId.replace("/", "~");
}

function apifyInput(env) {
  if (env.APIFY_INPUT) return JSON.parse(env.APIFY_INPUT);
  if (env.APIFY_TASK_INPUT) return JSON.parse(env.APIFY_TASK_INPUT);
  return {
    startUrls: MARKETPLACE_URLS.map((url) => ({ url })),
    maxItems: Number(env.APIFY_MAX_ITEMS || 80),
  };
}

async function startApifyRun(env) {
  const path = env.APIFY_TASK_ID
    ? `actor-tasks/${encodeURIComponent(env.APIFY_TASK_ID)}/runs`
    : `acts/${encodeURIComponent(actorPathId(env.APIFY_ACTOR_ID || DEFAULT_ACTOR_ID))}/runs`;
  const payload = await apifyRequest(path, env, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apifyInput(env)),
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
  if (!env.APIFY_TOKEN) {
    throw new Error("Missing APIFY_TOKEN");
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
