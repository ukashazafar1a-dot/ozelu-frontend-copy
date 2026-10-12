# Cover Photo Section — CSS & Layout Reference (Photos Printing)

> **Canonical visual reference:** `/photos-printing-delivery` — the hero block with main title, subtitle, three step columns (polaroid decorations in the background), and **Place Your Order** CTA.
>
> **Purpose of this document:** Deep read of the Photos Printing cover section so the **same exact CSS, spacing, typography, and layout** can be applied on **every** service page. This is the single source of truth. **Do not implement until you explicitly ask** — use it to audit and plan alignment.
>
> **Related:** `docs/GUIDE-service-page-css.md` §14.1 (short summary) · `docs/GUIDE-service-page-flow.md` (backend customize)

---

## 0. Your requirement (read this first)

### What you want

All printing/service pages that show a **Cover Photo** hero must look and behave like the Photos Printing cover section:

- Same DOM structure and CSS classes
- Same spacing (container padding, column gap, image box height, header margins)
- Same typography (Playfair titles, sans body, exact font sizes)
- Same responsive behavior (3-column flex desktop, Swiper carousel mobile)
- Same CTA styling (`btn--primary-new`)
- Same background treatment (`bgImg-section` + CMS background images)

### What stays different per page (by design)

These are **content**, not layout — they do not break CSS parity:

| Per-page | Source |
|----------|--------|
| Title & subtitle text | Customize → Cover Photo |
| Background image (polaroids, colors) | `bgimgDesktop` / `bgimgMobile` |
| Step images, titles, body copy | `step1…step3` fields |
| CTA scroll target | `#printing-form` on every page (Photos Printing pattern) |

### What must NOT differ (consistency rule)

| Must be identical | Where it lives |
|-------------------|----------------|
| Component markup & class names | `PhotosPrintingDelivery/ThreeColumns.tsx` only |
| Layout CSS | `globals.css` → `/* Cover Photo Section New */` |
| No page-specific cover overrides | Remove Mugs `tables.css` block (§19) |
| No forked `ThreeColumns` copies | Migrate Document / Passport to shared component |

**Policy:** There are **no allowed exceptions** to cover CSS/spacing. The Mugs wider-container override is legacy drift, not a second standard.

---

## Table of contents

0. [Your requirement](#0-your-requirement-read-this-first)
1. [Quick parity checklist](#1-quick-parity-checklist)
2. [Source files](#2-source-files)
3. [Visual anatomy](#3-visual-anatomy)
4. [Complete DOM tree & class list](#4-complete-dom-tree--class-list)
5. [React component & JSX usage](#5-react-component--jsx-usage)
6. [Breakpoints & responsive behavior](#6-breakpoints--responsive-behavior)
7. [Background images (styled-jsx)](#7-background-images-styled-jsx)
8. [Layout & spacing (exact CSS)](#8-layout--spacing-exact-css)
9. [Typography (exact CSS)](#9-typography-exact-css)
10. [Step column internals](#10-step-column-internals)
11. [CTA button](#11-cta-button)
12. [Mobile Swiper carousel](#12-mobile-swiper-carousel)
13. [Step images (`returnImage`)](#13-step-images-returnimage)
14. [CMS / customize fields](#14-cms--customize-fields)
15. [Pages using this component](#15-pages-using-this-component)
16. [Legacy deviations to remove](#16-legacy-deviations-to-remove)
17. [Classes that do NOT apply here](#17-classes-that-do-not-apply-here)
18. [Copy-paste recipe](#18-copy-paste-recipe)
19. [Current state audit (codebase)](#19-current-state-audit-codebase)
20. [Implementation plan (when you are ready)](#20-implementation-plan-when-you-are-ready)

---

## 1. Quick parity checklist

Use this before shipping any page with a cover photo hero.

| # | Rule |
|---|------|
| 1 | Import **`@/screens/PhotosPrintingDelivery/ThreeColumns`** — do not use page-local copies (`DocumentPrinting/ThreeColumns`, `PassportSizePhotos/ThreeColumns`, etc.) unless consolidating later. |
| 2 | Pass **`section={sections.coverPhoto}`** from customize data. |
| 3 | **Never** pass `sectionClassName` — no page-specific cover hooks (remove Mugs override). |
| 4 | **Do not** add Layer 3 CSS that touches `.section--wrapper`, `.inside-main`, `.tc-flex`, `.tc-img-wrapper`, or `.subtitle` under a page wrapper. Those rules live in **`globals.css`** only. |
| 5 | Cover section sits **outside** the inner page content wrapper (`printing-delivery`, `service-page-width`, etc.) — first child after page loader, same as Photos Printing. |
| 6 | CTA scroll target must be **`id="printing-form"`** on the order form section (handled by `ActionBtn.tsx`). |
| 7 | Background images come from customize **`bgimgDesktop`** / **`bgimgMobile`** — not from page wrapper CSS. |

---

## 2. Source files

| Role | Path |
|------|------|
| **Component (canonical)** | `src/screens/PhotosPrintingDelivery/ThreeColumns.tsx` |
| **CTA button** | `src/screens/PhotosPrintingDelivery/ActionBtn.tsx` |
| **Page wiring (reference)** | `src/screens/PhotosPrintingDelivery/Index.tsx` |
| **Route** | `src/app/photos-printing-delivery/page.tsx` |
| **Global cover CSS** | `src/app/globals.css` — block comment `/* Cover Photo Section New */` (~lines 1357–1467) |
| **Design tokens** | `src/app/globals.css` — `:root` (~lines 43–73) |
| **Headings & body text** | `src/app/globals.css` — `.heading-h2`, `.heading-h3`, `.content`, `.sub-heading`, `.font-simple`, `.rte` |
| **CTA styles** | `src/app/globals.css` — `.btn--primary-new` |
| **Step content helper** | `src/helpers/generals.js` — `splitStepContent`, `returnImage`, `htmlDecode` |
| **Customize schema** | `ozelu-backend-v6n/helpers/coverPhotoHeroCustomize.js` (and `photo-print` seed in DB) |

**CSS import chain:** `globals.css` → imports `tables.css`, `forms.css`, etc. No extra CSS import needed on individual pages.

---

## 3. Visual anatomy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  section.section--wrapper.bgImg-section                                       │
│  [full-width background: polaroids + yellow arcs — from bgimgDesktop/Mobile]│
│                                                                               │
│     ┌────────────────────────── inside-main (max 1200px) ──────────────────┐ │
│     │  section--header (mt-3 mb-4)                                          │ │
│     │    h1.heading-h2          ← main title (Playfair, 48px desktop)       │ │
│     │    div.rte.sub-heading    ← subtitle paragraph(s) (20px sans)         │ │
│     │                                                                         │ │
│     │  ┌────────────── tc-flex (desktop) ──────────────┐                     │ │
│     │  │  col 1          col 2          col 3           │  (33.33% each)    │ │
│     │  │  [250px img]    [250px img]    [250px img]      │                     │ │
│     │  │  Step 1         Step 2         Step 3          │  (.heading-h3)    │ │
│     │  │  bold line      bold line      bold line        │  (.subtitle)      │ │
│     │  │  body text      body text      body text        │  (.content)       │ │
│     │  └────────────────────────────────────────────────┘                     │ │
│     │                                                                         │ │
│     │              [ Place Your Order ]  (.btn--primary-new)                  │ │
│     └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Mobile (≤767px JS / ≤768px CSS):** three columns become a **Swiper** carousel (one slide visible, pagination dots, 20px between slides).

---

## 4. Complete DOM tree & class list

### Section root

```html
<section class="section--wrapper bgImg-section tc-main-23jdhi3dljm4 [optional sectionClassName]">
```

| Class | Purpose |
|-------|---------|
| `section--wrapper` | Cover section hook (container rules on child `.inside-main`) |
| `bgImg-section` | Background positioning: center, cover, no-repeat, scroll |
| `tc-main-23jdhi3dljm4` | Styled-jsx hook for dynamic `background-image` URL |
| `{sectionClassName}` | **Do not use.** Legacy: Mugs had `mugs-cover-photo-section` — remove for parity (§16). |

### Inner container

```html
<div class="inside-main">
```

### Header block

```html
<div class="section--header mt-3 mb-4">
  <h1 class="heading-h2 text-center mb-2 p-0 mx-0 mt-0">{title}</h1>
  <div class="rte text-center font-simple sub-heading">{content HTML}</div>
</div>
```

**Bootstrap utilities on title:** `text-center`, `mb-2`, `p-0`, `mx-0`, `mt-0` — these **override** default `.heading-h2 { margin: 25px }` to tight header spacing.

**Bootstrap on header wrapper:** `mt-3` (1rem top), `mb-4` (1.5rem bottom).

### Desktop — three columns

```html
<div class="mb-3 tc-flex">
  <div class="tc-flex-item p-3 d-flex flex-column text-center align-items-center justify-content-start">
    <div class="tc-img-wrapper">
      <img class="three-columns-image lazyload" … />
    </div>
    <p class="heading-h3 fw-bold mb-2">{stepNtitle}</p>
    <div class="rte rte-settings content subtitle">{first &lt;p&gt; or stepNsubtitle}</div>
    <div class="rte rte-settings content">{remaining step body}</div>
  </div>
  <!-- ×3 -->
</div>
```

### Mobile — Swiper

```html
<Swiper class="w-100" …>
  <SwiperSlide class="slides p-3">
    <!-- same inner structure as desktop column -->
  </SwiperSlide>
</Swiper>
```

### CTA row

```html
<div class="d-flex justify-content-center align-items text-center">
  <button type="button" class="btn--primary-new">Place Your Order</button>
</div>
```

---

## 5. React component & JSX usage

### Photos Printing (reference wiring)

```tsx
// src/screens/PhotosPrintingDelivery/Index.tsx
<div className="printing-delivery--wrapper">
  <ThreeColumns section={sections?.coverPhoto ?? null} />
  <div className="printing-delivery">
    {/* rest of page */}
    <div id="printing-form">…</div>
  </div>
</div>
```

### Standard service page

```tsx
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";

{sections?.coverPhoto && (
  <ThreeColumns section={sections.coverPhoto} useH1ForTitle />
)}
```

### Props

| Prop | Default | Notes |
|------|---------|-------|
| `section` | — | Customize block: `{ settings: { title, content, bgimgDesktop, bgimgMobile, step1img…step3content } }` |
| `useH1ForTitle` | `true` | **Currently unused in component body** — title always renders as `<h1>`. Prop kept for API compatibility. |
| `sectionClassName` | `""` | Appended to `<section>`. **Leave empty** for Photos Printing parity. |

---

## 6. Breakpoints & responsive behavior

There are **two breakpoint systems** in this section:

| System | Breakpoint | Effect |
|--------|------------|--------|
| **JavaScript** (`isMobile`) | `window.innerWidth < 768` | Swiper vs flex columns |
| **Styled-jsx background** | desktop `min-width: 769px`, mobile `max-width: 768px` | Which bg image URL |
| **globals.css** | `max-width: 768px` | Padding, flex-direction, Swiper styles |

### Edge case at exactly 768px width

- JS: `768 < 768` → **false** → **desktop flex layout**
- CSS bg: `max-width: 768px` matches → **mobile background image**

This 1px mismatch is existing behavior on Photos Printing. Do not “fix” on one page only — fix globally if ever addressed.

### Desktop vs mobile summary

| Feature | Desktop (≥768 JS / ≥769 bg) | Mobile |
|---------|----------------------------|--------|
| Layout | `.tc-flex` 3 columns | Swiper, 1 slide |
| Container padding | `2em 2em 2.5em` | `2em 1em` |
| Column basis | `calc(33.33% - 0.5em)` | `100%` (flex-col fallback) |
| Step images | 250px height box | 250px height (`!important` on img) |

---

## 7. Background images (styled-jsx)

Defined inline in `ThreeColumns.tsx` (not in globals.css):

```css
@media (min-width: 769px) {
  .tc-main-23jdhi3dljm4 {
    background-image: url({section.settings.bgimgDesktop.src});
  }
}
@media (max-width: 768px) {
  .tc-main-23jdhi3dljm4 {
    background-image: url(
      bgimgMobile.src ?? bgimgDesktop.src
    );
  }
}
```

Combined with `.bgImg-section`:

| Property | Value |
|----------|-------|
| `background-position` | `center center` |
| `background-repeat` | `no-repeat` |
| `background-size` | `cover` |
| `background-attachment` | `scroll` |

**Decorative polaroids / yellow arcs** are part of the **uploaded background image**, not separate DOM elements.

---

## 8. Layout & spacing (exact CSS)

All rules below are in **`src/app/globals.css`** unless noted.

### Container — `.section--wrapper .inside-main`

| Property | Desktop | Mobile `≤768px` |
|----------|---------|-----------------|
| `max-width` | `1200px` | `1200px` |
| `margin` | `auto` | `auto` |
| `padding` | `2em 2em 2.5em` | `2em 1em` |

`2em` ≈ 32px and `2.5em` ≈ 40px at default 16px root font size.

### Flex row — `.tc-flex`

| Property | Value |
|----------|-------|
| `display` | `flex` |
| `align-items` | `flex-start` |
| `justify-content` | `center` |
| `gap` | `0.5em` (~8px) |

Mobile: `flex-direction: column`.

### Columns — `.tc-flex .tc-flex-item`

| Property | Desktop | Mobile |
|----------|---------|--------|
| `flex-basis` | `calc(33.33% - 0.5em)` | `100%` |

Plus Bootstrap on each item:

| Utility | Value |
|---------|-------|
| `p-3` | padding `1rem` all sides |
| `d-flex flex-column` | vertical stack, centered text |
| `text-center align-items-center justify-content-start` | center horizontally, top-align column |

Flex wrapper also has **`mb-3`** → `margin-bottom: 1rem`.

### Image box — `.tc-img-wrapper`

| Property | Value |
|----------|-------|
| `display` | `flex` |
| `align-items` | `center` |
| `justify-content` | `center` |
| `width` | `100%` |
| `min-height` | `250px` |
| `max-height` | `250px` |
| `overflow` | `hidden` |
| `position` | `relative` |

### Image — `.tc-img-wrapper img`

| Property | Desktop | Mobile |
|----------|---------|--------|
| `display` | `block` | `block` |
| `width` | `unset` | `unset` |
| `height` | `250px` | `250px !important` |
| `object-fit` | `contain` | `contain` |

Images are **contain** inside a fixed 250px-tall box (icons/photos align horizontally across columns).

### Step subtitle slot — `.tc-flex-item .subtitle`

| Property | Value |
|----------|-------|
| `width` | `100%` |
| `min-height` | `calc(2 * 20px)` → reserves 2 lines at 20px line-height |
| `margin-bottom` | `5px` |

`.tc-flex-item .subtitle > *:last-child { margin-bottom: 0; }`

### Header spacing (Bootstrap + component overrides)

| Element | Effective spacing |
|---------|-------------------|
| Header block | `margin-top: 1rem` (`mt-3`), `margin-bottom: 1.5rem` (`mb-4`) |
| Title | `margin: 0` sides/top (`mx-0 mt-0 p-0`), `margin-bottom: 0.5rem` (`mb-2`) |
| Subtitle | No extra margin classes — sits directly under title |
| Steps block → CTA | `mb-3` on `.tc-flex` + default flow to centered button |

---

## 9. Typography (exact CSS)

### Design tokens (`:root`)

| Token | Value |
|-------|-------|
| `--secondary-font` | `"Playfair Display", serif` |
| `--simple-font` | `sans-serif` |
| `--bodyFontSize` | `16px` |
| `--btnPrimaryNewBackground` | `#3f6592` |
| `--btnPrimaryNewText` | `#ffffff` |

### Main title — `.heading-h2` (+ utilities)

| Property | Desktop | Mobile `≤768px` |
|----------|---------|-----------------|
| `font-family` | `var(--secondary-font)` | same |
| `font-size` | `48px !important` | `31px !important` |
| `line-height` | `64px !important` | `45px !important` |
| `font-weight` | `800` | `800` |
| `letter-spacing` | `0px` | `0px` |
| `text-align` | `center !important` | same |

**Note:** A second mobile rule at `max-width: 767px` sets `font-size: calc(var(--headingFontSize) * 0.8)` (= 25.6px) but the `≤768px` rule with `31px !important` wins when both apply at 768px; at 767px and below both use `!important` — **31px rule comes later in file and wins**.

Component zeros out default `.heading-h2 { margin: 25px }` via `p-0 mx-0 mt-0 mb-2`.

### Page subtitle — `.rte.font-simple.sub-heading`

| Class | Effect |
|-------|--------|
| `.font-simple` | `font-family: var(--simple-font)` |
| `.sub-heading` | `font-size: calc(var(--bodyFontSize) + 4px)` → **20px** desktop |
| `.sub-heading` mobile | `font-size: calc(var(--bodyFontSize))` → **16px** |
| `.rte` | `word-break: break-word`; first/last child margins zeroed |
| `.text-center` | centered paragraph(s) from CMS |

### Step label — `.heading-h3.fw-bold.mb-2`

| Property | Value |
|----------|-------|
| `font-family` | `var(--secondary-font)` |
| `font-size` | `30px !important` |
| `line-height` | `43px !important` |
| `font-weight` | `800` (`.heading-h3`) + Bootstrap `fw-bold` |
| `text-align` | `center` |
| `margin-bottom` | `0.5rem` (`mb-2`) |

No mobile downsizing for `.heading-h3` in globals.css.

### Step subtitle & body — `.rte.rte-settings.content`

| Property | Value |
|----------|-------|
| `font-family` | `var(--simple-font)` (via `.content`) |
| `font-size` | `16px !important` |
| `font-weight` | `400 !important` |
| `line-height` | `20px !important` |
| `letter-spacing` | `0 !important` |

**Bold step headlines** (e.g. “Upload Your Photos…”) come from **CMS HTML** — typically `<p><strong>…</strong></p>` in the first paragraph of `stepNcontent`, split by `splitStepContent()` into `.subtitle` when `stepNsubtitle` is empty.

`.rte-settings` has **no standalone CSS** — it is a semantic hook only.

---

## 10. Step column internals

### Data mapping (component)

```js
[1, 2, 3].map(stepNum => ({
  image: settings[`step${stepNum}img`],
  title: settings[`step${stepNum}title`],      // "Step 1", etc.
  subtitle: settings[`step${stepNum}subtitle`] // OR first <p> from stepNcontent
  content: rest of stepNcontent
}))
```

### `splitStepContent` behavior

1. If `stepNsubtitle` exists in CMS → use it for `.subtitle`, full `stepNcontent` for `.content`.
2. Else parse `stepNcontent`: **first `<p>…</p>`** → `.subtitle`, remainder → `.content`.

### Vertical rhythm inside one column

```
tc-img-wrapper (250px)
  ↓ block flow
heading-h3 (Step N)
  ↓ mb-2 (0.5rem)
subtitle (min-height 40px, margin-bottom 5px)
  ↓
content (16px / 20px line-height)
```

---

## 11. CTA button

**Component:** `ActionBtn.tsx` — scrolls to `#printing-form` with `behavior: 'smooth'`.

**Classes:** `btn--primary-new`

| Property | Desktop | Mobile `≤768px` |
|----------|---------|-----------------|
| `display` | `block` | `block` |
| `padding` | `12px 20px` | `10px 20px` |
| `font-weight` | `600` | `600` |
| `font-size` | inherited (~16px) | `16px` |
| `border-radius` | `8px` | `8px` |
| `background` | `#3f6592` | same |
| `color` | `#ffffff` | same |
| `border` | `none` | none |
| `text-transform` | `capitalize` | capitalize |
| hover/focus/active | `opacity: 0.9` | same |

**Label:** hard-coded `"Place Your Order"` (not from CMS).

---

## 12. Mobile Swiper carousel

Configured in `ThreeColumns.tsx`:

| Option | Value |
|--------|-------|
| `modules` | Navigation, Pagination, Scrollbar |
| `slidesPerView` | `1` |
| `spaceBetween` | `20` |
| `loop` | `true` |
| `autoHeight` | `true` |
| `pagination` | `{ clickable: true }` |
| `scrollbar` | `{ draggable: true }` |
| `className` | `w-100` |
| Slide class | `slides p-3` |

### Swiper CSS (`globals.css`, mobile block)

| Selector | Key rules |
|----------|-----------|
| `.inside-main .swiper` | `margin: 0 auto 1em`, `padding-bottom: 2em` |
| `.inside-main .swiper .swiper-slide` | flex column, centered, `padding-block: 1.3em`, transparent bg |
| `.inside-main .swiper .swiper-pagination` | `bottom: 0`, `position: absolute` |
| `.swiper-pagination-bullet-active` | `background-color: #3f6592` |

---

## 13. Step images (`returnImage`)

```tsx
returnImage(item?.image, 'three-columns-image', 260)
```

| Aspect | Value |
|--------|-------|
| CSS class on `<img>` | `three-columns-image lazyload` |
| Request width | `260` (Cloudinary nearest width) |
| Cloudinary transform | `f_auto,w_{width},c_fill` |
| Lazy loading | `loading="lazy"` |
| **CSS for `.three-columns-image`** | **None** — sizing comes from `.tc-img-wrapper img` |

Placeholder if missing: S3 placeholder asset (see `generals.js`).

---

## 14. CMS / customize fields

**Section type:** `coverPhoto`  
**Admin label:** Cover Photo

| Field ID | Type | Renders as |
|----------|------|------------|
| `title` | text | `<h1 class="heading-h2 …">` |
| `content` | richtext | `.rte.sub-heading` under title |
| `bgimgDesktop` | image | Desktop background (styled-jsx) |
| `bgimgMobile` | image | Mobile background (fallback: desktop) |
| `step1img` … `step3img` | image | Step illustration in `.tc-img-wrapper` |
| `step1title` … `step3title` | text | `.heading-h3` (“Step 1”, etc.) |
| `step1content` … `step3content` | richtext | Split into `.subtitle` + `.content` |

Optional per-step: `stepNsubtitle` (if added to schema) — bypasses auto-split.

**Save flow:** Customize → **Save** (header) → DB → storefront (production may cache ~5 min via `revalidate`).

---

## 15. Pages using this component

All should import **`PhotosPrintingDelivery/ThreeColumns`**:

| Page | Route slug | `sectionClassName` |
|------|------------|-------------------|
| **Photos Printing** (reference) | `photo-print` | *(none)* |
| Greeting Cards | `greeting-cards-printing` | *(none)* |
| Mugs | `mugs-printing` | `mugs-cover-photo-section` | **Drift — remove** (§16) |
| T-Shirts | `t-shirts-printing` | *(none)* |
| Foam Board | `foam-board-panels-printing` | *(none)* |
| Business Cards | `business-cards-printing` | *(none)* |
| Flyers | `flyers-printing` | *(none)* |
| Stickers | `stickers-printing` | *(none)* |
| Canvas | `canvas-printing` | *(none)* |
| Certificates | `certificates-printing` | *(none)* |

**Legacy separate components** (not yet unified): Document Printing, Passport Size Photos — each has its own `ThreeColumns.tsx` copy; treat Photos Printing as source of truth when migrating.

---

## 16. Legacy deviations to remove

These are the **only** known gaps vs Photos Printing. All must be fixed for your consistency goal.

### 16.1 Mugs — Layer 3 CSS override (`src/css/tables.css`)

```css
@media (min-width: 769px) {
  .mugs-printing-page .mugs-cover-photo-section .inside-main {
    max-width: 1260px;   /* reference: 1200px */
  }
  .mugs-printing-page .mugs-cover-photo-section .tc-flex .tc-flex-item {
    padding-left: 0.625rem;   /* reference: p-3 → 1rem */
    padding-right: 0.625rem;
  }
}
```

**Fix:** Remove `sectionClassName="mugs-cover-photo-section"` from `MugsPrintingPage.tsx` and delete this CSS block.

### 16.2 Forked `ThreeColumns` components

| File | CSS classes same? | Logic differences vs canonical |
|------|-------------------|------------------------------|
| `PhotosPrintingDelivery/ThreeColumns.tsx` | **Reference** | Uses `splitStepContent()` — first `<p>` in `stepNcontent` becomes `.subtitle` |
| `DocumentPrinting/ThreeColumns.tsx` | Yes (identical markup) | No `splitStepContent`; expects explicit `stepNsubtitle` in CMS |
| `PassportSizePhotos/ThreeColumns.tsx` | Yes (identical markup) | CTA is `<Link href="#passport-form">` not `ActionBtn`; img class `near-image` (no CSS) |

**Fix:** Replace local imports with `@/screens/PhotosPrintingDelivery/ThreeColumns`. Ensure form id is `#printing-form` (or extend `ActionBtn` to accept target id — only if needed).

### 16.3 Page wrapper class (cosmetic — does not change cover CSS)

| Page | Root wrapper |
|------|--------------|
| Photos Printing | `printing-delivery--wrapper` |
| Other services | `foam-board-page` (+ optional `{slug}-printing-page`) |

`index.css` / `printing-delivery--wrapper` rules target **lower sections** (banner legacy, `.printing-delivery`, charts) — **not** `.section--wrapper` cover. No wrapper change required for cover parity.

### 16.4 `useH1ForTitle` prop

Photos Printing omits it (defaults `true`). Other pages pass it explicitly. The prop is **unused in component code** — title always renders as `<h1>`. No visual impact.

---

## 17. Classes that do NOT apply here

Do **not** confuse with Photos Printing cover:

| Class | File | Used for |
|-------|------|----------|
| `.cover-photo-heading` | `home.css` | Home / photography banners (72px) |
| `.cover-photo-content` | `home.css` | Home hero descriptions |
| `.printing-delivery` | `photoDeliveryPage.css` | Inner sections below cover on photo page |

---

## 18. Copy-paste recipe

### JSX (minimal)

```tsx
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";

export default function MyPrintingPage({ sections }) {
  return (
    <div className="foam-board-page my-slug-printing-page">
      {sections?.coverPhoto && (
        <ThreeColumns section={sections.coverPhoto} useH1ForTitle />
      )}
      {/* other sections */}
      <div id="printing-form">{/* order form */}</div>
    </div>
  );
}
```

### CSS you should NOT add

```css
/* ❌ DO NOT — already in globals.css */
.my-page .tc-flex { … }
.my-page .inside-main { … }
.my-page .tc-img-wrapper { … }
```

### CSS you MAY add (only with justification)

```css
/* Do not add page-specific cover CSS. See §0 consistency rule. */
```

For **strict Photos Printing parity**, never add cover overrides under page wrappers.

---

## 19. Current state audit (codebase)

*Audited from source — no implementation applied.*

### 19.1 Service pages — cover CSS parity

| Page | Uses canonical `ThreeColumns`? | Cover CSS match? | Notes |
|------|-------------------------------|------------------|-------|
| **Photos Printing** | Yes (local import, same file) | **Reference** | `Index.tsx` — no `sectionClassName` |
| Greeting Cards | Yes | **Match** | Same component, no cover CSS overrides |
| T-Shirts | Yes | **Match** | |
| Foam Board | Yes | **Match** | Cover outside areas `SectionLoader` |
| Business Cards | Yes | **Match** | Wrapper: `foam-board-page` only |
| Flyers | Yes | **Match** | |
| Stickers | Yes | **Match** | |
| Canvas | Yes | **Match** | |
| Certificates | Yes | **Match** | |
| **Mugs** | Yes | **Drift** | `sectionClassName` + `tables.css` → 1260px width, tighter column padding |
| Document Printing | **Fork** | Markup/CSS classes match; logic differs | Own `ThreeColumns.tsx` |
| Passport Size Photos | **Fork** | Markup/CSS classes match; CTA differs | Own `ThreeColumns.tsx`, `#passport-form` |

**Summary:** 9 migrated pages share the canonical component. **1 page (Mugs)** has explicit CSS drift. **2 pages** use duplicate components (same classes today, risk of future drift).

### 19.2 Global CSS — single source for all pages

All cover layout rules live in one place:

```
src/app/globals.css  lines ~1357–1467  /* Cover Photo Section New */
```

No other file defines `.tc-flex`, `.tc-img-wrapper`, or `.section--wrapper .inside-main` for the cover section **except** the Mugs block in `tables.css`.

### 19.3 JSX wiring differences (not CSS — optional normalize later)

These do not change rendered CSS but can affect **when** the cover appears:

| Pattern | Pages | Behavior |
|---------|-------|----------|
| Cover behind full-page `SectionLoader` | Photos Printing, Greeting Cards, Mugs, T-Shirts, Business Cards, … | Cover hidden until `loading === false` |
| Cover always visible when `sections` exist | Foam Board | Cover renders immediately; only form areas wait |

For visual/CSS parity this does not matter once loaded. Normalize only if you want identical loading UX.

### 19.4 CMS content vs CSS

Pages may **look** different if customize data differs (background art, step copy length, missing `stepNsubtitle`). That is content wrapping, not spacing CSS. Canonical component uses `splitStepContent()` so the first paragraph of `stepNcontent` fills `.subtitle` when no separate subtitle field exists — ensure CMS content follows Photos Printing HTML patterns (`<p><strong>Headline</strong></p>` + body).

---

## 20. Implementation plan (when you are ready)

**Do not run this until you ask.** Checklist derived from §0 and §19:

### Phase A — Remove CSS drift (1 file)

1. Delete Mugs cover override in `src/css/tables.css` (lines ~712–722).
2. Remove `sectionClassName="mugs-cover-photo-section"` from `MugsPrintingPage.tsx`.

### Phase B — Consolidate components (2 pages)

1. `DocumentPrinting/Index.tsx` → import `@/screens/PhotosPrintingDelivery/ThreeColumns`.
2. `PassportSizePhotos/Index.tsx` → same; change form id to `printing-form` or shared scroll helper.
3. Delete or deprecate `DocumentPrinting/ThreeColumns.tsx` and `PassportSizePhotos/ThreeColumns.tsx`.

### Phase C — Verify JSX on all service pages

Every page should use exactly:

```tsx
<ThreeColumns section={sections.coverPhoto} />
```

No `sectionClassName`. Optional `useH1ForTitle` is harmless but unnecessary.

### Phase D — Visual QA

Compare each page to `/photos-printing-delivery` at:

- Desktop ≥1200px
- Tablet 768px (note bg/layout edge case in §6)
- Mobile ≤767px (Swiper)

Check: container width, column gaps, 250px image boxes, title/subtitle sizes, CTA button, pagination dot color `#3f6592`.

### Phase E — CMS (admin)

Per page in Customize → Cover Photo: set `bgimgDesktop` / `bgimgMobile` as needed. Content can differ; structure should use same richtext patterns as Photos Printing.

---

## Appendix — full globals.css block (reference)

```css
/* Cover Photo Section New */
.section--wrapper .inside-main {
  max-width: 1200px;
  margin: auto;
  padding: 2em 2em 2.5em;
}
.bgImg-section {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: scroll;
}
.tc-flex {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5em;
}
.tc-flex .tc-flex-item {
  flex-basis: calc(33.33% - 0.5em);
}
.tc-img-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 250px;
  min-height: 250px;
  overflow: hidden;
  position: relative;
  width: 100%;
}
.tc-img-wrapper img {
  object-fit: contain;
  display: block;
  width: unset;
  height: 250px;
}
.tc-flex-item .subtitle {
  width: 100%;
  min-height: calc(2 * 20px);
  margin-bottom: 5px;
}
.tc-flex-item .subtitle > *:last-child {
  margin-bottom: 0;
}
@media (max-width: 768px) {
  .tc-flex { flex-direction: column; }
  .tc-flex .tc-flex-item { flex-basis: 100%; }
  .section--wrapper .inside-main { padding: 2em 1em; }
  .tc-img-wrapper img { height: 250px !important; }
  /* + Swiper rules — see §12 */
}
```

---

*Last audited against `ThreeColumns.tsx` and `globals.css` in `ozelu-frontend-v6n`.*
