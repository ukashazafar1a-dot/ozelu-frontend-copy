# Storefront — routes, UI, and customer flow

Repo: `demo-storefront`  
Dev: `http://localhost:3000`  
Stack: Next.js 14 App Router, React 18, TypeScript, Sass. Many routes `runtime = 'edge'` (Cloudflare Pages).

Guest checkout. Session: `session_id` cookie in `src/middleware.ts`. Cart: `react-use-cart`. Bootstrap: `GET /api/assets` — failure shows site-wide maintenance.

## Page pattern

- Thin route: `src/app/<path>/page.tsx` (metadata + fetch)
- UI: `src/app/<path>/_components/` **or** `src/screens/<Name>/`
- Prices/CMS: `getData(slug)` → `/api/assets/page/settings/${slug}`. **URL ≠ slug** (e.g. route `/photos-printing-delivery` uses slug `photo-print`; `/business-cards-printing` uses `business-cards`; `/collections` uses `collectionspage`). Two helpers exist (`src/helpers/generals.js` vs `src/helpers/getData.js`) with different cache (`revalidate` vs `no-store`) — keep the import the page already uses.

CSS: [GUIDE-service-page-css.md](./GUIDE-service-page-css.md). End-to-end service plumbing: sibling `demo-backend/docs/GUIDE-service-page-flow.md`.

## Customer routes

| URL | What customers do |
|-----|-------------------|
| `/` | Home |
| `/photos-printing-delivery` | Photo prints + delivery form |
| `/passport-size-photos` | Passport photos |
| `/documents-printing` | Document printing |
| `/foam-board-panels-printing` | Foam boards |
| `/stickers-printing` | Stickers |
| `/certificates-printing` | Certificates |
| `/canvas-printing` | Canvas |
| `/business-cards-printing` | Business cards |
| `/flyers-printing` | Flyers (size × type × qty, single/double side) |
| `/greeting-cards-printing` | Greeting cards |
| `/mugs-printing` | Mugs (type + image + qty tiers) |
| `/t-shirts-printing` | T-shirts (print type, shirt type, placements, volume) |
| `/menu-printing` | Menus (type, size, qty, finishing surcharges) |
| `/brochures-printing` | Brochures (type, size/pages, qty) |
| `/cv-templates` | CV template shop |
| `/editing-service/photo-retouching` | Retouching |
| `/editing-service/logo-designing` | Logo |
| `/editing-service/caricatures` | Caricatures |
| `/photography-service/*` | Wedding / product / event / portrait / food — reservations |
| `/collections`, `/collections/[slug]` | Store collections |
| `/products/[slug]` | Store product |
| `/cart` | Legacy/static demo — **not** the live `react-use-cart` cart |
| `/checkout` | Real store checkout (cart + Stripe) |
| `/blog`, `/blog/[handle]/[slug]` | Blog (`/blog/[handle]` redirects to `/blog`) |
| `/policies/[slug]` | Policy pages |
| `/passport-photo-requirements`, `/passport-photo-requirements/[slug]` | Spec pages |
| `/feedback` | Feedback form |
| `/track-order/[orderId]` | Public order tracking |

## Order form file map

Newer print pages: `src/app/<route>/_components/*OrderForm.tsx`. Older: `src/screens/`.

| Storefront | Form | FormData `order_type` |
|------------|------|------------------------|
| `/passport-size-photos` | `src/screens/PassportSizePhotos/OrderForm/OrderForm.tsx` | `passport_photo` |
| `/photos-printing-delivery` | `src/screens/PhotosPrintingDelivery/PhotoPrintingForm/PhotoPrintingForm.tsx` | `photo_print` |
| `/documents-printing` | `src/screens/DocumentPrinting/DcumentPrintingForm/DacumentPrintingForm.tsx` | `document_print` |
| `/canvas-printing` | `src/app/canvas-printing/_components/CanvasOrderForm.tsx` | `canvas_print` |
| `/foam-board-panels-printing` | `src/app/foam-board-panels-printing/_components/FbpOrderForm.tsx` | `foam_board` |
| `/stickers-printing` | `src/app/stickers-printing/_components/SppOrderForm.tsx` | `sticker_print` |
| `/certificates-printing` | `src/app/certificates-printing/_components/CppOrderForm.tsx` | `certificate_print` |
| `/business-cards-printing` | `src/app/business-cards-printing/_components/BcardsOrderForm.tsx` | `business_card` |
| `/flyers-printing` | `src/app/flyers-printing/_components/FlyersOrderForm.tsx` | `flyer_print` |
| `/greeting-cards-printing` | `src/app/greeting-cards-printing/_components/GreetingCardsOrderForm.tsx` | `greeting_card_print` |
| `/mugs-printing` | `src/app/mugs-printing/_components/MugsOrderForm.tsx` | `mug_print` |
| `/t-shirts-printing` | `src/app/t-shirts-printing/_components/TShirtsOrderForm.tsx` | `t_shirt_print` |
| `/menu-printing` | `src/app/menu-printing/_components/MenuOrderForm.tsx` | `menu_print` |
| `/brochures-printing` | `src/app/brochures-printing/_components/BrochuresOrderForm.tsx` | `brochure_print` |
| `/checkout` | `src/screens/Checkout/CheckoutForm.jsx` | `store_product` |
| `/editing-service/photo-retouching` | `src/screens/EditingServices/PhotoRetouching/RetouchingForm.tsx` | `POST /api/stripe/retouching-pay` (single step) |
| `/cv-templates` | `CVpurchaseForm.jsx` / `CheckoutModal.jsx` | template order |
| photography | `src/screens/PhotographyServices/ReservationForm/AppReservationForm.tsx` | `POST /reservation` (not Stripe print pay) |
| `/track-order/[orderId]` | `TrackOrderClient.tsx` | `GET /api/orders/public/track/:orderId` |

## Typical print-form UI

1. Marketing sections from Customize (hero, types, benefits, FAQs)
2. Size/price chart from Settings
3. **Order form**: product options, file upload (signed S3 temp), customer (name, phone, City/Area `SearchableSelect`, address), totals, Stripe card
4. Submit → createOrder → stripe/pay → thank-you / GTM purchase event

Disabled **Sales Status** on the matching settings slug turns the storefront page into a non-orderable / disabled state (`GUIDE-service-page-flow.md` §25).

### Menu / brochures specifics

- Menu: finishing surcharges; City/Area dropdowns must sit **above** Menu Type/Size (`tables.css` z-index + optional `menuPortalTarget` on `SearchableSelect`)
- Brochures: storefront finishing UI; admin CSV 4 columns; seed-heal must **not** resurrect deleted types on existing docs

### T-shirts / mugs

- T-shirts: volume price grid + catalog (colors/sizes) + extra placement fees from the 2nd placement
- Mugs: type image cell (`MugPriceImageCell`)

## Payments (customer)

Stripe **Tokens** (`createToken`), not Checkout Sessions. Then:

1. `POST /api/createOrder` — order exists even if pay fails  
2. `POST /api/stripe/pay` — `idempotencyKey = pay-${order_id}`

Retrying the **whole form** = new order + possible second charge. See sibling `docs/how-to-change-safely.md`.

**Exceptions:** photo retouching uses `POST /api/stripe/retouching-pay` only; photography bookings use `POST /reservation`.

Live store cart is `react-use-cart` + mini-cart (`src/components/EComereceStore/MiniCart.jsx`). The `/cart` page is not that cart.

## Shared UI pitfalls

- Historical typos in component names (`EComerece`, `DcumentPrinting`) — search both
- `SearchableSelect`: `menuPortalTarget` is **optional**. Do not make it required (breaks other forms / `tsc`)
- City/Area lists vs later sibling grids: z-index stacking, not “broken react-select”
