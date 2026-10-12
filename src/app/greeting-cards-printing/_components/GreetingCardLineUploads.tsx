"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import ImageDropzone from "../../../components/Dropzones/ImageDropzone";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import { BUSINESS_CARD_FILE_TYPES } from "@/constants/uploadSupportedTypes";

const UPLOAD_SLOTS = [
  { key: "Front View", label: "Upload Image for Front" },
  { key: "Left Page", label: "Upload Image for Inside Left Page" },
  { key: "Right Page", label: "Upload Image for Inside Right Page" },
  { key: "Back View", label: "Upload Image for Back" },
];

const INSIDE_PAGE_SLOT_KEYS = new Set(["Left Page", "Right Page"]);

/** Flat sizes have no inside pages — admin uses "(Flat)" or names like "Standard Flat". */
export function isFlatGreetingCardSizeName(name?: string | null) {
  const normalized = (name ?? "").toLowerCase().trim();
  if (!normalized) return false;
  if (normalized.includes("folded")) return false;
  return normalized.includes("(flat)") || /\bflat\b/.test(normalized);
}

const buildInitialEnabledSlots = (files: any[]) => {
  const initial: Record<string, boolean> = {};
  UPLOAD_SLOTS.forEach((slot) => {
    initial[slot.key] = (files || []).some((file) => file?.field === slot.key);
  });
  return initial;
};

type Props = {
  files: any[];
  setFiles: (files: any[]) => void;
  isFlat?: boolean;
};

const GreetingCardLineUploads = ({ files, setFiles, isFlat = false }: Props) => {
  const fieldIdPrefix = useId();
  const [enabledSlots, setEnabledSlots] = useState<Record<string, boolean>>(() =>
    buildInitialEnabledSlots(files)
  );

  const visibleSlots = useMemo(
    () =>
      isFlat
        ? UPLOAD_SLOTS.filter((slot) => !INSIDE_PAGE_SLOT_KEYS.has(slot.key))
        : UPLOAD_SLOTS,
    [isFlat]
  );

  const getSlotFiles = (slotKey: string) =>
    (files || []).filter((file) => file?.field === slotKey);

  const updateSlotFiles = (slotKey: string, slotFiles: any[]) => {
    const others = (files || []).filter((file) => file?.field !== slotKey);
    // Keep File/Blob instances intact — object spread drops non-enumerable `name`.
    const tagged = (slotFiles || []).map((file) => {
      if (file instanceof File || file instanceof Blob) {
        return Object.assign(file, { field: slotKey });
      }
      return { ...file, name: file?.name || file?.filename, field: slotKey };
    });
    setFiles([...others, ...tagged]);
  };

  // Flat sizes cannot include inside pages — drop any stale inside uploads on switch.
  useEffect(() => {
    if (!isFlat) return;

    const filtered = (files || []).filter(
      (file) => !INSIDE_PAGE_SLOT_KEYS.has(file?.field)
    );
    if (filtered.length !== (files || []).length) {
      setFiles(filtered);
    }

    setEnabledSlots((prev) => {
      if (!prev["Left Page"] && !prev["Right Page"]) {
        return prev;
      }
      return { ...prev, "Left Page": false, "Right Page": false };
    });
  }, [isFlat, files, setFiles]);

  // Only auto-open slots that already have uploads; never force-close on empty files
  // (parent re-renders pass a new [] and were resetting checkboxes right after click).
  useEffect(() => {
    setEnabledSlots((prev) => {
      let changed = false;
      const next = { ...prev };

      visibleSlots.forEach((slot) => {
        const hasFiles = (files || []).some((file) => file?.field === slot.key);
        if (hasFiles && !next[slot.key]) {
          next[slot.key] = true;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [files, visibleSlots]);

  const handleToggleSlot = (slotKey: string) => {
    const nextEnabled = !enabledSlots[slotKey];
    if (!nextEnabled) {
      updateSlotFiles(slotKey, []);
    }
    setEnabledSlots((prev) => ({ ...prev, [slotKey]: nextEnabled }));
  };

  return (
    <div className="greeting-card-upload-slots upload-zone-after-fields">
      {visibleSlots.map((slot) => {
        const slotFiles = getSlotFiles(slot.key);
        const isEnabled = Boolean(enabledSlots[slot.key]);
        const inputId = `${fieldIdPrefix}-${slot.key.replace(/\s+/g, "-")}`;

        return (
          <div key={slot.key} className="greeting-card-upload-slot">
            <div className="checkbox-container">
              <input
                checked={isEnabled}
                onChange={() => handleToggleSlot(slot.key)}
                type="checkbox"
                name={inputId}
                id={inputId}
              />
              <label className="margin-left-15" htmlFor={inputId}>
                {slot.label}{" "}
                <FileUploadingStatus files={slotFiles} />
              </label>
              <br />
            </div>
            {isEnabled && (
              <div className="custom-dropzone--container">
                <ImageDropzone
                  orderType="GREETING_CARD_PRINT"
                  files={slotFiles}
                  setFiles={(nextFiles: any[]) =>
                    updateSlotFiles(slot.key, nextFiles)
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
    </div>
  );
};

export default GreetingCardLineUploads;
