"use client";

import React, { useId } from "react";
import ImageDropzone from "@/components/Dropzones/ImageDropzone";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import { BUSINESS_CARD_FILE_TYPES } from "@/constants/uploadSupportedTypes";
import { getPlacementUnitPrice } from "@/helpers/generals";
import { generateUniqueKey } from "@/helpers/generals";

export type PlacementRow = {
  id: string;
  placement: string;
  files: any[];
};

type Placement = { value: string; price?: number; prices?: { range: string; price: number }[] };

type Props = {
  rows: PlacementRow[];
  setRows: (rows: PlacementRow[]) => void;
  placements: Placement[];
  blockTotalQty?: number;
  onPriceChange?: () => void;
};

export function createDefaultPlacementRow(): PlacementRow {
  return {
    id: generateUniqueKey(),
    placement: "",
    files: [],
  };
}

export default function TShirtFileUploadRow({
  rows,
  setRows,
  placements,
  blockTotalQty = 0,
  onPriceChange,
}: Props) {
  const fieldIdPrefix = useId();
  const slotOptions = placements || [];

  const updateRow = (rowId: string, patch: Partial<PlacementRow>) => {
    setRows(
      rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
    );
    onPriceChange?.();
  };

  const removeRow = (rowId: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((row) => row.id !== rowId));
    onPriceChange?.();
  };

  const addRow = () => {
    const used = new Set(rows.map((row) => row.placement).filter(Boolean));
    const nextPlacement = slotOptions.find((slot) => !used.has(slot.value));
    setRows([
      ...rows,
      {
        ...createDefaultPlacementRow(),
        placement: nextPlacement?.value || "",
      },
    ]);
    onPriceChange?.();
  };

  const updateRowFiles = (rowId: string, placement: string, slotFiles: any[]) => {
    const placementPrice = getPlacementUnitPrice(
      placements,
      placement,
      blockTotalQty || 1
    );
    const tagged = (slotFiles || []).slice(0, 1).map((file: any) => {
      if (file instanceof File || file instanceof Blob) {
        return Object.assign(file, {
          field: placement,
          placement,
          placement_price: placementPrice,
        });
      }
      return {
        ...file,
        name: file?.name || file?.filename,
        field: placement,
        placement,
        placement_price: placementPrice,
      };
    });

    updateRow(rowId, { files: tagged });
  };

  const getPlacementOptionsForRow = (currentPlacement: string) => {
    const used = new Set(
      rows.map((r) => r.placement).filter((p) => p && p !== currentPlacement)
    );
    return slotOptions
      .filter((slot) => !used.has(slot.value))
      .map((slot) => ({ value: slot.value, label: slot.value }));
  };

  if (!slotOptions.length) return null;

  return (
    <div className="t-shirts-placement-rows">
      {rows.map((row, index) => {
        const selectedBeforeCount = rows
          .slice(0, index)
          .filter((item) => item.placement).length;
        const isFirstSelectedPlacement =
          !!row.placement && selectedBeforeCount === 0;
        const placementUnitPrice = row.placement
          ? getPlacementUnitPrice(
              placements,
              row.placement,
              blockTotalQty || 1
            )
          : 0;
        const isIncluded = isFirstSelectedPlacement;
        const selectId = `${fieldIdPrefix}-placement-${row.id}`;

        return (
          <div key={row.id} className="t-shirts-placement-card">
            <div className="t-shirts-placement-card__header">
              <div className="t-shirts-placement-card__select-wrap">
                <label htmlFor={selectId} className="order-option-label">
                  Placement
                </label>
                <select
                  id={selectId}
                  className="selectOptionsCustom new-custom-field-rf t-shirts-placement-card__select"
                  value={row.placement}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateRow(row.id, {
                      placement: value,
                      files: [],
                    });
                  }}
                >
                  <option value="" disabled>
                    Select placement
                  </option>
                  {getPlacementOptionsForRow(row.placement).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {row.placement &&
                    !getPlacementOptionsForRow(row.placement).some(
                      (o) => o.value === row.placement
                    ) && (
                      <option value={row.placement}>{row.placement}</option>
                    )}
                </select>
              </div>

              {row.placement && (
                <div className="t-shirts-placement-card__badges">
                  <span
                    className={`t-shirts-placement-badge ${
                      isIncluded
                        ? "t-shirts-placement-badge--included"
                        : "t-shirts-placement-badge--charge"
                    }`}
                  >
                    {isIncluded ? "Included" : "Additional Charge"}
                  </span>
                  <span
                    className={`t-shirts-placement-price ${
                      isIncluded
                        ? "t-shirts-placement-price--included"
                        : "t-shirts-placement-price--charge"
                    }`}
                  >
                    +{isIncluded ? 0 : placementUnitPrice} AED / Piece
                  </span>
                  <span
                    className="t-shirts-placement-info"
                    title="First selected placement is included in the shirt price. Extra placements are charged per shirt based on total quantity."
                    aria-label="Placement pricing info"
                  >
                    i
                  </span>
                </div>
              )}

              <div className="t-shirts-placement-card__actions">
                <FileUploadingStatus files={row.files || []} />
                {rows.length > 1 && (
                  <button
                    type="button"
                    className="t-shirts-placement-card__remove"
                    onClick={() => removeRow(row.id)}
                    aria-label="Remove placement"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#e58383"
                      height="22"
                      width="22"
                      viewBox="0 -960 960 960"
                    >
                      <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {row.placement && (
              <div className="custom-dropzone--container t-shirts-placement-card__dropzone">
                <ImageDropzone
                  orderType="T_SHIRT_PRINT"
                  files={row.files || []}
                  setFiles={(nextFiles: any[]) =>
                    updateRowFiles(row.id, row.placement, nextFiles)
                  }
                  zoom={true}
                  page="psp-page"
                  allowPdf={true}
                />
                <UploadInfoLabel supportedTypes={BUSINESS_CARD_FILE_TYPES} />
              </div>
            )}
          </div>
        );
      })}

      {rows.length < slotOptions.length && (
        <button
          type="button"
          className="t-shirts-add-placement-btn"
          onClick={addRow}
        >
          + Add Another Placement
        </button>
      )}
    </div>
  );
}
