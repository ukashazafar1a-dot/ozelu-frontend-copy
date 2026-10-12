export type PolaroidDiscount = {
  percentage?: number;
  range?: string;
};

export type PolaroidStyle = {
  _id?: string;
  name?: string;
  paper_width_cm?: number;
  paper_height_cm?: number;
  photo_width_cm?: number;
  photo_height_cm?: number;
  price?: number;
  discounts?: PolaroidDiscount[];
  image?: { src?: string; url?: string; _id?: string } | string | null;
  files?: any[];
  uiOpen?: boolean;
};

/** XSS sanitizer on save may turn `<12` into `&lt;12` — decode for display and matching. */
export function decodePolaroidDiscountRange(
  range: string | number | null | undefined,
): string {
  return String(range ?? "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .trim();
}

/** Single decimal for polaroid card prices (e.g. 3.9 not 3.90). */
export function formatPolaroidPrintPrice(price: number | null | undefined): string {
  const n = Number(price);
  if (!Number.isFinite(n)) return "0";
  return parseFloat(n.toFixed(1)).toString();
}

export function formatPolaroidCmDimension(
  value: number | null | undefined,
): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatPolaroidPaperSizeDimensions(style: PolaroidStyle): string {
  const w = formatPolaroidCmDimension(style.paper_width_cm);
  const h = formatPolaroidCmDimension(style.paper_height_cm);
  return `${w}x${h}cm`;
}

export function formatPolaroidPhotoSizeDimensions(style: PolaroidStyle): string {
  const w = formatPolaroidCmDimension(style.photo_width_cm);
  const h = formatPolaroidCmDimension(style.photo_height_cm);
  return `${w}x${h}cm`;
}

export function formatPolaroidDiscountTierLabel(discount: PolaroidDiscount): string {
  const pct = Number(discount?.percentage) || 0;
  const raw = decodePolaroidDiscountRange(discount?.range);
  if (!pct || !raw) return "";
  return `${pct}% Off for Qty ${raw}`;
}

export function getPolaroidDiscountTierLabels(style: PolaroidStyle): string[] {
  return (style?.discounts || [])
    .map((d) => formatPolaroidDiscountTierLabel(d))
    .filter(Boolean);
}

/** Same quantity-range rules as standard photo sizes in PhotoPrintingForm. */
export function matchesQuantityDiscountRange(
  range: string | number | null | undefined,
  quantity: number,
): boolean {
  const r = decodePolaroidDiscountRange(range);
  if (/^>=\d+$/.test(r)) {
    return quantity >= parseInt(r.slice(2), 10);
  }
  if (/^<=\d+$/.test(r)) {
    return quantity <= parseInt(r.slice(2), 10);
  }
  if (/^\d+-\d+$/.test(r)) {
    const [min, max] = r.split("-").map(Number);
    return quantity >= min && quantity <= max;
  }
  if (/^>\d+$/.test(r)) {
    return quantity > parseInt(r.slice(1), 10);
  }
  if (/^<\d+$/.test(r)) {
    return quantity < parseInt(r.slice(1), 10);
  }
  if (/^\d+$/.test(r)) {
    return quantity === parseInt(r, 10);
  }
  return false;
}

export function getPolaroidDiscountedPrice(style: PolaroidStyle): {
  compare_at_price: number;
  price: number | null;
} {
  const compare_at_price = Number(style?.price) || 0;
  if (!compare_at_price) {
    return { compare_at_price: 0, price: null };
  }

  const quantity = getPolaroidQuantity(style);
  if (quantity === 0) {
    return { compare_at_price, price: null };
  }

  let applicable: PolaroidDiscount | null = null;
  for (const discount of style?.discounts || []) {
    if (matchesQuantityDiscountRange(discount?.range, quantity)) {
      const pct = Number(discount?.percentage) || 0;
      const prev = applicable ? Number(applicable.percentage) || 0 : 0;
      if (!applicable || pct > prev) {
        applicable = discount;
      }
    }
  }

  const matchedDiscount: PolaroidDiscount | null = applicable;
  if (matchedDiscount) {
    const pct = Number(matchedDiscount.percentage) || 0;
    const discounted =
      compare_at_price - compare_at_price * (pct / 100);
    return {
      compare_at_price,
      price: parseFloat(discounted.toFixed(2)),
    };
  }

  return { compare_at_price, price: null };
}

export function getPolaroidLaminationKey(
  style: PolaroidStyle,
  styleIndex: number,
): string {
  if (style?._id) return `polaroid:${String(style._id)}`;
  return `polaroid:idx:${styleIndex}`;
}

/** Human-readable dimensions for order breakdown and admin (Paper/Photo capitalized). */
export function formatPolaroidDisplayDimensions(style: PolaroidStyle): string {
  const pw = formatPolaroidCmDimension(style?.paper_width_cm);
  const ph = formatPolaroidCmDimension(style?.paper_height_cm);
  const fw = formatPolaroidCmDimension(style?.photo_width_cm);
  const fh = formatPolaroidCmDimension(style?.photo_height_cm);
  return `(Paper ${pw}×${ph} cm, Photo ${fw}×${fh} cm)`;
}

/** Stored on each order line item / file — used for grouping and breakdown. */
export function getPolaroidOrderSizeLabel(style: PolaroidStyle): string {
  const name = (style?.name || "Polaroid").trim();
  return `${name} ${formatPolaroidDisplayDimensions(style)}`.trim();
}

/** Normalize legacy stored labels (Polaroid — prefix, lowercase paper/photo, polaroid: keys). */
export function formatPolaroidOrderSizeForDisplay(
  storedSize: string | null | undefined,
): string {
  if (storedSize == null || storedSize === "") return "";
  let s = String(storedSize).trim();
  s = s.replace(/^Polaroid\s*[-—]\s*/i, "");
  s = s.replace(/polaroid[:_]+/gi, "");
  s = s.replace(/\(\s*paper\s/gi, "(Paper ");
  s = s.replace(/,\s*photo\s/gi, ", Photo ");
  return s.trim();
}

export function isPolaroidOrderSizeLabel(
  size: string | null | undefined,
): boolean {
  if (!size || typeof size !== "string") return false;
  return (
    /^Polaroid\s*[-—]/i.test(size) ||
    /\(paper\s/i.test(size) ||
    /\(Paper\s/i.test(size) ||
    /polaroid[:_]/i.test(size)
  );
}

export function getPolaroidQuantity(style: PolaroidStyle): number {
  let q = 0;
  (style?.files || []).forEach((f: any) => {
    if (f?.status === "failed") return;
    q += parseInt(String(f?.count), 10) || 0;
  });
  return q;
}

/** Card images come from SEO & Settings (`photo_polaroid_styles[].image`). */
export function mergePolaroidCards(
  styles: PolaroidStyle[] | null | undefined,
): (PolaroidStyle & { imageUrl?: string | null })[] {
  const list = Array.isArray(styles) ? styles : [];
  return list.map((style) => {
    const image = style?.image;
    const imageUrl =
      typeof image === "object" && image
        ? image.src || image.url || null
        : typeof image === "string"
          ? image
          : null;
    return { ...style, imageUrl };
  });
}
