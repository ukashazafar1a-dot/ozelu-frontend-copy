/**
 * Certificate printing lamination pricing (storefront).
 * Keys must match admin "Certificate laminations" matrix (`certificate_laminations[].prices`).
 */

export function getCertificateSizePriceKey(size: any, sizeIndex: number): string {
  if (size?._id) return String(size._id);
  const w = Number(size?.width) || 0;
  const h = Number(size?.height) || 0;
  return `w${w}h${h}i${sizeIndex}`;
}

export function getCertificatePrintUnits(file: any): number {
  if (file?.status === "failed") return 0;
  const copies = parseInt(String(file?.count), 10) || 0;
  const pages = parseInt(String(file?.pages), 10) || 1;
  return copies * pages;
}

export function getLaminationUnitPrice(
  certificateLaminations: any[] | null | undefined,
  sizeKey: string,
  laminationType: string | undefined | null,
): number {
  const t = (laminationType || "").trim();
  if (!t || !certificateLaminations?.length) return 0;
  const row = certificateLaminations.find((r) => (r?.type || "").trim() === t);
  if (!row || !row.prices || typeof row.prices !== "object") return 0;
  const n = Number((row.prices as Record<string, unknown>)[sizeKey]);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function buildLaminationSelectOptions(
  certificateLaminations: any[] | null | undefined,
  sizeKey: string,
): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [
    { value: "", label: "No Lamination" },
  ];
  if (!certificateLaminations?.length) return opts;
  for (const row of certificateLaminations) {
    const t = (row?.type || "").trim();
    if (!t) continue;
    const p = getLaminationUnitPrice(certificateLaminations, sizeKey, t);
    opts.push({ value: t, label: `${t} (+${p} AED/print)` });
  }
  return opts;
}

export function getCertificateLaminationTotalForFiles(
  certificateLaminations: any[] | null | undefined,
  sizeKey: string,
  files: any[] | null | undefined,
): number {
  if (!files?.length) return 0;
  let sum = 0;
  for (const f of files) {
    const units = getCertificatePrintUnits(f);
    if (!units) continue;
    sum +=
      units *
      getLaminationUnitPrice(certificateLaminations, sizeKey, f?.lamination);
  }
  return Math.round(sum * 100) / 100;
}

export function getCertificateLaminationBreakdownForSize(
  certificateLaminations: any[] | null | undefined,
  sizeKey: string,
  files: any[] | null | undefined,
): { type: string; quantity: number; unitPrice: number; total: number }[] {
  if (!files?.length) return [];
  const byType = new Map<
    string,
    { type: string; quantity: number; unitPrice: number; total: number }
  >();
  for (const f of files) {
    const t = String(f?.lamination ?? "").trim();
    if (!t) continue;
    const units = getCertificatePrintUnits(f);
    if (!units) continue;
    const unit = getLaminationUnitPrice(certificateLaminations, sizeKey, t);
    const prev = byType.get(t) || {
      type: t,
      quantity: 0,
      unitPrice: unit,
      total: 0,
    };
    prev.quantity += units;
    prev.total += units * unit;
    byType.set(t, prev);
  }
  return Array.from(byType.values())
    .map((row) => ({
      ...row,
      total: Math.round(row.total * 100) / 100,
    }))
    .filter((row) => row.total > 0);
}

export function hasConfiguredCertificateLaminations(
  certificateLaminations: any[] | null | undefined,
): boolean {
  return (
    Array.isArray(certificateLaminations) &&
    certificateLaminations.some((r) => (r?.type || "").trim().length > 0)
  );
}
