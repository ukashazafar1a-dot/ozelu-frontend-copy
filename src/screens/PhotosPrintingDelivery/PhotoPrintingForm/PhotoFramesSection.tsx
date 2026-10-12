"use client"

import React, { useMemo, useState, useEffect } from "react"
import {
  frameSizeFitsMax,
  getFrameCustomSideMax,
  getFramePresetSizes,
  getFrameUnitPriceForMode,
  isMatAvailableForMode,
  isNoneMat,
  pickDefaultMatForMode,
  type PhotoFrameSizeMode,
} from "@/libs/photoFramePricing"
import "./PhotoFramesSection.css"

export type PhotoFrameSelectionData = {
  frame_id: string
  frame_name: string
  mat_board_id: string | null
  mat_board: string
  /** preset = exact matrix size; custom = closest fitting priced size */
  size_mode: PhotoFrameSizeMode
  /** Customer size (typed or preset) */
  width: number
  height: number
  /** Size used for matrix price (same as width/height in preset mode) */
  matched_price_width?: number
  matched_price_height?: number
  quantity: number
  /** null when selected size×mat has no price */
  unit_price: number | null
  line_total: number
  adds_one_delivery_day: boolean
}

/** Multi-select: one entry per selected frame (details kept independently). */
export type PhotoFrameSelections = PhotoFrameSelectionData[]

type Props = {
  frames: any[]
  matBoards: any[]
  prices: any[]
  selections: PhotoFrameSelections
  onChange: (next: PhotoFrameSelections) => void
}

function imageUrl(img: any): string | null {
  if (!img) return null
  if (typeof img === "string") return img
  return img.src || img.url || img.path || null
}

/** Prefer frame×mat preview, then shared mat image, then frame default.
 *  Mat "None" always uses the frame's base image. */
function resolvePreview(frame: any, mat: any): string | null {
  if (isNoneMat(mat)) {
    return imageUrl(frame?.image)
  }
  const matId = mat?._id != null ? String(mat._id) : ""
  const previews = Array.isArray(frame?.mat_previews) ? frame.mat_previews : []
  const fromFrame = matId
    ? previews.find((p: any) => String(p?.mat_board?._id ?? p?.mat_board) === matId)
    : null
  return (
    imageUrl(fromFrame?.image) ||
    imageUrl(mat?.image) ||
    imageUrl(frame?.image)
  )
}

function TruckIcon() {
  return (
    <svg
      className="photo-frames-card__truck"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 7h11v10H3V7zm11 3h4l3 3v4h-7v-7z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18.5" r="1.5" fill="currentColor" />
      <circle cx="17.5" cy="18.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

function upsertSelection(
  list: PhotoFrameSelections,
  nextItem: PhotoFrameSelectionData,
): PhotoFrameSelections {
  const idx = list.findIndex((s) => s.frame_id === nextItem.frame_id)
  if (idx >= 0) {
    const copy = list.slice()
    copy[idx] = nextItem
    return copy
  }
  return [...list, nextItem]
}

function PhotoFramesSection({
  frames,
  matBoards,
  prices,
  selections,
  onChange,
}: Props) {
  const activeFrames = useMemo(
    () => (Array.isArray(frames) ? frames.filter((f) => f && f.is_active !== false && f.name) : []),
    [frames],
  )

  const mats = useMemo(() => {
    const fromSettings = Array.isArray(matBoards) ? matBoards.filter(Boolean) : []
    const hasNone = fromSettings.some((m) => isNoneMat(m))
    if (hasNone) return fromSettings
    return [{ _id: "none", name: "None", slug: "none", image: null }, ...fromSettings]
  }, [matBoards])

  const [sectionEnabled, setSectionEnabled] = useState(selections.length > 0)

  useEffect(() => {
    if (selections.length > 0) setSectionEnabled(true)
  }, [selections.length])

  if (activeFrames.length === 0) return null

  const buildSelection = (
    frame: any,
    existing: PhotoFrameSelectionData | undefined,
    patch: Partial<PhotoFrameSelectionData> = {},
  ): PhotoFrameSelectionData => {
    const frameId = String(frame._id)
    const maxW = Number(frame.max_width) || 100
    const maxH = Number(frame.max_height) || 140
    const sizeMode: PhotoFrameSizeMode = "custom"

    let width = Number(
      patch.width !== undefined ? patch.width : existing ? existing.width : 0,
    )
    let height = Number(
      patch.height !== undefined ? patch.height : existing ? existing.height : 0,
    )

    if (!Number.isFinite(width) || width < 0) width = 0
    if (!Number.isFinite(height) || height < 0) height = 0
    if (width > 0 || height > 0) {
      const widthMax = getFrameCustomSideMax(
        "width",
        height > 0 ? height : 1,
        maxW,
        maxH,
      )
      const heightMax = getFrameCustomSideMax(
        "height",
        width > 0 ? width : 1,
        maxW,
        maxH,
      )
      if (width > widthMax) width = widthMax
      if (height > heightMax) height = heightMax
    }
    width = Math.round(width * 100) / 100
    height = Math.round(height * 100) / 100

    const quantity = Math.max(
      1,
      Number(
        patch.quantity !== undefined
          ? patch.quantity
          : existing
            ? existing.quantity
            : 1,
      ) || 1,
    )

    let matId =
      patch.mat_board_id !== undefined
        ? patch.mat_board_id
        : existing
          ? existing.mat_board_id
          : null

    let mat =
      mats.find((m) => String(m._id) === String(matId)) ||
      pickDefaultMatForMode(mats, prices, frameId, sizeMode, width, height)

    if (mat && !isMatAvailableForMode(prices, frameId, sizeMode, width, height, mat)) {
      mat = pickDefaultMatForMode(mats, prices, frameId, sizeMode, width, height)
    }

    matId = mat?._id != null ? String(mat._id) : null
    const none = isNoneMat(mat)
    const priced = getFrameUnitPriceForMode(
      prices,
      frameId,
      sizeMode,
      width,
      height,
      matId,
      none,
    )
    const unit = priced?.unit_price ?? null
    const lineTotal = unit != null ? parseFloat((unit * quantity).toFixed(2)) : 0

    return {
      frame_id: frameId,
      frame_name: frame.name,
      mat_board_id: none ? null : matId,
      mat_board: none ? "None" : mat?.name || "None",
      size_mode: sizeMode,
      width,
      height,
      matched_price_width: priced?.priced_width,
      matched_price_height: priced?.priced_height,
      quantity,
      unit_price: unit,
      line_total: lineTotal,
      adds_one_delivery_day: true,
    }
  }

  const updateSelection = (
    frame: any,
    patch: Partial<PhotoFrameSelectionData> = {},
  ) => {
    const frameId = String(frame._id)
    const existing = selections.find((s) => s.frame_id === frameId)
    const nextItem = buildSelection(frame, existing, patch)
    onChange(upsertSelection(selections, nextItem))
  }

  const removeSelection = (frameId: string) => {
    onChange(selections.filter((s) => s.frame_id !== frameId))
  }

  const clearSelections = () => onChange([])

  const handleSectionToggle = (checked: boolean) => {
    setSectionEnabled(checked)
    if (!checked) clearSelections()
  }

  const toggleFrame = (frame: any, checked: boolean) => {
    const frameId = String(frame._id)
    if (!checked) {
      removeSelection(frameId)
      return
    }
    const existing = selections.find((s) => s.frame_id === frameId)
    onChange(upsertSelection(selections, buildSelection(frame, existing, {})))
  }

  return (
    <div className="photo-frames-section">
      <div className="photo-frames-section__header">
        <div className="checkbox-container polaroid-enable-toggle">
          <input
            type="checkbox"
            id="photo-frames-enable"
            checked={sectionEnabled}
            onChange={(e) => handleSectionToggle(e.target.checked)}
          />
          <label className="margin-left-15" htmlFor="photo-frames-enable">
            Add Photo Frames (Optional)
          </label>
        </div>
        {selections.length > 0 ? (
          <button type="button" className="photo-frames-section__clear" onClick={clearSelections}>
            Clear
          </button>
        ) : null}
      </div>

      {sectionEnabled ? (
        <div className="photo-frames-section__scroll">
          {activeFrames.map((frame) => {
            const frameId = String(frame._id)
            const selection = selections.find((s) => s.frame_id === frameId)
            const isSelected = Boolean(selection)
            const sizes = getFramePresetSizes(prices, frameId)
            const sizeMode: PhotoFrameSizeMode = "custom"
            const width = selection ? selection.width : 0
            const height = selection ? selection.height : 0
            const quantity = selection ? selection.quantity : 1
            const maxW = Number(frame.max_width) || 100
            const maxH = Number(frame.max_height) || 140
            const hasCustomSize = width > 0 && height > 0
            const noneMat = mats.find((m) => isNoneMat(m)) || null

            let mat: any
            if (!hasCustomSize) {
              mat = noneMat
            } else {
              mat = selection
                ? mats.find((m) => String(m._id) === String(selection.mat_board_id)) ||
                  (selection.mat_board_id == null ? noneMat : null)
                : pickDefaultMatForMode(mats, prices, frameId, sizeMode, width, height)

              if (
                mat &&
                !isMatAvailableForMode(prices, frameId, sizeMode, width, height, mat)
              ) {
                mat = pickDefaultMatForMode(mats, prices, frameId, sizeMode, width, height)
              }
            }

            const matId = mat?._id != null ? String(mat._id) : ""
            const none = isNoneMat(mat)
            const preview = resolvePreview(frame, mat)
            const priced = getFrameUnitPriceForMode(
              prices,
              frameId,
              sizeMode,
              width,
              height,
              matId || null,
              none,
            )
            const unit = priced?.unit_price ?? null

            const widthMax = getFrameCustomSideMax("width", height, maxW, maxH)
            const heightMax = getFrameCustomSideMax("height", width, maxW, maxH)
            const customFitsMax = frameSizeFitsMax(width, height, maxW, maxH)

            return (
              <div
                key={frameId}
                role="button"
                tabIndex={0}
                className={`photo-frames-card${isSelected ? " is-selected" : ""}`}
                onClick={() => {
                  if (!isSelected) toggleFrame(frame, true)
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isSelected) {
                    e.preventDefault()
                    toggleFrame(frame, true)
                  }
                }}
              >
                <label
                  className="photo-frames-card__radio"
                  aria-label={`Select ${frame.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    name={`photo_frame_${frameId}`}
                    checked={isSelected}
                    onChange={(e) => toggleFrame(frame, e.target.checked)}
                  />
                </label>

                <div className="photo-frames-card__preview">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt={frame.name} />
                  ) : (
                    <div className="photo-frames-card__preview-empty">No image</div>
                  )}
                </div>

                <div className="photo-frames-card__name">{frame.name}</div>

                <div
                  className="photo-frames-card__field"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="photo-frames-card__custom">
                    <div className="photo-frames-card__custom-row">
                      <div className="photo-frames-card__custom-field">
                        <label htmlFor={`photo-frame-w-${frameId}`}>Width (cm)</label>
                        <input
                          id={`photo-frame-w-${frameId}`}
                          type="number"
                          min={0}
                          max={widthMax}
                          step={1}
                          value={width === 0 ? "" : width}
                          onFocus={() => {
                            if (!isSelected) {
                              updateSelection(frame, {
                                size_mode: "custom",
                                width: 0,
                                height: 0,
                                quantity,
                                mat_board_id: null,
                              })
                            }
                          }}
                          onChange={(e) => {
                            const next = Number(e.target.value)
                            updateSelection(frame, {
                              size_mode: "custom",
                              width: Number.isFinite(next) ? next : width,
                              height,
                              quantity,
                              mat_board_id: matId || null,
                            })
                          }}
                        />
                      </div>
                      <span className="photo-frames-card__custom-x" aria-hidden="true">
                        ×
                      </span>
                      <div className="photo-frames-card__custom-field">
                        <label htmlFor={`photo-frame-h-${frameId}`}>Height (cm)</label>
                        <input
                          id={`photo-frame-h-${frameId}`}
                          type="number"
                          min={0}
                          max={heightMax}
                          step={1}
                          value={height === 0 ? "" : height}
                          onFocus={() => {
                            if (!isSelected) {
                              updateSelection(frame, {
                                size_mode: "custom",
                                width: 0,
                                height: 0,
                                quantity,
                                mat_board_id: null,
                              })
                            }
                          }}
                          onChange={(e) => {
                            const next = Number(e.target.value)
                            updateSelection(frame, {
                              size_mode: "custom",
                              width,
                              height: Number.isFinite(next) ? next : height,
                              quantity,
                              mat_board_id: matId || null,
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="photo-frames-card__max">
                    <span className="photo-frames-card__max-label">Max Size:</span>{" "}
                    <span className="photo-frames-card__max-value">
                      {maxW} × {maxH} cm
                    </span>
                  </p>
                  {isSelected && hasCustomSize && !customFitsMax ? (
                    <p className="photo-frames-card__price-hint">
                      Size exceeds max for this frame
                    </p>
                  ) : null}
                </div>

                <div
                  className="photo-frames-card__field"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label htmlFor={`photo-frame-mat-${frameId}`}>Mat Board</label>
                  <select
                    id={`photo-frame-mat-${frameId}`}
                    value={matId}
                    disabled={sizes.length === 0 || !hasCustomSize}
                    onFocus={() => {
                      if (!isSelected) {
                        updateSelection(frame, {
                          size_mode: sizeMode,
                          width,
                          height,
                          quantity,
                          mat_board_id: matId || null,
                        })
                      }
                    }}
                    onChange={(e) => {
                      const nextId = e.target.value || null
                      updateSelection(frame, {
                        size_mode: sizeMode,
                        width,
                        height,
                        quantity,
                        mat_board_id: nextId,
                      })
                    }}
                  >
                    {mats.map((m) => {
                      const available =
                        !hasCustomSize ||
                        isMatAvailableForMode(
                          prices,
                          frameId,
                          sizeMode,
                          width,
                          height,
                          m,
                        )
                      const mid = m._id != null ? String(m._id) : ""
                      return (
                        <option key={mid || m.name} value={mid} disabled={!available}>
                          {available ? m.name : `${m.name} (unavailable)`}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="photo-frames-card__price">
                  {unit != null ? (
                    <>
                      <div className="photo-frames-card__price-row">
                        <span className="photo-frames-card__price-amount">
                          AED {unit}
                        </span>
                        <span className="photo-frames-card__price-unit">
                          {" "}
                          / Frame
                        </span>
                      </div>
                      {isSelected && quantity > 1 ? (
                        <div className="photo-frames-card__line-total">
                          {quantity} × {unit} = AED{" "}
                          {(selection?.line_total ?? unit * quantity).toFixed(2)}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div>No price</div>
                      {sizes.length === 0 || hasCustomSize ? (
                        <div className="photo-frames-card__price-hint">
                          {sizes.length === 0
                            ? "Add Size × Mat prices in Settings"
                            : "No priced size fits this custom size"}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>

                <div
                  className="photo-frames-card__qty-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="photo-frames-card__qty-label">Quantity</div>
                  <div className="photo-frames-card__qty">
                    <button
                      type="button"
                      disabled={!isSelected || quantity <= 1}
                      onClick={() => {
                        if (!isSelected) return
                        updateSelection(frame, {
                          size_mode: sizeMode,
                          width,
                          height,
                          quantity: Math.max(1, quantity - 1),
                          mat_board_id: matId || null,
                        })
                      }}
                    >
                      −
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      disabled={!isSelected}
                      onClick={() => {
                        if (!isSelected) return
                        updateSelection(frame, {
                          size_mode: sizeMode,
                          width,
                          height,
                          quantity: quantity + 1,
                          mat_board_id: matId || null,
                        })
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="photo-frames-card__delivery">
                  <TruckIcon />
                  <span>+1 Day to Deliver</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default PhotoFramesSection
