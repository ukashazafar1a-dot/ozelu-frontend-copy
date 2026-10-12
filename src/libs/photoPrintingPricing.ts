/**
 * Photo printing lamination pricing helpers (storefront).
 * Keys must match admin "Photo laminations" matrix (`photo_laminations[].prices`).
 */

export function getPhotoSizePriceKey(size: any, sizeIndex: number): string {
  if (size?._id) return String(size._id);
  const w = Number(size?.width) || 0;
  const h = Number(size?.height) || 0;
  const c = size?.custom ? 1 : 0;
  return `w${w}h${h}c${c}i${sizeIndex}`;
}

export function getLaminationUnitPrice(
  photoLaminations: any[] | null | undefined,
  sizeKey: string,
  laminationType: string | undefined | null,
): number {
  const t = (laminationType || "").trim();
  if (!t || !photoLaminations?.length) return 0;
  const row = photoLaminations.find(
    (r) => (r?.type || "").trim() === t,
  );
  if (!row || !row.prices || typeof row.prices !== "object") return 0;
  const n = Number((row.prices as Record<string, unknown>)[sizeKey]);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function buildLaminationSelectOptions(
  photoLaminations: any[] | null | undefined,
  sizeKey: string,
): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [
    { value: "", label: "No Lamination" },
  ];
  if (!photoLaminations?.length) return opts;
  for (const row of photoLaminations) {
    const t = (row?.type || "").trim();
    if (!t) continue;
    const p = getLaminationUnitPrice(photoLaminations, sizeKey, t);
    opts.push({ value: t, label: `${t} (+${p} AED/print)` });
  }
  return opts;
}

export function getLaminationTotalForFiles(
  photoLaminations: any[] | null | undefined,
  sizeKey: string,
  files: any[] | null | undefined,
): number {
  if (!files?.length) return 0;
  let sum = 0;
  for (const f of files) {
    if (f?.status === "failed") continue;
    const c = parseInt(String(f?.count), 10) || 0;
    sum += c * getLaminationUnitPrice(photoLaminations, sizeKey, f?.lamination);
  }
  return Math.round(sum * 100) / 100;
}

/** Order summary lines: one row per selected lamination type with its line total for this size. */
export function getLaminationBreakdownByType(
  photoLaminations: any[] | null | undefined,
  sizeKey: string,
  files: any[] | null | undefined,
): { type: string; total: number }[] {
  if (!files?.length) return [];
  const byType = new Map<string, number>();
  for (const f of files) {
    if (f?.status === "failed") continue;
    const t = String(f?.lamination ?? "").trim();
    if (!t) continue;
    const c = parseInt(String(f?.count), 10) || 0;
    const unit = getLaminationUnitPrice(photoLaminations, sizeKey, t);
    byType.set(t, (byType.get(t) || 0) + c * unit);
  }
  return Array.from(byType.entries())
    .map(([type, total]) => ({
      type,
      total: Math.round(total * 100) / 100,
    }))
    .filter((row) => row.total > 0);
}

export function hasConfiguredPhotoLaminations(
  photoLaminations: any[] | null | undefined,
): boolean {
  return (
    Array.isArray(photoLaminations) &&
    photoLaminations.some((r) => (r?.type || "").trim().length > 0)
  );
}
