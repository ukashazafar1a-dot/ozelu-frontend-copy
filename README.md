# Ozelu storefront (portfolio copy)

Next.js 14 App Router customer website for a print + delivery shop. This public copy has **no live API keys, Stripe secrets, or env files**. Copy `.env.example` to `.env.local` and use your own values if you run it.

Do not point a public clone at a production API.

## Local run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Required for a working demo against **your** API:

- `NEXT_PUBLIC_API_URL` — backend origin (example: `http://localhost:5000`)
- `NEXT_PUBLIC_STRIPE_TEST_TOKEN` — Stripe **publishable** key (`pk_test_...` only)

Optional: Sentry, Google Analytics, Clarity, Search Console (see `.env.example`).

## Stack

Next.js 14, guest checkout (`session_id`), Stripe.js on the client, Cloudflare Pages deploy scripts in `package.json`.
