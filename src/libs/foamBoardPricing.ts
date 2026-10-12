/**
 * Foam board display / mounting / lamination pricing helpers (storefront).
 * Keys must match admin matrix (`foam_board_*[].prices`).
 * Option labels and prices come only from Settings & SEO — no hardcoded types.
 */

import { getClosestSize } from "@/helpers/generals";
import type { FoamBoardOptionMatrixRow } from "./types";

export type { FoamBoardOptionMatrixRow };

export function getFoamBoardSizePriceKey(size: any, sizeIndex: number): string {
  if (size?._id) return String(size._id);
  const w = Number(size?.width) || 0;
  const h = Number(size?.height) || 0;
  const c = size?.custom ? 1 : 0;
  return `w${w}h${h}c${c}i${sizeIndex}`;
}

/**
 * Key for display / mounting / lamination admin matrices.
 * Preset sizes use Mongo `_id`. Custom sizes use the closest preset's `_id`
 * (same nearest-size rule as thickness pricing on the order form).
 */
export function getFoamBoardAddOnPriceKey(
  size: any,
  presetSizes: any[] | null | undefined,
): string {
  if (!size?.custom && size?._id) {
    return String(size._id);
  }
  const presets = (presetSizes || []).filter((s) => !s?.custom);
  const w = Number(size?.width) || 0;
  const h = Number(size?.height) || 0;
  const closest = getClosestSize(presets, w, h);
  if (closest?._id) {
    return String(closest._id);
  }
  return getFoamBoardSizePriceKey(size, 0);
}

export function getOptionUnitPrice(
  rows: FoamBoardOptionMatrixRow[] | null | undefined,
  sizeKey: string,
  optionType: string | undefined | null,
): number {
  const t = (optionType || "").trim();
  if (!t || !rows?.length) return 0;
  const row = rows.find((r) => (r?.type || "").trim() === t);
  if (!row || !row.prices || typeof row.prices !== "object") return 0;
  const n = Number((row.prices as Record<string, unknown>)[sizeKey]);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** True when at least one option has a non-zero price for this size (admin matrix). */
export function hasFoamBoardOptionsForSize(
  rows: FoamBoardOptionMatrixRow[] | null | undefined,
  sizeKey: string,
): boolean {
  if (!rows?.length) return false;
  return rows.some((row) => {
    const t = (row?.type || "").trim();
    return t.length > 0 && getOptionUnitPrice(rows, sizeKey, t) > 0;
  });
}

/** Drop selections that are unavailable (0 price) for the current size. */
export function resolveFoamBoardOptionSelection(
  rows: FoamBoardOptionMatrixRow[] | null | undefined,
  sizeKey: string,
  selected: string | undefined | null,
): string {
  const t = (selected || "").trim();
  if (!t) return "";
  return getOptionUnitPrice(rows, sizeKey, t) > 0 ? t : "";
}

export function coerceFoamBoardSelectValue(
  value: string | undefined | null,
  options: { value: string }[],
): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  return options.some((o) => o.value === v) ? v : "";
}

export function buildOptionSelectOptions(
  rows: FoamBoardOptionMatrixRow[] | null | undefined,
  sizeKey: string,
  noOptionLabel: string,
): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [
    { value: "", label: noOptionLabel },
  ];
  if (!rows?.length) return opts;
  for (const row of rows) {
    const t = (row?.type || "").trim();
    if (!t) continue;
    const p = getOptionUnitPrice(rows, sizeKey, t);
    if (p <= 0) continue;
    opts.push({
      value: t,
      label: `${t} (+${p} AED/Panel)`,
    });
  }
  return opts;
}

export function getOptionTotalForFiles(
  rows: FoamBoardOptionMatrixRow[] | null | undefined,
  sizeKey: string,
  files: any[] | null | undefined,
  fieldName: "display" | "mounting" | "lamination",
): number {
  if (!files?.length) return 0;
  let sum = 0;
  for (const f of files) {
    if (f?.status === "failed") continue;
    const c = parseInt(String(f?.count), 10) || 0;
    sum += c * getOptionUnitPrice(rows, sizeKey, f?.[fieldName]);
  }
  return Math.round(sum * 100) / 100;
}

export type FoamBoardOptionBreakdownRow = {
  type: string;
  count: number;
  unitPrice: number;
  total: number;
};

export function getOptionBreakdownByType(
  rows: FoamBoardOptionMatrixRow[] | null | undefined,
  sizeKey: string,
  files: any[] | null | undefined,
  fieldName: "display" | "mounting" | "lamination",
): FoamBoardOptionBreakdownRow[] {
  if (!files?.length) return [];
  const byType = new Map<
    string,
    { count: number; unitPrice: number; total: number }
  >();
  for (const f of files) {
    if (f?.status === "failed") continue;
    const t = String(f?.[fieldName] ?? "").trim();
    if (!t) continue;
    const c = parseInt(String(f?.count), 10) || 0;
    const unit = getOptionUnitPrice(rows, sizeKey, t);
    const lineTotal = c * unit;
    const prev = byType.get(t);
    if (prev) {
      byType.set(t, {
        count: prev.count + c,
        unitPrice: unit,
        total: Math.round((prev.total + lineTotal) * 100) / 100,
      });
    } else {
      byType.set(t, {
        count: c,
        unitPrice: unit,
        total: Math.round(lineTotal * 100) / 100,
      });
    }
  }
  return Array.from(byType.entries())
    .map(([type, row]) => ({ type, ...row }))
    .filter((row) => row.total > 0);
}

export function hasConfiguredFoamBoardOptions(
  rows: FoamBoardOptionMatrixRow[] | null | undefined,
): boolean {
  return (
    Array.isArray(rows) &&
    rows.some((r) => (r?.type || "").trim().length > 0)
  );
}

export function getFoamBoardFileAddOnTotal(
  file: any,
  sizeKey: string,
  displayRows: FoamBoardOptionMatrixRow[] | null | undefined,
  mountingRows: FoamBoardOptionMatrixRow[] | null | undefined,
  laminationRows: FoamBoardOptionMatrixRow[] | null | undefined,
): number {
  if (!file || file?.status === "failed") return 0;
  const c = parseInt(String(file?.count), 10) || 0;
  const display = getOptionUnitPrice(displayRows, sizeKey, file?.display);
  const mounting = getOptionUnitPrice(mountingRows, sizeKey, file?.mounting);
  const lamination = getOptionUnitPrice(
    laminationRows,
    sizeKey,
    file?.lamination,
  );
  return Math.round(c * (display + mounting + lamination) * 100) / 100;
}
