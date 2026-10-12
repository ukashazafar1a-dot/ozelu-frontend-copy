"use client";
import React from "react";
import { DOCUMENT_FILE_TYPES } from "@/constants/uploadSupportedTypes";

type UploadInfoLabelProps = {
  /** Comma-separated list of supported file extensions or types. */
  supportedTypes?: string;
  /** Optional helper label shown before the supported list. */
  label?: string;
  className?: string;
};

const DEFAULT_TYPES = DOCUMENT_FILE_TYPES;

const UploadInfoLabel: React.FC<UploadInfoLabelProps> = ({
  supportedTypes = DEFAULT_TYPES,
  label = "Supported",
  className = "",
}) => {
  return (
    <div
      className={`d-flex align-items-center text-muted small mt-2 ${className}`}
      style={{ fontSize: "12px", lineHeight: 1.4, gap: "6px" }}
    >
      <span
        aria-hidden="true"
        title={`${label}: ${supportedTypes}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "1px solid currentColor",
          fontStyle: "italic",
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        i
      </span>
      <span>
        {label}: {supportedTypes}
      </span>
    </div>
  );
};

export default UploadInfoLabel;
