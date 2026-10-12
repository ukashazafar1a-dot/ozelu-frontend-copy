"use client";

import React from "react";
import Select from "react-select";
import { Site } from "@/libs/site";
import {
  clampOrderQuantityToStock,
  formatSizeDropdownLabel,
  getTrackedStockQuantity,
  isColorFullyOutOfStock,
  T_SHIRT_LOW_STOCK_MAX,
} from "@/helpers/generals";

type ShirtSize = {
  value: string;
  available?: boolean;
  outOfStock?: boolean;
  quantity?: number;
};

function resolveShirtColorImageSrc(image: unknown): string | undefined {
  if (!image) return undefined;
  if (typeof image === "object" && image !== null && "src" in image) {
    const src = String((image as { src?: string }).src || "").trim();
    return src || undefined;
  }
  const str = String(image).trim();
  if (!str || str === "[object Object]") return undefined;
  return str;
}

const sizeSelectStyles = {
  control: (styles: any, state: any) => ({
    ...styles,
    minHeight: 32,
    height: 32,
    backgroundColor: state.isDisabled ? "#f5f5f5" : "#fff",
    border: `1px solid ${state.isFocused ? "#17a8e3" : "#d9d9d9"}`,
    borderRadius: 6,
    boxShadow: "none",
    fontSize: "0.9rem",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    position: "relative",
    "&:hover": {
      borderColor: state.isDisabled ? "#d9d9d9" : "#17a8e3",
    },
  }),
  valueContainer: (styles: any) => ({
    ...styles,
    height: 30,
    padding: 0,
    justifyContent: "center",
    display: "flex",
  }),
  singleValue: (styles: any) => ({
    ...styles,
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    transform: "translateY(-50%)",
    margin: 0,
    maxWidth: "100%",
    width: "100%",
    textAlign: "center",
    color: "#333",
  }),
  placeholder: (styles: any) => ({
    ...styles,
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    transform: "translateY(-50%)",
    margin: 0,
    width: "100%",
    textAlign: "center",
    color: "#686868",
  }),
  input: (styles: any) => ({
    ...styles,
    margin: 0,
    padding: 0,
    caretColor: "transparent",
  }),
  indicatorsContainer: (styles: any) => ({
    ...styles,
    height: 30,
    position: "absolute",
    right: 0,
    top: 0,
  }),
  dropdownIndicator: (styles: any) => ({
    ...styles,
    padding: "0 6px",
    color: "#686868",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (styles: any) => ({
    ...styles,
    zIndex: 20,
    textAlign: "center",
  }),
  menuPortal: (styles: any) => ({
    ...styles,
    zIndex: 9999,
  }),
  option: (styles: any, state: any) => ({
    ...styles,
    textAlign: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: state.isSelected
      ? "#777771"
      : state.isFocused
        ? "#ededed"
        : "#fff",
    color: state.isDisabled
      ? "#999"
      : state.isSelected
        ? "#fff"
        : "#333",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
  }),
};

type Props = {
  colorImage?: unknown;
  sizeOptions: ShirtSize[];
  shirtColor: string;
  shirtSize: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  onSizeChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
};

export default function TShirtVariantCard({
  colorImage,
  sizeOptions,
  shirtColor,
  shirtSize,
  quantity,
  unitPrice,
  lineTotal,
  onSizeChange,
  onQuantityChange,
}: Props) {
  const imageSrc =
    resolveShirtColorImageSrc(colorImage) || Site.placeholder?.image;

  const colorOos = isColorFullyOutOfStock(sizeOptions);

  const selectedSizeOption =
    sizeOptions.find((size) => size.value === shirtSize) || null;

  const stockQty = getTrackedStockQuantity(selectedSizeOption);
  const showLowStock =
    !colorOos &&
    stockQty != null &&
    stockQty >= 1 &&
    stockQty <= T_SHIRT_LOW_STOCK_MAX;

  const fieldId = React.useId();
  const [draftQty, setDraftQty] = React.useState<string>(String(quantity));
  const [showExceedError, setShowExceedError] = React.useState(false);

  React.useEffect(() => {
    // Sync from committed form qty. Over-max typing does not update `quantity`,
    // so this will not wipe an in-progress typed value until blur/clamp.
    setDraftQty(String(quantity));
  }, [quantity]);

  React.useEffect(() => {
    if (stockQty != null && quantity > stockQty) {
      setShowExceedError(true);
    }
  }, [quantity, stockQty]);

  const sizeSelectOptions = sizeOptions.map((size) => {
    const outOfStock = size.outOfStock === true || size.available === false;
    return {
      value: size.value,
      // Closed control uses formatOptionLabel for display value only
      label: formatSizeDropdownLabel(size),
      displayValue: size.value,
      isDisabled: outOfStock || colorOos,
    };
  });

  const selectedSize =
    sizeSelectOptions.find((option) => option.value === shirtSize) || null;

  const selectedIsOutOfStock =
    !colorOos &&
    !!shirtSize &&
    sizeOptions.some(
      (s) =>
        s.value === shirtSize &&
        (s.outOfStock === true || s.available === false)
    );

  React.useEffect(() => {
    if (!colorOos) return;
    if (shirtSize) onSizeChange("");
    if (quantity > 0) onQuantityChange(0);
    // Only re-run when color-level OOS flips; avoid loops from new sizeOptions refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorOos]);

  React.useEffect(() => {
    if (selectedIsOutOfStock) {
      onSizeChange("");
      if (quantity > 0) onQuantityChange(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIsOutOfStock]);

  React.useEffect(() => {
    if (colorOos) return;
    if (stockQty == null || !shirtSize) return;
    if (quantity > stockQty) {
      onQuantityChange(stockQty);
      setShowExceedError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shirtSize, stockQty, colorOos, quantity]);

  const sizeSelected = Boolean(String(shirtSize || "").trim());
  const atMax =
    stockQty != null && stockQty > 0 && quantity >= stockQty && !showExceedError;
  // Qty only after a size is chosen (and color is not fully OOS)
  const qtyDisabled = colorOos || !sizeSelected;
  const plusDisabled =
    qtyDisabled || (stockQty != null && quantity >= stockQty);

  const commitQuantity = (raw: number) => {
    const next = Math.max(0, Math.floor(Number(raw) || 0));
    if (stockQty != null && next > stockQty) {
      setShowExceedError(true);
      setDraftQty(String(stockQty));
      onQuantityChange(stockQty);
      return;
    }
    setShowExceedError(false);
    setDraftQty(String(next));
    onQuantityChange(next);
  };

  const adjustQty = (delta: number) => {
    if (qtyDisabled) return;
    const next = Math.max(0, quantity + delta);
    if (stockQty != null && next > stockQty) {
      setShowExceedError(true);
      onQuantityChange(stockQty);
      setDraftQty(String(stockQty));
      return;
    }
    setShowExceedError(false);
    onQuantityChange(next);
    setDraftQty(String(next));
  };

  const handleQtyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (qtyDisabled) return;
    const raw = e.target.value;
    if (raw === "") {
      setDraftQty("");
      return;
    }
    if (!/^\d+$/.test(raw)) return;
    setDraftQty(raw);
    const n = parseInt(raw, 10);
    if (stockQty != null && n > stockQty) {
      setShowExceedError(true);
      return;
    }
    setShowExceedError(false);
    onQuantityChange(n);
  };

  const handleQtyInputBlur = () => {
    if (draftQty === "") {
      commitQuantity(0);
      return;
    }
    const n = parseInt(draftQty, 10);
    if (!Number.isFinite(n)) {
      commitQuantity(quantity);
      return;
    }
    commitQuantity(n);
  };

  const exceedMessage =
    stockQty != null
      ? `Maximum available quantity is ${stockQty} for ${shirtColor || "this color"}, Size ${shirtSize}.`
      : "";

  const cardClassName = [
    "t-shirt-variant-card",
    colorOos ? "t-shirt-variant-card--out-of-stock" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClassName}>
      <div className="t-shirt-variant-card__image-wrap">
        <img
          src={imageSrc}
          alt={shirtColor || "Shirt color"}
          loading="lazy"
          className="t-shirt-variant-card__image"
        />
        {colorOos && (
          <div className="t-shirt-variant-card__oos-overlay" role="status">
            <span>OUT OF STOCK</span>
          </div>
        )}
      </div>

      <p className="t-shirt-variant-card__color-label">
        {shirtColor || "Select color"}
      </p>

      <div className="t-shirt-variant-card__size-field">
        <Select
          className="t-shirt-variant-card__size-select"
          classNamePrefix="t-shirt-size-select"
          options={sizeSelectOptions}
          value={selectedSize}
          onChange={(option: any) => {
            if (option?.isDisabled || colorOos) return;
            const nextSize = option?.value || "";
            onSizeChange(nextSize);
            if (!nextSize) {
              if (quantity > 0) onQuantityChange(0);
              setShowExceedError(false);
              return;
            }
            const nextOpt = sizeOptions.find((s) => s.value === nextSize);
            const clamped = clampOrderQuantityToStock(quantity, nextOpt);
            if (clamped !== quantity) {
              onQuantityChange(clamped);
            }
            setShowExceedError(false);
          }}
          isOptionDisabled={(option: any) => !!option?.isDisabled}
          isDisabled={colorOos}
          placeholder="Select size"
          isSearchable={false}
          getOptionLabel={(option: any) => option.label}
          formatOptionLabel={(option: any, { context }: any) =>
            context === "menu" ? option.label : option.displayValue || option.value
          }
          styles={sizeSelectStyles}
          menuPlacement="auto"
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
          menuPosition="fixed"
        />
      </div>
      {showLowStock && (
        <p className="t-shirt-variant-card__low-stock">Only {stockQty} Left</p>
      )}

      <div
        className={[
          "t-shirt-variant-card__qty",
          showExceedError ? "t-shirt-variant-card__qty--error" : "",
          qtyDisabled ? "t-shirt-variant-card__qty--disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          className="t-shirt-variant-card__qty-btn"
          onClick={() => adjustQty(-1)}
          disabled={qtyDisabled || quantity <= 0}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className={
            showExceedError
              ? "t-shirt-variant-card__qty-value t-shirt-variant-card__qty-value--error"
              : "t-shirt-variant-card__qty-value"
          }
          value={draftQty}
          onChange={handleQtyInputChange}
          onBlur={handleQtyInputBlur}
          disabled={qtyDisabled}
          aria-label="Quantity"
          aria-invalid={showExceedError}
          aria-describedby={
            showExceedError
              ? `${fieldId}-qty-error`
              : atMax
                ? `${fieldId}-qty-max`
                : undefined
          }
        />
        <button
          type="button"
          className="t-shirt-variant-card__qty-btn"
          onClick={() => adjustQty(1)}
          disabled={plusDisabled}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      {!colorOos && stockQty != null && stockQty > 0 && atMax && (
        <p
          className="t-shirt-variant-card__max-available"
          id={`${fieldId}-qty-max`}
        >
          Maximum Available: {stockQty}
        </p>
      )}
      {!colorOos && showExceedError && stockQty != null && shirtSize && (
        <p
          className="t-shirt-variant-card__qty-error"
          id={`${fieldId}-qty-error`}
          role="alert"
        >
          {exceedMessage}
        </p>
      )}

      <div className="t-shirt-variant-card__pricing">
        <span>{unitPrice > 0 ? `${unitPrice} AED / Piece` : "—"}</span>
        <strong>{lineTotal > 0 ? `${lineTotal} AED` : "—"}</strong>
      </div>
    </div>
  );
}
