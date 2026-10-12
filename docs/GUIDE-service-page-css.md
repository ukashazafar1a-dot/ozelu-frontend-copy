# Service Page CSS — Standard Implementation Guide

> **Read this before adding CSS to a new storefront service page** (Mugs Printing, Greeting Cards, Flyers, etc.).
>
> **Pair with:** `demo-backend/docs/GUIDE-service-page-flow.md` (§0, §28 — section copy map + full build).
>
> **Your workflow:** Tell AI *"Hero = Greeting Cards, Types = Business Cards, Benefits = Mugs, Chart = Mugs"* → AI must apply **[§22](#22-section-css-lookup--same-as-page)** exactly — same JSX, same props, same Layer 3 CSS blocks (renamed to your slug). **Do not invent spacing.**

---

## Table of contents

1. [Goal](#1-goal)
2. [CSS architecture (3 layers)](#2-css-architecture-3-layers)
3. [Standard page wrapper](#3-standard-page-wrapper)
4. [Section catalog (summary)](#4-section-catalog-summary)
5. [Recommended page skeleton](#5-recommended-page-skeleton)
6. [Checklist: new service page CSS](#6-checklist-new-service-page-css)
7. [What belongs in page-specific CSS](#7-what-belongs-in-page-specific-css)
8. [Known duplication — do not copy again](#8-known-duplication--do-not-copy-again)
9. [Legacy pages](#9-legacy-pages)
10. [Component modifiers](#10-component-modifiers)
11. [File reference](#11-file-reference)
12. [Future refactor](#12-future-refactor)
13. [Design tokens & typography](#13-design-tokens--typography)
14. [Section specifications (exact CSS)](#14-section-specifications-exact-css)
15. [Page registry — sections per page](#15-page-registry--sections-per-page)
16. [`foam-board-page` wrapper side effects](#16-foam-board-page-wrapper-side-effects)
17. [New page recipe (step-by-step)](#17-new-page-recipe-step-by-step)
18. [Known inconsistencies & pitfalls](#18-known-inconsistencies--pitfalls)
19. [Debugging spacing issues](#19-debugging-spacing-issues)
20. [Section recipes — copy-paste for new pages](#20-section-recipes--copy-paste-for-new-pages)
21. [Shared CSS classes reference](#21-shared-css-classes-reference-layer-2)
22. [Section CSS lookup — "same as {Page}"](#22-section-css-lookup--same-as-page) — **AI: use this when user specifies section sources**
23. [AI CSS rules for mixed pages](#23-ai-css-rules-for-mixed-pages)

---

## 1. Goal

Service pages share the same **marketing sections**. Their markup comes from shared React components; **CSS must also be shared**.

When you create a new page:

1. **Specify which sections** come from which reference page (see **[§22](#22-section-css-lookup--same-as-page)**).
2. Copy **exact JSX + props** from that page's `*Page.tsx`.
3. Copy **Layer 3 CSS blocks** from that page's wrapper in `tables.css` → rename to `.{your-slug}-printing-page`.
4. Use **`foam-board-page {your-slug}-printing-page`** on the root unless the reference page differs (§22.0).
5. **Never** invent new spacing or duplicate Layer 2 rules under a page class.
6. **Types section:** use the correct spacing **tier** (§14.4) — default is **Tier A** (Business Cards / Mugs). Do not add page-specific types spacing CSS.

---

## 2. CSS architecture (3 layers)

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1 — Global                                           │
│  src/app/globals.css                                        │
│  Headings, cover photo (.tc-flex), FAQ, .photoSize,         │
│  .rich-text-section, .content                               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 2 — Shared service sections                          │
│  src/css/tables.css  +  src/css/forms.css                   │
│  Types grid, .service-page-width, delivery tables,          │
│  .image-with-text--section, order form shells               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 3 — Page wrapper ONLY when Layer 1–2 is not enough   │
│  src/css/tables.css → .{slug}-printing-page { … }           │
└─────────────────────────────────────────────────────────────┘
```

**Import chain:** `globals.css` imports `tables.css` and `forms.css` — no extra import on new pages.

---

## 3. Standard page wrapper

### Use today (App Router printing pages)

```tsx
<div className="foam-board-page {slug}-printing-page">
  {/* sections in fixed order — see §5 */}
</div>
```

| Page | Wrapper classes |
|------|-----------------|
| Greeting Cards | `foam-board-page greeting-cards-printing-page` |
| Mugs Printing | `foam-board-page mugs-printing-page` |
| Foam Board Panels | `foam-board-page foam-board-printing-page` |
| Business Cards, Canvas, Certificates, Stickers | `foam-board-page` only |
| Flyers | `flyers-printing-page` (**no** `foam-board-page`) |

`foam-board-page` is a **shared layout shell** — it changes benefits spacing and types→benefits gaps. See [§16](#16-foam-board-page-wrapper-side-effects).

The second class (`mugs-printing-page`, etc.) is for **page-only overrides** in Layer 3.

---

## 4. Section catalog (summary)

| § | Section | Component | Customize type |
|---|---------|-----------|----------------|
| [14.1](#141-cover-photo--threecolumns-canonical) | Cover photo (3 steps) | `ThreeColumns` | `coverPhoto` |
| [14.2](#142-hero-banner--imagewithtext) | Hero banner | `@/components/ImageWithText` | `heroBanner` |
| [14.3](#143-promotion-bar) | Promotion bar | `PromotionBar` | `richtext` |
| [14.4](#144-types-section) | Types cards | `TypesSection` | `types`, `businesstypes`, … |
| [14.5](#145-benefits-section) | Benefits | `BenefitsSection` | `benefits` |
| [14.6](#146-size-chart) | Size chart shell | `SizeChartSection` + chart | `sizechart` |
| [14.7](#147-order-form) | Order form | `{Page}OrderForm` | Settings & SEO |
| [14.8](#148-featured-collection) | Featured collection | `FeaturedCollection` / page variant | `collection` / `framesCollection` |
| [14.9](#149-delivery-schedule) | Delivery | `DeliverySchedule` | `delivery` |
| [14.10](#1410-faqs) | FAQs | `FaqsSection` | `faqSection` |

Full CSS values: [§14](#14-section-specifications-exact-css).

---

## 5. Recommended page skeleton

**Copy from:** `src/app/greeting-cards-printing/_components/GreetingCardsPrintingPage.tsx`

```tsx
<div className="foam-board-page example-printing-page">
  {sections?.coverPhoto && (
    <ThreeColumns section={sections.coverPhoto} useH1ForTitle />
  )}
  {sections?.richtext && <PromotionBar section={sections.richtext} />}
  {sections?.types && <TypesSection section={sections.types} />}
  {sections?.benefits && <BenefitsSection section={sections.benefits} />}
  {data?.example_prices?.length > 0 && sections?.sizechart && (
    <SizeChartSection section={sections.sizechart}>
      <ExampleChart data={data} />
    </SizeChartSection>
  )}
  <div id="printing-form">
    <ExampleOrderForm data={data} areas={areas} />
  </div>
  {sections?.delivery && (
    <DeliverySchedule section={sections.delivery} tableClass=" mb-4 " />
  )}
  {sections?.faqs && <FaqsSection section={sections.faqs} />}
</div>
```

**Hero choice:**

| Layout | Component | Customize section |
|--------|-----------|---------------------|
| 3 steps + CTA (Photos Printing style) | `ThreeColumns` | `coverPhoto` |
| Image + text side-by-side | `ImageWithText` | `heroBanner` |

---

## 6. Checklist: new service page CSS

### Step A — Zero new CSS first

1. Clone Greeting Cards or Mugs page component.
2. Set wrapper: `foam-board-page your-slug-printing-page`.
3. Wire sections from [§15](#15-page-registry--sections-per-page).
4. Load page — most sections should match from Layers 1–2.

### Step B — Add Layer 3 only for gaps

In `src/css/tables.css`:

```css
/* ── Your Slug Printing ({slug}) ─────────────────────────── */

.your-slug-printing-page .your-slug-chart-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

### Step C — Verify

| Section | OK without page CSS? | If not… |
|---------|----------------------|---------|
| ThreeColumns | Usually yes | `sectionClassName` + scoped tweak only |
| PromotionBar | Yes | — |
| TypesSection | Grid yes; spacing from shared tier (§14.4) | **Never** add `.{slug}-printing-page` types spacing — pick tier A/B/C only |
| BenefitsSection | Yes if `foam-board-page` | §16 — or override like Mugs |
| SizeChart | Table yes; scroll wrapper often needed | `.{slug}-chart-wrapper` |
| Order form | Yes (`forms.css`) | Upload spacing under page wrapper |
| DeliverySchedule | Yes | — |
| FaqsSection | Yes | — |

### Step D — Do not

- Edit `globals.css` for one page.
- Add inline `<style>` in page components (Flyers does — do not copy).
- Copy types alignment CSS to a third page wrapper — use shared tiers (§14.4).
- Add `aspect-ratio: 1/1` or `min-height: calc(...)` on types card images/titles (§14.4 anti-patterns).
- Use `compactHeadingSpacing` on TypesSection (deprecated).

---

## 7. What belongs in page-specific CSS

### ✅ Layer 3 (page wrapper)

| Use case | Example class |
|----------|---------------|
| Price chart horizontal scroll | `.mugs-printing-chart-wrapper` |
| Form upload slot spacing | `.mugs-upload-slots` |
| Type picker in form | `.type-cards-flex` (Mugs) |
| Cover photo width tweak | `.mugs-cover-photo-section .inside-main` |
| Reset benefits spacing | `.mugs-printing-page .benefits-section` |
| Mobile section heading margins | `h1.heading-h2` at 768px |

### ❌ Must stay shared

| Use case | File |
|----------|------|
| Types card grid | `tables.css` `.types-cards-flex` |
| Types description alignment | Shared modifier `.types-section--align-descriptions` |
| FAQ accordion | `globals.css` |
| Cover photo flex layout | `globals.css` `.tc-flex` |
| Order form fields | `forms.css` |
| Section headings base | `globals.css` `.heading-h2` |

---

## 8. Known duplication — do not copy again

| Duplicated rules | Current locations | Target |
|------------------|-------------------|--------|
| Types description alignment | `.greeting-cards-printing-page`, `.mugs-printing-page`, `.foam-board-printing-page` | `.types-section--align-descriptions` |
| Types → benefits spacing | `.foam-board-page`, `.foam-board-printing-page` | Single `.service-page` module |
| ThreeColumns | 3 files under `screens/` | One canonical file |
| Legacy FAQ | `screens/*/Faqs.tsx` ×3 | `FaqsSection` only |
| Flyers hero CSS | Inline `<style>` in page | `tables.css` under `.flyers-printing-page` |

---

## 9. Legacy pages

| Page | Wrapper | Local CSS | Migrate to |
|------|---------|-----------|------------|
| Photos Printing | `printing-delivery--wrapper` | `index.css` | App Router + `foam-board-page` |
| Documents Printing | `wrapper-dacument-container` | form CSS | App Router pattern |
| Passport Size Photos | `passport_page_template` | `styles.css` | App Router pattern |

**New pages:** App Router + shared components + Layer 3 block in `tables.css` only.

---

## 10. Component modifiers

| Prop | Component | CSS class | Purpose |
|------|-----------|-----------|---------|
| `fitImageCards` | `TypesSection` | `.types-section--fit-image` | Image-width cards — **must pass prop** |
| `alignDescriptions` | `TypesSection` | `.types-section--align-descriptions` | **Default `true`** — same desktop + mobile card spacing |
| `useH1ForTitle` | `ThreeColumns` | (semantic) | SEO H1 for page title |
| `sectionClassName` | `ThreeColumns` | e.g. `.mugs-cover-photo-section` | Rare hero tweaks |
| Chart wrapper | Page chart component | `.service-page-chart-wrapper` | Table scroll + center on mobile |

---

## 11. File reference

| File | Responsibility |
|------|----------------|
| `src/app/globals.css` | Tokens, headings, `.tc-flex`, FAQ, `.rich-text-section`, `.photoSize` |
| `src/css/tables.css` | Types grid, service width, page wrappers |
| `src/css/forms.css` | Order forms |
| `src/components/TypesSection.tsx` | Types cards |
| `src/components/BenefitsSection.tsx` | Benefits |
| `src/components/PromotionBar.tsx` | Promotion bar |
| `src/components/SizeChartSection.tsx` | Chart shell |
| `src/components/DeliverySchedule.tsx` | Delivery table |
| `src/components/FaqsSection.tsx` | FAQs |
| `src/components/ImageWithText.tsx` | Hero banner |
| `src/screens/PhotosPrintingDelivery/ThreeColumns.tsx` | Cover photo (canonical) |

---

## 12. Future refactor

1. Extract types alignment → `.types-section--align-descriptions` on `TypesSection`.
2. Rename `foam-board-page` → `service-page`.
3. Consolidate ThreeColumns to one file.
4. Move Flyers inline CSS to `tables.css`.
5. Migrate legacy `screens/*` pages to App Router.

---

## 13. Design tokens & typography

Defined in `:root` (`globals.css`):

| Token | Value | Used for |
|-------|-------|----------|
| `--headingFontSize` | `32px` | Calculated heading sizes, types `min-height` |
| `--bodyFontSize` | `16px` | Body / `.content` |
| `--secondary-font` | Playfair Display | `.heading-h2`, `.heading-h3` |
| `--simple-font` | Dosis / system | `.content`, `.font-simple` |
| `--tableHeadBgColor` | `#384e5a` | Table headers |
| `--tableHeadTextClr` | `#ffffff` | Table header text |
| `--primary-color` | `#6ec1cd` | Accents, chart highlights |

### Heading classes (exact)

| Class | Desktop | Mobile (≤768px) | Notes |
|-------|---------|-----------------|-------|
| `.heading-h2` | `48px / 64px`, `margin: 25px`, weight 800 | `31px / 45px` (768px rule) | Also `@767px`: `calc(32px × 0.8)` — **conflicting rules exist**; inspect computed style if heading looks wrong |
| `.heading-h3` | `30px / 43px`, weight 800 | inherits unless `.h3` mobile rule applies | Step titles in ThreeColumns |
| `.content` | `16px / 20px`, weight 400 | same | Descriptions, body copy |
| `.sub-heading` | `calc(16px + 4px)` = 20px | `16px` | Cover photo subtitle under main title |
| `.faqHeading` | `48px / 1.1`, padding bottom `1em` | same base | FAQ section title |
| `.rich-text-section h2` | `26px / 1.2` | same | Promotion bar title (component uses `h3` tag but section styles `h2`) |

### Bootstrap spacing used in components

| Class | Typical value |
|-------|---------------|
| `my-3` | `1rem` top + bottom |
| `mb-4` | `1.5rem` bottom |
| `mb-5` | `3rem` bottom |
| `mt-3` | `1rem` top |
| `mt-5` | `3rem` top |
| `py-3` | `1rem` vertical padding |
| `py-5` | `3rem` vertical padding |

---

## 14. Section specifications (exact CSS)

### 14.1 Cover photo / ThreeColumns (canonical)

> **Deep reference:** See **`docs/REFERENCE-cover-photo-section-css.md`** for every class, spacing value, breakpoint, and parity checklist (Photos Printing cover section).

**Screenshot reference:** Photos Printing “Photo Prints Delivered With Ease…” block.

| Item | Value |
|------|-------|
| **Component** | `src/screens/PhotosPrintingDelivery/ThreeColumns.tsx` |
| **Customize type** | `coverPhoto` |
| **Used on** | Photos Printing, Greeting Cards, Mugs, Documents, Passport |

#### DOM structure

```
section.section--wrapper.bgImg-section.{sectionClassName}
  div.inside-main                          ← max-width container
    div.section--header.mt-3.mb-4
      h1|h2.heading-h2.text-center.mb-2    ← page title
      div.rte.text-center.sub-heading        ← page subtitle
    div.tc-flex (desktop) | Swiper (mobile)
      div.tc-flex-item.p-3 (×3)
        div.tc-img-wrapper                   ← 250px image box
        h2.heading-h3.fw-bold                ← "Step 1"
        div.rte.content.subtitle             ← bold step headline (1st <p>)
        div.rte.content                      ← step body
    ActionBtn (CTA)
```

#### Layout CSS (`globals.css`)

| Selector | Desktop | Mobile (≤768px) |
|----------|---------|-----------------|
| `.section--wrapper .inside-main` | `max-width: 1200px; margin: auto; padding: 2em 2em 2.5em` | `padding: 2em 1em` |
| `.tc-flex` | `display: flex; gap: 0.5em; align-items: flex-start; justify-content: center` | `flex-direction: column` |
| `.tc-flex .tc-flex-item` | `flex-basis: calc(33.33% - 0.5em)` | `flex-basis: 100%` |
| `.tc-img-wrapper` | `min/max-height: 250px; width: 100%` | img `height: 250px !important` |
| `.tc-flex-item .subtitle` | `min-height: calc(2 × 20px); margin-bottom: 5px` | same |

#### Title → subtitle spacing (main header)

| Element | Classes | Spacing |
|---------|---------|---------|
| Page title | `.heading-h2 … mb-2` | `margin-bottom: 0.5rem` (Bootstrap `mb-2`) |
| Page subtitle | `.rte.sub-heading` | No extra margin-top; follows title |
| Header block | `.section--header.mt-3.mb-4` | `margin-top: 1rem; margin-bottom: 1.5rem` |

**Desktop vs mobile:** Same CSS — spacing between main title and subtitle is **identical** unless CMS content wraps differently.

#### Step column spacing (image → Step N → subtitle → body)

| Gap | Source |
|-----|--------|
| Image → step label | Default block flow after `.tc-img-wrapper` |
| Step label | `.heading-h3` — no extra margin-top in CSS |
| Step subtitle → body | `.subtitle { margin-bottom: 5px }` |
| Column padding | `.tc-flex-item.p-3` → `1rem` all sides |

**Mobile:** Swiper `slidesPerView: 1`, `spaceBetween: 20`, slide class `slides p-3`.

#### Page-specific overrides

| Page | Override | Purpose |
|------|----------|---------|
| Mugs | `.mugs-cover-photo-section .inside-main { max-width: 1260px }` | Wider hero |
| Mugs | `.tc-flex-item { padding-left/right: 0.625rem }` (≥769px) | Tighter columns |

#### Props

```tsx
<ThreeColumns
  section={sections.coverPhoto}
  useH1ForTitle={false}           // true for SEO on Greeting Cards, Mugs
  sectionClassName=""             // optional scoped hook
/>
```

**Do not** duplicate `.tc-flex` rules per page unless promoting to shared modifier.

---

### 14.2 Hero banner / ImageWithText

| Item | Value |
|------|-------|
| **Component** | `@/components/ImageWithText` |
| **Customize type** | `heroBanner` |
| **Used on** | Business Cards, Certificates, Stickers, Flyers, Foam Board, Canvas |

#### DOM

```
section.image-with-text--section.iwt-section
  div.row.m-0
    div.col-md-6.p-3.px-md-5          ← text
      div.content-wrapper.h-100       ← max-width 690px, margin-left auto
        h2.heading-h2 … mb-3.my-md-3
        div.rte.mb-md-5.mb-3.content
        CTA (desktop .small-hide / mobile .medium-hide)
    div.col-md-6.p-0                  ← image
```

#### CSS (`tables.css` + globals)

| Selector | Value |
|----------|-------|
| `.image-with-text--section .content-wrapper` | `max-width: 690px; margin-left: auto; width: 100%` |
| `.heading-h2` in hero | `mb-3` mobile, `my-md-3` desktop |
| `.rte.content` | `mb-3` mobile, `mb-md-5` desktop |
| ≤768px | `.small-hide { display: none }`, `.medium-hide { display: block }` |
| ≥769px | opposite |

**Scroll target:** `#orderForm` (modern pages).

**Legacy alternative:** `screens/PhotosPrintingDelivery/ImageWithText` — different classes (`.photo-delivery`), scrolls to `#printing-form`. Do not mix on one page.

---

### 14.3 Promotion bar

| Item | Value |
|------|-------|
| **Component** | `PromotionBar` |
| **Customize type** | `richtext` |

#### DOM

```
div.servics-tittle.rich-text-section    ← default bg #D3F994, text #000
  div.container.py-4.px-3
    h3.mb-3                             ← section title
    div.content.text-center             ← 16px/20px body
```

#### CSS

| Rule | Value |
|------|-------|
| `.rich-text-section h2` | `26px / 1.2` (title tag is `h3` — may not apply; title inherits `.h3.mb-3`) |
| `.content` | `16px / 20px` |
| Container | `py-4` = 1.5rem vertical, `px-3` = 1rem horizontal |

**No page wrapper needed** on modern pages.

---

### 14.4 Types section

| Item | Value |
|------|-------|
| **Component** | `TypesSection` |
| **Customize types** | `types`, `businesstypes`, `premiumtypes`, `displayoptions`, `mountingoptions` |
| **Props** | `alignDescriptions` (default `true`), `fitImageCards` (foam display/mounting only) |
| **Source of truth** | `src/css/tables.css` — shared block `.types-section--align-descriptions` (~lines 579–641) |

#### DOM (current `TypesSection.tsx`)

```
div.types-section[.types-section--fit-image][.types-section--align-descriptions]
  div.service-page-width.p-3           ← max-width 1260px, margin auto, padding 1rem
    h2.heading-h2.my-3.fw-bold         ← section title (skipped if empty)
    div.rte.mb-4.content               ← section intro (only if visible CMS text)
    div.types-cards-flex.cards-{N}.mb-4
      div.card → div.card-body.p-3.d-flex.flex-column
        div.bg-light | .types-card-image-wrap   ← image (line-height: 0)
        h3.h2                          ← card title (no mt-3 when alignDescriptions)
        div.rte                        ← card description (no mt-3 when alignDescriptions)
```

Empty CMS section content (`<br>` only) is **not rendered** (`hasVisibleHtmlContent` in `TypesSection.tsx`).

---

#### Types spacing — three tiers (mandatory for AI)

When you add or copy a types section, pick **one tier**. Do **not** invent a fourth tier or add `.{slug}-printing-page` types spacing.

| Tier | When to use | Page wrapper | JSX | Layer 3 types CSS |
|------|-------------|--------------|-----|-------------------|
| **A — Standard** | **Default for all new pages** | `foam-board-page` (+ optional `{slug}-printing-page`) | `<TypesSection section={sections.types} />` | **None** |
| **B — Foam board main types** | Foam board panels — main types grid only | `foam-board-page foam-board-printing-page` | `<TypesSection section={sections.types} />` | `.foam-board-printing-page .types-section--align-descriptions` (already in `tables.css`) |
| **C — Fit-image** | Foam board Display & Mounting only | same as B | `<TypesSection section={…} fitImageCards />` | Layer 2 fit-image + `.foam-board-printing-page … fit-image` (already in `tables.css`) |

**Reference pages for Tier A (same spacing):** Business Cards, Mugs, Greeting Cards, T-Shirts, Flyers, Stickers, Certificates, Canvas, Photos Printing.

---

##### Tier A — Standard (most pages)

| Gap | Selector | Value |
|-----|----------|-------|
| Section heading top | `.types-section--align-descriptions .heading-h2.my-3` | `margin-top: 1rem` |
| **Section heading → picture cards** | same + `.heading-h2 + .types-cards-flex` | `margin-bottom: 0.75rem` + cards `margin-top: 0` → **~12px** |
| **Picture → card title** | `.card-body > h3.h2` | `margin-top: 0.75rem` → **12px** |
| **Card title → description** | `.card-body > .rte` | `margin-top: 0.75rem` → **12px** |
| Card body padding | Bootstrap `p-3` | `1rem` all sides |
| Image box | `.bg-light` / `.types-card-image-wrap` | `height: auto`; **no** `aspect-ratio` square box |
| Card title min-height | `h3.h2` | `min-height: unset` (no spacer) |

If CMS section intro is present: `div.rte.content.mb-4` adds **1.5rem** below intro before cards.

**Visual note:** Global `.heading-h2 { line-height: 64px }` (45px mobile) adds space *inside* the heading box — not a types override.

---

##### Tier B — Foam board main types (reference for future rollout)

**Only** when root has `.foam-board-printing-page` and section is **not** `fitImageCards`:

| Gap | Value |
|-----|-------|
| **Section heading → picture cards** | `margin-bottom: 1.25rem` + cards `margin-top: 0.25rem` → **~24px** |
| **Picture → card title** | `1rem` (16px) |
| **Card title → description** | `1rem` (16px) |

```css
/* tables.css — .foam-board-printing-page .types-section--align-descriptions */
.heading-h2.my-3                    { margin-bottom: 1.25rem !important; }
.heading-h2 + .types-cards-flex,
.rte.content + .types-cards-flex    { margin-top: 0.25rem !important; }
.card-body > h3.h2                  { margin-top: 1rem !important; }
.card-body > .rte                   { margin-top: 1rem !important; }
```

Applies to main foam board types (`sections.types`). **Do not copy** this block to other pages.

---

##### Tier C — Fit-image (Display & Mounting)

```tsx
<TypesSection section={sections.displayoptions} fitImageCards />
<TypesSection section={sections.mountingoptions} fitImageCards />
```

| Gap | Value |
|-----|-------|
| **Section heading → picture cards** | `0.5rem` |
| **Picture → card title** | `0.5rem` |
| **Card title → description** | `1rem` (Tier B value — unchanged) |

Fit-image also uses natural image height (`aspect-ratio: unset`, `max-height: 420px`, horizontal scroll). **Never** apply a square `aspect-ratio: 1/1` box to fit-image cards.

---

#### Anti-patterns (caused port / page spacing bugs — do not repeat)

| ❌ Do not | Why |
|----------|-----|
| Add `.{slug}-printing-page .types-section …` spacing rules | Duplicates Layer 2; pages drift apart |
| Set `aspect-ratio: 1/1` on `.types-section--align-descriptions .bg-light` | Large empty gap under landscape images before titles |
| Set `min-height: calc(var(--headingFontSize) * 1.1 * 2)` on `h3.h2` | Fake vertical spacer between image and description |
| Use `compactHeadingSpacing` on TypesSection | Deprecated; Mugs uses Tier A like Business Cards |
| Pass `alignDescriptions={false}` unless explicitly required | Restores component `mt-3` and breaks shared spacing |
| Edit types spacing in `globals.css` | Belongs in `tables.css` Layer 2 only |
| Copy foam-board Tier B/C rules to mugs, business cards, etc. | Wrong tier for those pages |

---

#### Shared grid (`tables.css`)

| Breakpoint | Card `flex-basis` |
|------------|-------------------|
| Default | `33.33%` |
| `.cards-2` | `40%`; ≥769px `justify-content: center` |
| ≤768px | `50%` |
| ≤525px | `100%` |

#### Description alignment (default)

Handled by `.types-section--align-descriptions` (default on `TypesSection`):

| Rule | Value |
|------|-------|
| `.types-cards-flex` | `align-items: flex-start` |
| `.bg-light` / `.types-card-image-wrap` | `background: transparent; line-height: 0; width: 100%` |
| `img` | `width: 100%; max-width: 100%; height: auto; display: block` |
| `h3.h2` | `margin-bottom: 0; min-height: unset` |
| `.rte` | `margin-top: 0.75rem !important` (Tier A) or `1rem` (Tier B on foam board printing) |

**Promote Tier B values to shared Layer 2** only when rolling out site-wide — until then, new pages use **Tier A**.

---

### 14.5 Benefits section

| Item | Value |
|------|-------|
| **Component** | `BenefitsSection` |
| **Customize type** | `benefits` |

#### DOM

```
div.benefits-section
  div.container.py-3.pt-md-3.pb-md-5
    h2.heading-h2.my-3
    div.rte.mb-5.content              ← intro (settings.text)
    div.row
      div.col-md-6.p-0                ← image
      div.col-md-6 → .photo-txt.content
    btn--primary-new                  ← scroll #orderForm
```

#### Default spacing

| Element | Classes | Spacing |
|---------|---------|---------|
| Container | `py-3 pt-md-3 pb-md-5` | 1rem mobile; md+ top 1rem bottom 3rem |
| Title | `my-3` | 1rem vertical |
| Intro | `mb-5` | 3rem bottom |

#### With `foam-board-page` wrapper (§16)

| Override | Value |
|----------|-------|
| `.benefits-section .container.py-3` | `padding-top: 0 !important` |
| `.heading-h2.my-3` | `margin-top: 0.25rem; margin-bottom: 0.5rem` |
| `.rte.mb-5.content` | `margin-bottom: 1rem` |

**Mugs override** restores photos-style spacing: `padding-top: 1rem`, heading `margin: 1rem 0`.

---

### 14.6 Size chart

| Item | Value |
|------|-------|
| **Shell** | `SizeChartSection` |
| **Customize type** | `sizechart` |
| **Data** | Settings & SEO prices array (page chart component) |

#### Shell DOM

```
div.margin-bottom.container
  h2.headingSizeChart.heading-h2.mt-5.mb-3    ← title
  div.text-center.mb-4                         ← intro
  {children — page chart}
```

| Element | Spacing |
|---------|---------|
| Section root | `.margin-bottom` → 70px bottom (≤500px: 30px) |
| Title | `mt-5 mb-3` → 3rem top, 1rem bottom |
| Intro | `mb-4` → 1.5rem bottom |

#### Chart wrapper (Layer 2 — all matrix pages)

**Exact CSS** (`tables.css` — use class `service-page-chart-wrapper` on every chart):

```css
.service-page-chart-wrapper {
  margin: auto;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.service-page-chart-wrapper .photoSize {
  width: max-content;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .service-page-chart-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  .service-page-chart-wrapper .dp-table-inside {
    flex: 0 0 auto;
    max-width: none;
    overflow-x: visible;
    margin: 0;
  }
}
```

#### Chart wrapper (Layer 3 — page-specific overrides)

| Reference page | Extra wrapper class | Layer 3 beyond shared |
| --- | --- | --- |
| Business Cards, Certificates, Stickers | `service-page-chart-wrapper` only | None |
| Greeting Cards | `+ greeting-cards-sizechart-wrapper` | Column header `.gcp-chart-th-*` rules under `.greeting-cards-printing-page` (§22.5) |
| Mugs | `service-page-chart-wrapper` | Mobile left-align scroll override (§22.5) — **required** for volume-tier table |
| Canvas | `.cp-sizechart` on inner table | `.cp-sizechart .sec-col { max-width: 120px }` |
| Flyers | `.flyers-sizechart-wrapper` | Inline styles in component — migrate to `tables.css` when touching |

**Do not** nest extra `.container` inside chart component (causes double padding / mobile clip).

---

### 14.7 Order form

| Item | Value |
|------|-------|
| **Location** | `src/app/{slug}/_components/{Name}OrderForm.tsx` |
| **CSS** | `forms.css` |

#### Standard wrappers

```tsx
<div className="photo-printing-form--wrapper order-form--wrapper">
```

| Page pattern | Form anchor id |
|--------------|----------------|
| Modern (Canvas, Business Cards, …) | `#orderForm` |
| Greeting Cards, Mugs, Photos, Documents | `#printing-form` |
| Passport | `#passport-form` |

**BenefitsSection CTA** scrolls to `#orderForm` — if your form uses `#printing-form`, update Benefits or add duplicate id.

#### Layer 3 examples

| Page | Extra CSS |
|------|-----------|
| Greeting Cards | upload slot `margin-top: 35px`, dropzone spacing |
| Mugs | `.type-cards-flex`, `.mugs-upload-slots` |

---

### 14.8 Featured collection

| Variant | When |
|---------|------|
| `FeaturedCollection` (EComereceStore) | Default CMS collection |
| `GreetingCardsFeaturedCollection` | Greeting cards carousel |
| `MugsFeaturedCollection` | Mugs carousel |
| Photos local | Hardcoded title — legacy |

Title: `heading-h2 text-center my-3`. Greeting Cards mobile: featured container padding reset in Layer 3.

---

### 14.9 Delivery schedule

| Item | Value |
|------|-------|
| **Component** | `DeliverySchedule` |
| **Customize type** | `delivery` |

```
div.delivery-schedule--section
  div.container
    h2.heading-h2.mb-3
    div.text-center.mb-5              ← intro
    div.dp-table-inside.customizeable-table
      table
```

| Element | CSS |
|---------|-----|
| `.dp-table-inside` | `max-width: 800px; margin: auto` (≤768px: `max-width: 100%`) |
| `tableClass` prop | Modern pages: `" mb-4 "` |

**No page wrapper needed.**

---

### 14.10 FAQs

| Item | Value |
|------|-------|
| **Component (modern)** | `FaqsSection` |
| **Customize type** | `faqSection` |

```
div.bg-faq
  div.faqSection.container.py-5
    h2.faqHeading.playfair-heading-800.text-center
    div.faq--item → .accordion / .panel.rte
```

| Element | CSS |
|---------|-----|
| `.faqHeading` | `48px / 1.1`, `padding: 0 0 1em 0` |
| `.faqSection` | `py-5` → 3rem vertical |
| `.accordion` | `padding: 18px` (782px: `10px`, font 18px) |
| `.panel` active | `padding: 1em; margin-bottom: 1em` |

**No page wrapper needed.** Legacy `Faqs.tsx` uses same global CSS.

---

## 15. Page registry — sections per page

| Section | Photos | Biz | Cert | Stickers | Flyers | Foam | Canvas | Greeting | Mugs | Docs | Passport |
|---------|:------:|:---:|:----:|:--------:|:------:|:----:|:------:|:--------:|:----:|:----:|:--------:|
| ThreeColumns | ✓ | | | | | | | ✓ | ✓ | ✓ | ✓ |
| ImageWithText | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | | |
| PromotionBar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| TypesSection | ✓ | ✓✓ | ✓ | ✓ | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | | |
| BenefitsSection | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| SizeChart | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | custom | custom |
| Order form | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| FeaturedCollection | ✓ | | | | | | | ✓ | ✓ | | |
| DeliverySchedule | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| FaqsSection / Faqs | legacy | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | legacy | legacy |

### Wrapper registry

| Page | Root class | Layer 3 block in tables.css |
|------|------------|----------------------------|
| Greeting Cards | `foam-board-page greeting-cards-printing-page` | Yes — types, chart, uploads, featured |
| Mugs | `foam-board-page mugs-printing-page` | Yes — chart, benefits reset, form (**types = Tier A, no page CSS**) |
| Foam Board | `foam-board-page foam-board-printing-page` | Yes — types, benefits gap |
| Business Cards | `foam-board-page` | No |
| Flyers | `flyers-printing-page` | Inline styles only (bad) |
| Photos | `printing-delivery--wrapper` | `index.css` (legacy) |

---

## 16. `foam-board-page` wrapper side effects

Adding `foam-board-page` applies these **automatically** (Layer 2):

| Target | Effect |
|--------|--------|
| `.benefits-section .container` | `padding-top: 0 !important` |
| `.benefits-section .heading-h2.my-3` | `margin-top: 1rem; margin-bottom: 0.5rem` |
| `.benefits-section .rte.mb-5` | `margin-bottom: 1rem` |
| `.types-section--fit-image` + following benefits | Reduced gap via `:has()` selectors |

**If your page needs Photos Printing–style benefits spacing** (like Mugs), add Layer 3 override:

```css
.{slug}-printing-page .benefits-section .container.py-3 {
  padding-top: 1rem !important;
}
.{slug}-printing-page .benefits-section .heading-h2.my-3 {
  margin-top: 1rem !important;
  margin-bottom: 1rem !important;
}
```

---

## 17. New page recipe (step-by-step)

1. **Choose hero pattern:** `coverPhoto` → ThreeColumns | `heroBanner` → ImageWithText.
2. **Copy page component** from Greeting Cards (cover photo) or Canvas (image hero).
3. **Set wrapper:** `foam-board-page {slug}-printing-page`.
4. **List sections** in standard order (§5) — do not reorder without reason.
5. **Bootstrap Customize** (backend guide) — same section types as reference page.
6. **Load page with zero new CSS** — screenshot each section.
7. **Add Layer 3 only for:**
   - Chart horizontal scroll wrapper
   - Upload field spacing
   - Benefits spacing reset (if `foam-board-page` too tight)
   - Rare hero `sectionClassName` tweak
8. **Verify mobile** at 371px, 768px, 1200px — compare to Greeting Cards reference.
9. **Types section:** use **Tier A** (§14.4) — `<TypesSection section={sections.types} />` with **no** page-specific types CSS unless user explicitly requests Foam Board Tier B/C.

---

## 18. Known inconsistencies & pitfalls

| Issue | Detail | Fix when building new page |
|-------|--------|----------------------------|
| Two hero systems | ThreeColumns vs ImageWithText | Pick one per page; never both |
| Two FAQ components | `FaqsSection` vs legacy `Faqs` | Use `FaqsSection` only |
| `foam-board-page` name | Used on non–foam-board pages | Still use it for shared spacing; add `{slug}-printing-page` for overrides |
| `fitImageCards` not passed | Foam Board display/mounting | Pass prop or CSS won't apply |
| Flyers inline CSS | Hero padding in component | Move to `tables.css` when touching Flyers |
| Form scroll id mismatch | `#orderForm` vs `#printing-form` | Match Benefits CTA and hero buttons |
| Double `.container` | SizeChartSection + chart both use container | Chart: wrapper div only, no container |
| Types spacing wrong on new page | Wrong tier or page-specific types CSS added | **Tier A** default; copy Business Cards / Mugs JSX; **no** Layer 3 types block |
| `aspect-ratio: 1/1` on types images | Old Layer 2 mistake — huge gap under images | `height: auto` only; fit-image uses Tier C unset rules |
| `min-height: calc(...)` on types `h3` | Old alignment hack | `min-height: unset` in shared CSS |
| Types mobile min-height ×3 | Extra gap under card titles on mobile | Use `min-height: unset` — Tier A |
| `compactHeadingSpacing` | Deprecated mugs tweak | Do not use; Mugs = Tier A like Business Cards |
| Conflicting `.heading-h2` mobile rules | 768px vs 767px in globals | Check computed styles in DevTools |
| Size chart hardcoded fallback | Flyers/Greeting had inline title strings | Bootstrap `sizechart` in Customize (see Mugs helper) |

---

## 19. Debugging spacing issues

1. **Identify the section** — match DOM to §14 spec.
2. **Check wrapper** — is `foam-board-page` applying benefits/types overrides?
3. **Check Layer 3** — search `tables.css` for `.{your-page}-printing-page`.
4. **Compare reference** — Greeting Cards at same viewport width.
5. **Inspect computed styles** on the gap element — is it `margin`, `padding`, or `min-height`?
6. **Common culprits (types section):**
   - Wrong spacing **tier** (A vs B vs C) — check for `.foam-board-printing-page` on root
   - Page-specific `.{slug}-printing-page .types-section` rules (remove them)
   - `aspect-ratio: 1/1` on `.bg-light` (remove — use `height: auto`)
   - `min-height: calc(...)` on types `h3.h2` (should be `unset`)
   - Empty CMS `div.rte.content` between heading and cards (`hasVisibleHtmlContent` should skip it)
   - Global `.heading-h2` line-height (64px / 45px mobile) inflating heading box
   - `foam-board-page` zeroing benefits padding (not types)
   - Nested Bootstrap containers
   - Component `mt-3` when `alignDescriptions={false}`
7. **Fix in the right layer** — types spacing belongs in Layer 2 only (§14.4 tiers); never a third page copy.

---

## 20. Section recipes — copy-paste for new pages

When you tell the AI which sections to use, each row below is the **exact JSX + CSS** that applies. Desktop and mobile spacing come from Layers 1–2 automatically unless noted.

### How to request a new page

```
New page: {slug}-printing
Wrapper: foam-board-page {slug}-printing-page
Hero: coverPhoto | heroBanner
Sections (in order):
  - coverPhoto
  - richtext
  - types
  - benefits
  - sizechart + chart
  - orderForm
  - delivery
  - faqs
Benefits spacing: standard (photos style) | compact (foam-board default)
Form anchor: #printing-form | #orderForm
```

---

### RECIPE: `coverPhoto` → ThreeColumns

**Customize type:** `coverPhoto`  
**CSS layer:** Layer 1 (`globals.css`) — no page CSS needed  
**Desktop = mobile:** same rules; mobile uses Swiper instead of 3-column flex

```tsx
{sections?.coverPhoto && (
  <ThreeColumns
    section={sections.coverPhoto}
    useH1ForTitle          // true for SEO (Greeting Cards, Mugs)
    sectionClassName=""    // optional, e.g. "mugs-cover-photo-section"
  />
)}
```

| Element | Classes | Spacing (desktop & mobile) |
|---------|---------|---------------------------|
| Container | `.inside-main` | max 1200px; padding `2em 2em 2.5em` (mobile: `2em 1em`) |
| Page title | `.heading-h2.mb-2` | 48px/64px (mobile: 31px/45px); `margin-bottom: 0.5rem` |
| Page subtitle | `.rte.sub-heading` | 20px (mobile: 16px); follows title |
| Header block | `.section--header.mt-3.mb-4` | 1rem top, 1.5rem bottom |
| Step columns | `.tc-flex` / Swiper | 3×33% desktop; 1 slide mobile, `spaceBetween: 20` |
| Step image box | `.tc-img-wrapper` | 250px height |
| Step label | `.heading-h3` | 30px/43px |
| Step subtitle → body | `.subtitle` | `min-height: 40px; margin-bottom: 5px` |

**Layer 3 only if:** wider hero — `.mugs-cover-photo-section .inside-main { max-width: 1260px }`

---

### RECIPE: `heroBanner` → ImageWithText

**Customize type:** `heroBanner`  
**CSS layer:** Layer 2 (`tables.css` `.image-with-text--section`)

```tsx
{sections?.heroBanner && (
  <ImageWithText section={sections.heroBanner} imageClass="w-100" />
)}
```

| Element | Desktop | Mobile (≤768px) |
|---------|---------|-----------------|
| Title `.heading-h2` | `mb-3 my-md-3` | `mb-3` |
| Body `.rte.content` | `mb-md-5` (3rem) | `mb-3` (1rem) |
| CTA | `.small-hide` visible | `.medium-hide` visible |
| Content column | `.content-wrapper` max 690px | same |

**Form scroll:** `#orderForm` — set form id to match or update BenefitsSection.

---

### RECIPE: `richtext` → PromotionBar

```tsx
{sections?.richtext && <PromotionBar section={sections.richtext} />}
```

| Element | Value |
|---------|-------|
| Root | `.rich-text-section`; default bg `#D3F994` |
| Container | `py-4 px-3` (1.5rem / 1rem) |
| Body | `.content` 16px/20px |

**No page CSS.**

---

### RECIPE: `types` → TypesSection

```tsx
{sections?.types && <TypesSection section={sections.types} />}
// Multiple sections: repeat with businesstypes, premiumtypes, displayoptions, etc.
// Display/mounting (foam board): add fitImageCards
<TypesSection section={sections.displayoptions} fitImageCards />
```

**CSS:** Layer 2 — `.types-section--align-descriptions` applied by default (`alignDescriptions={true}`).

| Element | Desktop | Mobile |
|---------|---------|--------|
| Section width | `.service-page-width.p-3` max 1260px | same |
| Section title | `.heading-h2.my-3` | same |
| Card grid | 33% / 50% (768px) / 100% (525px) | same breakpoints |
| Card title → description | `min-height: calc(32px × 1.1 × 2)` + `.rte margin-top: 0.75rem` | **same as desktop** (no 3-line override) |
| Image box | transparent `.bg-light` | same |

**Disable alignment only if needed:** `alignDescriptions={false}`

**Foam board only (Layer 3):** mobile horizontal snap scroll, tight gap before benefits — keep `.foam-board-printing-page` rules.

---

### RECIPE: `benefits` → BenefitsSection

```tsx
{sections?.benefits && <BenefitsSection section={sections.benefits} />}
```

| Element | Default with `foam-board-page` | Standard (photos style) |
|---------|-------------------------------|-------------------------|
| Container top padding | `0` | `1rem` — add Layer 3 override |
| Title margins | `0.25rem / 0.5rem` | `1rem / 1rem` — add Layer 3 override |
| Intro `mb-5` | forced to `1rem` | default `3rem` if no foam-board-page |

**Standard spacing Layer 3 block** (copy for pages like Mugs):

```css
.{slug}-printing-page .benefits-section .container.py-3 {
  padding-top: 1rem !important;
}
.{slug}-printing-page .benefits-section .heading-h2.my-3 {
  margin-top: 1rem !important;
  margin-bottom: 1rem !important;
}
```

---

### RECIPE: `sizechart` → SizeChartSection + chart

```tsx
{data?.{slug}_prices?.length > 0 && sections?.sizechart && (
  <SizeChartSection section={sections.sizechart}>
    <YourChart data={data} />
  </SizeChartSection>
)}
```

**Shell spacing (all pages):**

| Element | Value |
|---------|-------|
| Root | `.margin-bottom.container` — 70px bottom (≤500px: 30px) |
| Title | `.headingSizeChart.heading-h2.mt-5.mb-3` — 3rem top, 1rem bottom |
| Intro | `.text-center.mb-4` — 1.5rem bottom |

**Chart component — always use shared wrapper:**

```tsx
<div className="service-page-chart-wrapper">
  <div className="dp-table-inside text-center mb-5">
    <table className="photoSize table">…</table>
  </div>
</div>
```

**Do not** wrap chart in extra `.container`. Layer 3 only for page-specific table header classes (e.g. Mugs `.vbps-chart table th`).

---

### RECIPE: order form

```tsx
<div id="printing-form">   {/* or id="orderForm" */}
  <YourOrderForm data={data} areas={areas} />
</div>
```

**Inside form:**

```tsx
<div className="photo-printing-form--wrapper order-form--wrapper">
```

**CSS:** `forms.css` — Layer 3 only for upload slot spacing under `.{slug}-printing-page`.

---

### RECIPE: `delivery` → DeliverySchedule

```tsx
{sections?.delivery && (
  <DeliverySchedule section={sections.delivery} tableClass=" mb-4 " />
)}
```

| Element | Value |
|---------|-------|
| Title | `.heading-h2.mb-3` |
| Intro | `.mb-5` (3rem) |
| Table wrap | `.dp-table-inside` max 800px centered |

**No page CSS.**

---

### RECIPE: `faqSection` → FaqsSection

```tsx
{sections?.faqs && <FaqsSection section={sections.faqs} />}
```

| Element | Value |
|---------|-------|
| Outer | `.bg-faq` / `.faqSection.container.py-5` |
| Title | `.faqHeading` 48px, padding-bottom 1em |
| Accordion | padding 18px (782px: 10px) |

**No page CSS.** Use `FaqsSection` — not legacy `Faqs`.

---

### RECIPE: featured collection (optional)

```tsx
<YourFeaturedCollection
  title={sections?.framesCollection?.settings?.title}
  products={data?.{slug}_featured_collection?.products ?? []}
/>
```

**CSS:** usually none; Greeting Cards has mobile padding reset in Layer 3.

---

## 21. Shared CSS classes reference (Layer 2)

| Class | Applied by | Purpose |
|-------|------------|---------|
| `.types-section--align-descriptions` | `TypesSection` default | Card title/description alignment — desktop = mobile |
| `.types-section--fit-image` | `TypesSection fitImageCards` | Image-sized type cards |
| `.service-page-chart-wrapper` | Chart components | Table scroll + center on mobile |
| `.service-page-width` | TypesSection inner wrapper | max-width 1260px |
| `.foam-board-page` | Page root | Compact benefits spacing |

---

## 22. Section CSS lookup — "same as {Page}"

> **For AI:** When the user says *"Types section same as Business Cards"*, look up the row below and copy **JSX**, **props**, and **Layer 3 CSS** exactly. Mixed pages: repeat for each section, then follow [§23](#23-ai-css-rules-for-mixed-pages).

### 22.0 Reference pages & root wrappers

| Page name | Slug | Root `className` | Has `{slug}-printing-page` Layer 3? |
| --- | --- | --- | --- |
| Business Cards | `business-cards-printing` | `foam-board-page` | **No** |
| Certificates | `certificates-printing` | `foam-board-page` | **No** |
| Stickers | `stickers-printing` | `foam-board-page` | **No** |
| Canvas | `canvas-printing` | `foam-board-page` | **No** (chart uses `.cp-sizechart`) |
| Flyers | `flyers-printing` | `flyers-printing-page` | Inline hero CSS only (**avoid**) |
| Foam Board | `foam-board-panels-printing` | `foam-board-page foam-board-printing-page` | **Yes** |
| Greeting Cards | `greeting-cards-printing` | `foam-board-page greeting-cards-printing-page` | **Yes** |
| Mugs | `mugs-printing` | `foam-board-page mugs-printing-page` | **Yes** |

**New mixed pages:** always use `foam-board-page {your-slug}-printing-page`. Copy Layer 3 blocks from each **source page** that contributed a section with page-specific CSS.

---

### 22.1 Hero — `coverPhoto` / ThreeColumns

> **Cover consistency:** For identical CSS/spacing on all pages, follow **`docs/REFERENCE-cover-photo-section-css.md`** — use Photos Printing as the only reference; no `sectionClassName`, no Mugs-style width overrides.

| Same as | Exact JSX | Layer 3 CSS to copy |
| --- | --- | --- |
| **Photos Printing** | `<ThreeColumns section={sections.coverPhoto} />` | **None** — canonical |
| **Greeting Cards** | `<ThreeColumns section={sections.coverPhoto} useH1ForTitle />` | None for hero |
| **Mugs** (legacy drift) | had `sectionClassName="mugs-cover-photo-section"` | **Remove** — see REFERENCE doc §16; do not copy 1260px block |

| **Docs / Passport** | Migrate to shared `PhotosPrintingDelivery/ThreeColumns` | None (Layer 1 `globals.css` only) |

**Shared Layer 1** (all ThreeColumns — do not duplicate): `globals.css` `.section--wrapper .inside-main`, `.tc-flex`, `.tc-img-wrapper` (250px), `.tc-flex-item .subtitle` — see §14.1.

---

### 22.2 Hero — `heroBanner` / ImageWithText

| Same as | Exact JSX | Layer 3 CSS |
| --- | --- | --- |
| **Business Cards, Certificates, Stickers, Canvas, Foam Board** | `<ImageWithText section={sections.heroBanner} imageClass="w-100" />` | **None** — Layer 2 `.image-with-text--section` in `tables.css` |

```css
.image-with-text--section .content-wrapper {
  max-width: 690px;
  margin-left: auto;
  width: 100%;
}
@media (max-width: 768px) {
  .image-with-text--section .small-hide { display: none !important; }
  .image-with-text--section .medium-hide { display: block !important; }
}
```

**Form anchor:** `#orderForm` (BenefitsSection CTA). BC form has no wrapper id — form component sets `#orderForm` internally.

---

### 22.3 Promotion bar — `richtext` / PromotionBar

| Same as | Exact JSX | Layer 3 CSS |
| --- | --- | --- |
| **Any standard page** | `<PromotionBar section={sections.richtext} />` | **None** |

Layer 1: `.rich-text-section`, `.content` 16px/20px, container `py-4 px-3`.

---

### 22.4 Types — `TypesSection`

| Same as | Exact JSX | Props | Types spacing tier | Layer 3 CSS |
| --- | --- | --- | --- | --- |
| **Business Cards, Mugs, Greeting Cards, T-Shirts, Flyers, Stickers, Certificates, Canvas, Photos** | `<TypesSection section={sections.types} />` (repeat for `businesstypes`, `premiumtypes`, etc.) | default `alignDescriptions={true}` | **Tier A** (§14.4) | **None** |
| **Foam Board (main types)** | `<TypesSection section={sections.types} />` | default | **Tier B** | **None** — requires `foam-board-printing-page` on root |
| **Foam Board (display / mounting)** | `<TypesSection section={sections.displayoptions} fitImageCards />` | `fitImageCards` | **Tier C** (§14.4) | **None** — rules already in `tables.css` |

**AI rules:**

1. **New page default:** Tier A — same JSX as Business Cards / Mugs. **No** `.{slug}-printing-page` types spacing block.
2. **Never** use `compactHeadingSpacing`.
3. **Never** add `aspect-ratio: 1/1` or `min-height: calc(...)` on types cards.
4. Spacing gaps (Tier A): heading → cards **0.75rem**, image → title **0.75rem**, title → description **0.75rem**.
5. Compare visually with Business Cards or Mugs at 768px and 1200px before adding any CSS.

**Shared Layer 2:** `.types-section--align-descriptions` — full spec §14.4.

**Grid breakpoints** (Layer 2 `.types-cards-flex`): 33% desktop → 50% @768px → 100% @525px.

---

### 22.5 Benefits — `BenefitsSection`

| Same as | Spacing behaviour | Layer 3 CSS on new page |
| --- | --- | --- |
| **Foam Board, Certificates, Stickers, Flyers, Canvas, Greeting Cards** | **Compact** — `foam-board-page` zeros benefits padding | **None** (inherit `foam-board-page` §16) |
| **Mugs** | **Standard (photos style)** — undo compact gap | **Copy this block** → rename to `.{your-slug}-printing-page`: |

```css
.{slug}-printing-page .benefits-section .container.py-3 {
  padding-top: 1rem !important;
}
.{slug}-printing-page .benefits-section .heading-h2.my-3 {
  margin-top: 1rem !important;
  margin-bottom: 1rem !important;
}
```

**Compact default** (`foam-board-page` — applied automatically):

```css
.foam-board-page .benefits-section .container.py-3 { padding-top: 0 !important; }
.foam-board-page .benefits-section .heading-h2.my-3 {
  margin-top: 1rem !important; margin-bottom: 0.5rem;
}
.foam-board-page .benefits-section .rte.mb-5.content { margin-bottom: 1rem; }
```

---

### 22.6 Size chart shell + chart component

| Same as | Page JSX | Chart wrapper in component | Layer 3 CSS |
| --- | --- | --- | --- |
| **Business Cards** | `<SizeChartSection section={sections.sizechart}><BcardsChart /></SizeChartSection>` | `service-page-chart-wrapper` | **None** |
| **Greeting Cards** | Conditional on `greeting_cards_prices.length` | `className="photoPrintingSizesChart service-page-chart-wrapper greeting-cards-sizechart-wrapper …"` | Copy GCP header rules: |

```css
.{slug}-printing-page .greeting-cards-sizechart-wrapper .photoSize thead th.gcp-chart-th-single {
  white-space: nowrap;
  vertical-align: middle !important;
}
/* + .gcp-chart-th-discount, .gcp-chart-th-discount-line — see tables.css ~447–472 */
```

| **Mugs** | Conditional on `mugs_prices` + `sizechart` | `service-page-chart-wrapper` | **Copy mobile chart block** (required): |

```css
.{slug}-printing-page .service-page-chart-wrapper .vbps-chart table th {
  background-color: var(--tableHeadBgColor);
  color: var(--tableHeadTextClr);
}
@media (max-width: 768px) {
  .{slug}-printing-page .service-page-chart-wrapper {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .{slug}-printing-page .service-page-chart-wrapper .dp-table-inside {
    display: block;
    width: max-content;
    min-width: 100%;
    margin: 0;
  }
  .{slug}-printing-page .service-page-chart-wrapper .photoSize {
    width: max-content;
    margin: 0;
  }
  .{slug}-printing-page .service-page-chart-wrapper .photoSize th:first-child,
  .{slug}-printing-page .service-page-chart-wrapper .photoSize td:first-child {
    min-width: 8.5rem;
    white-space: normal;
    text-align: left;
  }
}
```

| **Canvas** | `SizeChartSection` + `CPcardsChart` | inner `.cp-sizechart` | `.cp-sizechart .sec-col { max-width: 120px }` (Layer 2) |

**Shell spacing (all pages):** `.margin-bottom.container`, title `.headingSizeChart.heading-h2.mt-5.mb-3`, intro `.text-center.mb-4` — §14.6.

---

### 22.7 Order form

| Same as | Form anchor | Form wrapper classes | Layer 3 CSS to copy |
| --- | --- | --- | --- |
| **Business Cards, Certificates, Canvas, Foam, Stickers, Flyers** | `#orderForm` (in form component) | `photo-printing-form--wrapper order-form--wrapper` | **None** |
| **Greeting Cards, Mugs** | `<div id="printing-form">` wrapping form | same | See below |

**Greeting Cards form CSS** (copy if "form uploads same as Greeting Cards"):

```css
.{slug}-printing-page .custom-sizes-container > .greeting-card-upload-slots.upload-zone-after-fields {
  margin-top: 35px;
  width: 100%;
}
.{slug}-printing-page .greeting-card-upload-slot + .greeting-card-upload-slot {
  margin-top: 0.25rem;
}
.{slug}-printing-page .greeting-card-upload-slot .custom-dropzone--container {
  margin-bottom: 1.25rem;
}
.{slug}-printing-page .greeting-card-comments-block {
  margin-top: 1.75rem;
}
```

**Mugs form CSS** (copy if "form same as Mugs" — includes type picker + uploads):

```css
.{slug}-printing-page .mugs-type-cards-field { width: 100%; margin-bottom: 0; }
.{slug}-printing-page .custom-sizes-container > .mugs-upload-slots.upload-zone-after-fields {
  margin-top: 0.5rem; width: 100%;
}
.{slug}-printing-page .type-cards-flex { width: 100%; }
.{slug}-printing-page .type-cards-flex .type-card {
  flex: 0 0 auto; min-width: 140px; max-width: 180px;
}
.{slug}-printing-page .type-card img {
  width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block;
}
.{slug}-printing-page .type-card p { font-size: 0.9rem; line-height: 1.35; }
@media (max-width: 768px) {
  .{slug}-printing-page .type-cards-flex .type-card {
    min-width: 120px;
    max-width: calc(100% / 3 - 0.5em);
  }
}
```

**Shared form Layer 2:** `forms.css` — do not duplicate field/grid rules.

---

### 22.8 Featured collection

| Same as | Component | Layer 3 CSS |
| --- | --- | --- |
| **Greeting Cards** | `GreetingCardsFeaturedCollection` + `framesCollection` title | Mobile padding reset: |

```css
@media (max-width: 768px) {
  .{slug}-printing-page .greeting-cards-featured-collection .services-tittle > .container {
    padding-left: 0; padding-right: 0; max-width: 100%;
  }
}
```

| **Mugs** | `MugsFeaturedCollection` or `FeaturedCollection` | Use same mobile heading block as §22.9 |

---

### 22.9 Delivery — `DeliverySchedule`

| Same as | Exact JSX | Layer 3 CSS |
| --- | --- | --- |
| **All standard pages** | `<DeliverySchedule section={sections.delivery} tableClass=" mb-4 " />` | **None** |

Layer 2: `.dp-table-inside { max-width: 800px; margin: auto }`.

---

### 22.10 FAQs — `FaqsSection`

| Same as | Exact JSX | Layer 3 CSS |
| --- | --- | --- |
| **All modern pages** | `<FaqsSection section={sections.faqs} />` | **None** (Layer 1 `.faqHeading`, `.faqSection`) |

---

### 22.11 Mobile section headings (Greeting Cards + Mugs pattern)

If **any** section on the new page comes from Greeting Cards or Mugs, copy this block (both pages use it):

```css
@media (max-width: 768px) {
  .{slug}-printing-page h1.heading-h2,
  .{slug}-printing-page h2.heading-h2,
  .{slug}-printing-page h2.faqHeading {
    margin: 1.5rem 0 !important;  /* Greeting Cards uses !important; Mugs uses 24px 0 — equivalent */
  }
}
```

Business Cards / Certificates **without** `{slug}-printing-page` do **not** apply this — headings use global `.heading-h2` only.

---

### 22.12 Foam Board only — types mobile + fit-image gaps

Copy only when user says display/mounting types same as Foam Board:

- Layer 2: `.types-section--fit-image` (§14.4)
- Layer 3: `.foam-board-printing-page` rules in `tables.css` ~276–421 (mobile horizontal snap, `:has(+ .benefits-section)` gap tightening)

Do **not** copy foam-board types CSS for standard grid types.

---

### 22.13 Quick lookup matrix

| User says | Copy JSX from | Copy Layer 3 CSS from |
| --- | --- | --- |
| Hero = Greeting Cards | `GreetingCardsPrintingPage.tsx` | §22.9 optional |
| Hero = Mugs | `MugsPrintingPage.tsx` | §22.1 Mugs block |
| Hero = Business Cards | `BusinessCardsPage.tsx` | None |
| Types = Business Cards / Mugs | `BusinessCardsPage.tsx` or `MugsPrintingPage.tsx` | **None** — Tier A (§14.4) |
| Types = Foam display | `FoamBoardPage.tsx` | §22.12 |
| Benefits = Mugs | `MugsPrintingPage.tsx` | §22.5 Mugs block |
| Benefits = Greeting Cards | `GreetingCardsPrintingPage.tsx` | None (compact foam-board) |
| Chart = Greeting Cards | `GreetingCardsChart.tsx` | §22.6 GCP headers |
| Chart = Mugs | `MugsChart.tsx` | §22.6 Mugs mobile block |
| Chart = Business Cards | `BcardsChart.tsx` | None |
| Form = Greeting Cards | `GreetingCardsOrderForm.tsx` | §22.7 GCP uploads |
| Form = Mugs | `MugsOrderForm.tsx` | §22.7 Mugs form |
| Form = Business Cards | `BcardsOrderForm.tsx` | None |
| Collection = Greeting Cards | `GreetingCardsFeaturedCollection` | §22.8 |
| Collection = Mugs | `MugsFeaturedCollection` | §22.9 |
| Delivery / FAQs = any | any standard `*Page.tsx` | None |

---

## 23. AI CSS rules for mixed pages

When the user mixes sections from different pages (e.g. Hero=GCP, Types=BC, Benefits=Mugs, Chart=BC):

### 23.1 Algorithm

1. Set root: `<div className="foam-board-page {slug}-printing-page">`.
2. For each section in order, look up **§22** row → copy **exact JSX + props** from source `*Page.tsx`.
3. Collect all **Layer 3 CSS blocks** from referenced pages → merge into **one** block in `tables.css`:

```css
/* ── {Human Name} ({slug}) ───────────────────────────────── */
/* Sections: hero=Mugs, types=BC, benefits=Mugs, chart=BC, form=BC */
```

4. Rename every selector from `.{source-slug}-printing-page` → `.{new-slug}-printing-page`.
5. Rename scoped hooks (e.g. `mugs-cover-photo-section` → `{slug}-cover-photo-section`) consistently in JSX **and** CSS.
6. **Do not** add CSS for sections whose reference page has **None** in Layer 3 column.
7. Load page at 371px / 768px / 1200px — compare side-by-side with each **source page** for that section.

### 23.2 Consistency rules

| Rule | Detail |
| --- | --- |
| Same section = same CSS | If two pages use the same reference for Types, their types spacing must match exactly (**Tier A** unless Foam Board) |
| Types = Tier A by default | Business Cards, Mugs, Greeting Cards, etc. share `.types-section--align-descriptions` — **no** `{slug}` types CSS |
| No invented spacing | If §22 says "None", do not add `{slug}` rules for that section |
| One wrapper class | Never omit `foam-board-page` on new App Router pages (except deliberate Flyers legacy) |
| Props must match | `fitImageCards`, `useH1ForTitle`, `sectionClassName`, `tableClass=" mb-4 "` — copy from reference |
| Form anchor | If mixing Mugs form (`#printing-form`) with BC hero (`#orderForm` CTA), align Benefits/hero scroll targets |
| Deduplicate | If Mugs + Greeting Cards both need §22.9 mobile headings, include **once** |

### 23.3 User message template (CSS-focused)

```
Read GUIDE-service-page-css.md §22–§23.

New page: {slug}-printing
Wrapper: foam-board-page {slug}-printing-page

Section CSS map:
1. Hero         → Greeting Cards
2. Rich text    → Business Cards
3. Types        → Business Cards   (Tier A — no types CSS)
4. Benefits     → Mugs
5. Price table  → Business Cards
6. Order form   → Greeting Cards
7. Delivery     → Business Cards
8. FAQs         → Business Cards

Copy exact JSX from each reference Page.tsx.
Copy Layer 3 CSS blocks from §22 into tables.css under .{slug}-printing-page.
Do not add CSS for sections marked "None" in §22.
```

Pair with flow guide **§28** for backend/full functionality.

---

## Quick prompt for AI / developers

> Read `docs/GUIDE-service-page-css.md` **§22–§23** and `GUIDE-service-page-flow.md` **§28**.  
> User provides: UI screenshots + section copy map ("Hero = Greeting Cards", …).  
> For each section: copy exact JSX from reference `*Page.tsx` + Layer 3 CSS from §22 (rename to `{slug}-printing-page`).  
> Root: `foam-board-page {slug}-printing-page`. Do not invent spacing. Do not duplicate Layer 2 rules.  
> **Types:** default **Tier A** (§14.4) — same as Business Cards / Mugs — **no** page-specific types CSS.

---

*Last updated: §14.4 types spacing tiers (A/B/C) + anti-patterns; §22.4 AI types rules; mugs/business cards use Tier A; fit-image Tier C documented.*
