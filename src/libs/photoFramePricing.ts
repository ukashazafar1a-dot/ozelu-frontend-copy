/**
 * Photo Frames storefront pricing: one unit price per Frame + Size + Mat.
 * Missing combo = unavailable (strikethrough on UI).
 */

export type PhotoFramePriceRow = {
  _id?: string
  frame?: string | { _id?: string }
  mat_board?: string | { _id?: string } | null
  width: number
  height: number
  price: number
}

export type PhotoFrameSizeOption = { width: number; height: number }

export type PhotoFrameSizeMode = "preset" | "custom"

/** Max for one custom side given the other, allowing sheet rotation. */
export function getFrameCustomSideMax(
  field: "width" | "height",
  otherSide: number,
  maxWidth: number,
  maxHeight: number,
): number {
  const absoluteMax = Math.max(maxWidth, maxHeight)
  if (!Number.isFinite(otherSide) || otherSide <= 0) return absoluteMax
  const allowed: number[] = []
  if (field === "width") {
    if (otherSide <= maxHeight) allowed.push(maxWidth)
    if (otherSide <= maxWidth) allowed.push(maxHeight)
  } else {
    if (otherSide <= maxWidth) allowed.push(maxHeight)
    if (otherSide <= maxHeight) allowed.push(maxWidth)
  }
  return allowed.length > 0 ? Math.max(...allowed) : absoluteMax
}

export function frameSizeFitsMax(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): boolean {
  const w = Number(width)
  const h = Number(height)
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return false
  return (
    (w <= maxWidth && h <= maxHeight) || (w <= maxHeight && h <= maxWidth)
  )
}

/**
 * Smallest preset that fits W×H (incl. rotation) — same spirit as getClosestSize.
 * Used only for size_mode === "custom".
 */
export function findClosestFittingFrameSize(
  presets: PhotoFrameSizeOption[],
  width: number,
  height: number,
): PhotoFrameSizeOption | null {
  const w = Number(width)
  const h = Number(height)
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null
  if (!Array.isArray(presets) || presets.length === 0) return null

  const fitting = presets.filter((page) => {
    const original = page.width >= w && page.height >= h
    const rotated = page.height >= w && page.width >= h
    return original || rotated
  })
  if (fitting.length === 0) return null

  return fitting.reduce((minPage, current) =>
    current.width < minPage.width ? current : minPage,
  )
}

/** Map customer size → priced size for the matrix lookup. */
export function resolveFramePricedSize(
  sizeMode: PhotoFrameSizeMode | undefined,
  width: number,
  height: number,
  presets: PhotoFrameSizeOption[],
): PhotoFrameSizeOption | null {
  const w = Number(width)
  const h = Number(height)
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null

  if (sizeMode === "custom") {
    return findClosestFittingFrameSize(presets, w, h)
  }

  const exact = presets.find((s) => s.width === w && s.height === h)
  return exact ? { width: exact.width, height: exact.height } : null
}

export function isNoneMat(mat: any): boolean {
  if (!mat) return true
  const id = mat._id != null ? String(mat._id) : ""
  if (id === "none") return true
  const slug = String(mat.slug || "").toLowerCase()
  const name = String(mat.name || "").toLowerCase()
  return slug === "none" || name === "none"
}

function rowMatId(row: PhotoFramePriceRow | undefined | null): string | null {
  if (!row) return null
  const m = row.mat_board
  if (m == null || m === "") return null
  return String((m as any)._id ?? m)
}

export function filterPricesForFrame(
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
): PhotoFramePriceRow[] {
  if (!frameId || !Array.isArray(allPrices)) return []
  const id = String(frameId)
  return allPrices.filter((row) => {
    const fid = (row?.frame as any)?._id ?? row?.frame
    return fid != null && String(fid) === id
  })
}

function sameSize(row: PhotoFramePriceRow, width: number, height: number) {
  return Number(row?.width) === Number(width) && Number(row?.height) === Number(height)
}

/** Exact Frame + Size + Mat price row (null mat_board matches None). */
export function findFramePriceRow(
  priceRows: PhotoFramePriceRow[],
  width: number,
  height: number,
  matId: string | null | undefined,
  matIsNone: boolean,
): PhotoFramePriceRow | null {
  if (!Array.isArray(priceRows)) return null
  const w = Number(width)
  const h = Number(height)
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null

  const sized = priceRows.filter((row) => sameSize(row, w, h))
  if (sized.length === 0) return null

  if (matIsNone || matId == null || matId === "" || matId === "none") {
    return (
      sized.find((row) => {
        const mid = rowMatId(row)
        return (
          mid == null ||
          mid === "" ||
          mid === "none" ||
          (matId != null && matId !== "" && mid === String(matId))
        )
      }) || null
    )
  }

  return sized.find((row) => rowMatId(row) === String(matId)) || null
}

/** Preset sizes that have at least one priced mat for this frame. */
export function getFramePresetSizes(
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
): PhotoFrameSizeOption[] {
  const rows = filterPricesForFrame(allPrices, frameId)
  const seen = new Set<string>()
  const out: PhotoFrameSizeOption[] = []
  for (const row of rows) {
    const w = Number(row?.width)
    const h = Number(row?.height)
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) continue
    if (!(Number(row?.price) >= 0)) continue
    const key = `${w}x${h}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ width: w, height: h })
  }
  out.sort((a, b) => a.width - b.width || a.height - b.height)
  return out
}

export function getFrameUnitPrice(
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
  width: number,
  height: number,
  matId?: string | null,
  matIsNone?: boolean,
): number | null {
  const none = matIsNone ?? (!matId || matId === "none")
  const row = findFramePriceRow(
    filterPricesForFrame(allPrices, frameId),
    width,
    height,
    matId,
    none,
  )
  if (!row || !(Number(row.price) >= 0)) return null
  return parseFloat(Number(row.price).toFixed(2))
}

/** Unit price using preset exact match or custom closest-fit, then Size × Mat. */
export function getFrameUnitPriceForMode(
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
  sizeMode: PhotoFrameSizeMode | undefined,
  width: number,
  height: number,
  matId?: string | null,
  matIsNone?: boolean,
): { unit_price: number; priced_width: number; priced_height: number } | null {
  const presets = getFramePresetSizes(allPrices, frameId)
  const priced = resolveFramePricedSize(sizeMode, width, height, presets)
  if (!priced) return null
  const unit = getFrameUnitPrice(
    allPrices,
    frameId,
    priced.width,
    priced.height,
    matId,
    matIsNone,
  )
  if (unit == null) return null
  return {
    unit_price: unit,
    priced_width: priced.width,
    priced_height: priced.height,
  }
}

export function isMatAvailableForSize(
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
  width: number,
  height: number,
  mat: any,
): boolean {
  const none = isNoneMat(mat)
  const matId = mat?._id != null ? String(mat._id) : null
  return (
    getFrameUnitPrice(allPrices, frameId, width, height, matId, none) != null
  )
}

/** Mat availability against the priced size (exact or closest-fit). */
export function isMatAvailableForMode(
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
  sizeMode: PhotoFrameSizeMode | undefined,
  width: number,
  height: number,
  mat: any,
): boolean {
  const presets = getFramePresetSizes(allPrices, frameId)
  const priced = resolveFramePricedSize(sizeMode, width, height, presets)
  if (!priced) return false
  return isMatAvailableForSize(
    allPrices,
    frameId,
    priced.width,
    priced.height,
    mat,
  )
}

/** Prefer None when priced; else first available mat for this size. */
export function pickDefaultMatForSize(
  mats: any[],
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
  width: number,
  height: number,
): any | null {
  if (!Array.isArray(mats) || mats.length === 0) return null
  const noneMat =
    mats.find((m) => isNoneMat(m)) || null
  if (noneMat && isMatAvailableForSize(allPrices, frameId, width, height, noneMat)) {
    return noneMat
  }
  return (
    mats.find((m) => isMatAvailableForSize(allPrices, frameId, width, height, m)) ||
    null
  )
}

export function pickDefaultMatForMode(
  mats: any[],
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
  sizeMode: PhotoFrameSizeMode | undefined,
  width: number,
  height: number,
): any | null {
  const presets = getFramePresetSizes(allPrices, frameId)
  const priced = resolveFramePricedSize(sizeMode, width, height, presets)
  if (!priced) return null
  return pickDefaultMatForSize(
    mats,
    allPrices,
    frameId,
    priced.width,
    priced.height,
  )
}

export function formatFrameSizeLabel(width: number, height: number): string {
  return `${width}×${height} cm`
}

/** @deprecated — use getFrameUnitPrice with mat */
export function getFramePriceMatch(
  allPrices: PhotoFramePriceRow[] | undefined,
  frameId: string | undefined,
  width: number,
  height: number,
  matId?: string | null,
  matIsNone?: boolean,
): { unit_price: number; matched_width: number; matched_height: number } | null {
  const unit = getFrameUnitPrice(allPrices, frameId, width, height, matId, matIsNone)
  if (unit == null) return null
  return { unit_price: unit, matched_width: width, matched_height: height }
}
