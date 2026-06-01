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

Then run the actor directly:

```bash
APIFY_TOKEN=... APIFY_ACTOR_ID=apify/facebook-marketplace-scraper npm run scrape:marketplace
```

You can also use a saved Apify task:

```bash
APIFY_TOKEN=... APIFY_TASK_ID=... npm run scrape:marketplace
```

This writes `src/data/marketplace-products.json`. Add `-- --apply` to replace the app feed in `src/data/scraped-products.json`. Override the actor input with `APIFY_INPUT='{"startUrls":[{"url":"..."}],"maxItems":80}'`.

The Marketplace filter rejects listings when the title says free but the description contains paid signals like price, sale, payment, Bizum, transfer, negotiable, or reservation language.

## Stripe post-payment flow

Stripe Payment Links must redirect successful payments to:

```txt
https://<your-domain>/gracias
```

Before sending the user to Stripe, the app asks for an email and stores the selected product in `localStorage`. The Stripe Payment Link receives:

- `prefilled_email`
- `client_reference_id`

The `/gracias` page uses the local intent to show the product, the original listing URL, the email associated with the access, and the next action to claim it.

The Worker also exposes a Stripe webhook endpoint:

```txt
https://<worker-domain>/api/stripe/webhook
```

Configure this endpoint in Stripe for the `checkout.session.completed` event. The Worker verifies the Stripe signature and stores the paid entitlement in Workers KV by email and `client_reference_id`.

Required Worker secret:

```bash
wrangler secret put STRIPE_WEBHOOK_SECRET --config workers/marketplace-radar/wrangler.toml
```

Optional app env for `/gracias` payment confirmation:

```bash
NEXT_PUBLIC_PILLALO_RADAR_API_URL=https://<worker-domain>
```

This avoids adding Supabase or another database for launch. A later hardened version can add customer login and email retention.

## Cloudflare Worker radar

The production radar lives in `workers/marketplace-radar`. It:

- runs every 20 minutes with a Cron Trigger,
- launches the configured Apify task,
- ingests the previous finished run,
- filters real-free products,
- stores the latest approved feed in Workers KV,
- exposes `GET /api/products`,
- stores last status/error/payment in KV,
- can send failure alerts to a generic webhook.

Required secrets/config:

```bash
wrangler kv namespace create PRODUCT_CACHE
wrangler secret put APIFY_TOKEN --config workers/marketplace-radar/wrangler.toml
wrangler secret put WORKER_SECRET --config workers/marketplace-radar/wrangler.toml
wrangler secret put ALERT_WEBHOOK_URL --config workers/marketplace-radar/wrangler.toml
```

Optional:

```bash
wrangler secret put APIFY_TASK_ID --config workers/marketplace-radar/wrangler.toml
wrangler secret put APIFY_ACTOR_ID --config workers/marketplace-radar/wrangler.toml
wrangler secret put APIFY_INPUT --config workers/marketplace-radar/wrangler.toml
```

When no `APIFY_TASK_ID` is set, the Worker runs `apify/facebook-marketplace-scraper` directly.

Status endpoint:

```txt
GET https://<worker-domain>/api/status?secret=<WORKER_SECRET>
```

Alerts fire when:

- the cron refresh throws,
- manual refresh fails,
- Stripe webhook processing fails,
- Marketplace returns 0 approved products.

`ALERT_WEBHOOK_URL` can point to Slack, Discord, Make, Zapier, or any endpoint that accepts JSON.

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
