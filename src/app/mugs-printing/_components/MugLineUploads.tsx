"use client";

import React, { useEffect, useId, useState } from "react";
import ImageDropzone from "../../../components/Dropzones/ImageDropzone";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import { BUSINESS_CARD_FILE_TYPES } from "@/constants/uploadSupportedTypes";

const UPLOAD_SLOTS = [
  { key: "Front View", label: "Upload Image for Front" },
  { key: "Middle Page", label: "Upload Image for Middle" },
  { key: "Back View", label: "Upload Image for Back" },
];

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
};

const MugLineUploads = ({ files, setFiles }: Props) => {
  const fieldIdPrefix = useId();
  const [enabledSlots, setEnabledSlots] = useState<Record<string, boolean>>(() =>
    buildInitialEnabledSlots(files)
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

  useEffect(() => {
    setEnabledSlots((prev) => {
      let changed = false;
      const next = { ...prev };
      UPLOAD_SLOTS.forEach((slot) => {
        const hasFiles = (files || []).some((file) => file?.field === slot.key);
        if (hasFiles && !next[slot.key]) {
          next[slot.key] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [files]);

  const handleToggleSlot = (slotKey: string) => {
    const nextEnabled = !enabledSlots[slotKey];
    if (!nextEnabled) {
      updateSlotFiles(slotKey, []);
    }
    setEnabledSlots((prev) => ({ ...prev, [slotKey]: nextEnabled }));
  };

  return (
    <div className="greeting-card-upload-slots upload-zone-after-fields mugs-upload-slots">
      {UPLOAD_SLOTS.map((slot) => {
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
                {slot.label} <FileUploadingStatus files={slotFiles} />
              </label>
              <br />
            </div>
            {isEnabled && (
              <div className="custom-dropzone--container">
                <ImageDropzone
                  orderType="MUG_PRINT"
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

export default MugLineUploads;
