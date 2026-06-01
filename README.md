# Píllalo

Radar de productos gratis reales cerca de Madrid.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Product feeds

The app reads products in this order:

1. `src/data/marketplace-products.json` when Apify/Facebook Marketplace products are available.
2. `src/data/scraped-products.json` from Nolotiro.
3. Local fallback products.

### Nolotiro scrape

```bash
npm run scrape:nolotiro
```

### Marketplace validation through Apify

Create an Apify task for Facebook Marketplace with Madrid search URLs:

```txt
https://www.facebook.com/marketplace/madrid/search?query=gratis&minPrice=0&maxPrice=0
https://www.facebook.com/marketplace/madrid/search?query=regalo&minPrice=0&maxPrice=0
```

Then run:

```bash
APIFY_TOKEN=... APIFY_TASK_ID=... npm run scrape:marketplace
```

This writes `src/data/marketplace-products.json`. Add `-- --apply` to replace the app feed in `src/data/scraped-products.json`.

The Marketplace filter rejects listings when the title says free but the description contains paid signals like price, sale, payment, Bizum, transfer, negotiable, or reservation language.

## Cloudflare Worker radar

The production radar lives in `workers/marketplace-radar`. It:

- runs every 20 minutes with a Cron Trigger,
- launches the configured Apify task,
- ingests the previous finished run,
- filters real-free products,
- stores the latest approved feed in Workers KV,
- exposes `GET /api/products`.

Required secrets/config:

```bash
wrangler kv namespace create PRODUCT_CACHE
wrangler secret put APIFY_TOKEN --config workers/marketplace-radar/wrangler.toml
wrangler secret put APIFY_TASK_ID --config workers/marketplace-radar/wrangler.toml
wrangler secret put WORKER_SECRET --config workers/marketplace-radar/wrangler.toml
```

Local Worker:

```bash
npm run worker:dev
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
