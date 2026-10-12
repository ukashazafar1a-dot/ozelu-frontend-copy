# Demo — Agent instructions (storefront)

You are working in **demo-storefront**: Next.js 14 App Router customer website (`localhost:3000`).

API + admin dashboard live in the **sibling repo** `demo-backend` (API `:5000`, admin `:3006`).

## Read first (in this order)

1. [`docs/CURSOR-INDEX.md`](docs/CURSOR-INDEX.md)
2. Sibling: `demo-backend/docs/PROJECT-OVERVIEW.md` (shared architecture)
3. [`docs/storefront-routes-and-ui.md`](docs/storefront-routes-and-ui.md)
4. For a new/existing print page: sibling `docs/GUIDE-service-page-flow.md` + this repo `docs/GUIDE-service-page-css.md`

## How to work

- Guest checkout only — no customer accounts. Identity is `session_id` cookie (`middleware.ts`).
- Typical print page: thin `src/app/<route>/page.tsx` + form in `src/app/<route>/_components/` or `src/screens/`.
- Prices/CMS come from `GET /api/assets` and page settings by **slug**.
- Pay flow: Formik → Stripe token → `POST /api/createOrder` → `POST /api/stripe/pay` with idempotency `pay-${order_id}`.
- `createOrder` **always persists** the order even if pay fails. Retrying the form creates a **new** order and can charge again.
- Do not change shared components (`SearchableSelect`, layout CSS) in a way that breaks other service pages.
- After UI work: verify in the browser end-to-end.

## Local run

```bash
npm run dev   # localhost:3000
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Where to change X

| Task | Path |
|------|------|
| Customer print form | `src/app/<service>/_components/*OrderForm.tsx` or `src/screens/` |
| Route / SEO metadata | `src/app/<service>/page.tsx` |
| Order type union | `src/libs/orderTypes.ts` |
| API base | `src/libs/utils.ts` (`NEXT_PUBLIC_API_URL`) |
| Cart / store checkout | `src/screens/Cart`, `src/screens/Checkout`, `src/app/cart`, `src/app/checkout` |
| City/Area dropdown overlay | `src/components/SearchableSelect.jsx` + `src/css/tables.css` |
| Track order | `src/app/track-order/[orderId]/page.tsx` |
