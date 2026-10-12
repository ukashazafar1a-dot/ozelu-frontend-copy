"use client";
import React from "react";
import ImageDropzone from "@/components/Dropzones/ImageDropzone";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import { POLAROID_IMAGE_TYPES } from "@/constants/uploadSupportedTypes";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import { buildLaminationSelectOptions } from "@/libs/photoPrintingPricing";
import {
  getPolaroidDiscountedPrice,
  formatPolaroidPaperSizeDimensions,
  formatPolaroidPhotoSizeDimensions,
  formatPolaroidPrintPrice,
  getPolaroidDiscountTierLabels,
  getPolaroidLaminationKey,
  getPolaroidQuantity,
  mergePolaroidCards,
  PolaroidStyle,
} from "@/libs/polaroidPrinting";
import { pushDatalyer } from "@/datalayers/CP";

type Props = {
  polaroidEnabled: boolean;
  polaroidStyles: PolaroidStyle[];
  paperTypes: string[];
  photoLaminations: any[];
  setFieldValue: (field: string, value: any) => void;
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean,
  ) => void;
  calculatePrice: () => void;
};

const PolaroidStylesSection = ({
  polaroidEnabled,
  polaroidStyles,
  paperTypes,
  photoLaminations,
  setFieldValue,
  setFieldTouched,
  calculatePrice,
}: Props) => {
  const displayCards = mergePolaroidCards(polaroidStyles);

  if (displayCards.length === 0) {
    return null;
  }

  const toggleOpen = (index: number) => {
    if (!polaroidEnabled) return;
    const next = polaroidStyles.map((s, i) => ({
      ...s,
      uiOpen: i === index ? !s.uiOpen : false,
    }));
    setFieldValue("polaroidStyles", next);
  };

  const handlePolaroidCheckbox = () => {
    const next = !polaroidEnabled;
    setFieldValue("polaroidEnabled", next);
    if (!next) {
      setFieldValue(
        "polaroidStyles",
        polaroidStyles.map((s) => ({ ...s, uiOpen: false })),
      );
    }
    setTimeout(() => calculatePrice(), 200);
  };

  return (
    <div className="formControll polaroid-styles-section">
      <div className="checkbox-container polaroid-enable-toggle">
        <input
          checked={polaroidEnabled}
          onChange={handlePolaroidCheckbox}
          type="checkbox"
          id="polaroid-style-prints"
          name="polaroidEnabled"
          onFocus={() =>
            pushDatalyer("Photos Printing", "Polaroid Style Prints")
          }
        />
        <label className="margin-left-15" htmlFor="polaroid-style-prints">
          Polaroid Style Prints
        </label>
      </div>

      {polaroidEnabled && (
        <>
          <div className="polaroid-styles-grid d-flex flex-wrap gap-3 mb-2 mt-3">
            {displayCards.map((style, index) => {
              const rowStyle = polaroidStyles[index] || style;
              const qty = getPolaroidQuantity(rowStyle);
              const { price: discPrice, compare_at_price } =
                getPolaroidDiscountedPrice(rowStyle);
              const tierLabels = getPolaroidDiscountTierLabels(rowStyle);
              return (
                <div
                  key={style._id || `polaroid-${index}`}
                  className={`polaroid-style-card border rounded ${polaroidStyles[index]?.uiOpen ? "polaroid-style-card--open" : ""}`}
                  onClick={() => toggleOpen(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleOpen(index);
                  }}
                >
                  <div className="polaroid-style-card__media bg-light rounded">
                    {style.imageUrl ? (
                      <img
                        src={style.imageUrl}
                        alt={style.name || "Polaroid"}
                        className="polaroid-style-card__img rounded"
                      />
                    ) : (
                      <span className="text-muted small">No image</span>
                    )}
                  </div>
                  <div className="polaroid-style-card__title text-center">
                    {style.name || `Style ${index + 1}`}
                  </div>
                  <div className="polaroid-style-card__meta text-center text-muted">
                    <span className="polaroid-style-card__meta-row">
                      <strong>Paper Size:</strong>{" "}
                      {formatPolaroidPaperSizeDimensions(style)}
                    </span>
                    <br />
                    <span className="polaroid-style-card__meta-row polaroid-style-card__meta-row--photo">
                      <strong>Photo Size:</strong>{" "}
                      {formatPolaroidPhotoSizeDimensions(style)}
                    </span>
                    <br />
                    <span className="polaroid-style-card__price">
                    {qty > 0 && discPrice ? (
                      <>
                        <span
                          className="text-muted"
                          style={{ textDecoration: "line-through" }}
                        >
                          {formatPolaroidPrintPrice(compare_at_price)} AED/Print
                        </span>{" "}
                        {formatPolaroidPrintPrice(discPrice)} AED/Print
                      </>
                    ) : (
                      <>{formatPolaroidPrintPrice(compare_at_price)} AED/Print</>
                    )}
                    </span>
                    {tierLabels.length > 0 && (
                      <>
                        <br />
                        {tierLabels.map((label, ti) => (
                          <span
                            key={`tier-${index}-${ti}`}
                            className="d-block polaroid-style-card__discount-hint"
                          >
                            {label}
                          </span>
                        ))}
                      </>
                    )}
                    {qty > 0 && (
                      <>
                        <br />
                        <FileUploadingStatus files={polaroidStyles[index]?.files || []} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {polaroidStyles.map((style, index) => {
            if (!style.uiOpen) return null;
            const lamKey = getPolaroidLaminationKey(style, index);
            const lamOpts = buildLaminationSelectOptions(photoLaminations, lamKey);

            return (
              <div
                key={`upload-${style._id || index}`}
                className="polaroid-upload-panel mb-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="formContainer polaroid-upload-row">
                  <div className="custom-dropzone--container">
                    <ImageDropzone
                    orderType="PHOTO_PRINT"
                    page="polaroid-upload"
                    files={style.files || []}
                    setFiles={(updater: any) => {
                      const current = polaroidStyles[index]?.files || [];
                      setFieldValue(
                        `polaroidStyles[${index}].files`,
                        typeof updater === "function" ? updater(current) : updater,
                      );
                      setFieldTouched(`polaroidStyles[${index}].files`, true, true);
                      calculatePrice();
                    }}
                    showCounters={true}
                    showPrint={true}
                    showPaper={paperTypes.length > 0}
                    paperTypes={paperTypes}
                    showPhotoLamination={true}
                    laminationOptions={lamOpts}
                    showCaption={true}
                    maxCaptionLength={50}
                  />
                  <UploadInfoLabel supportedTypes={POLAROID_IMAGE_TYPES} />
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default PolaroidStylesSection;
