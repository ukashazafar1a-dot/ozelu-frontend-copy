"use client";
import React from "react";
import { resolveDeliveryChargeDisplay } from "@/helpers/generals";

const FREE_DELIVERY_COLOR = "#6ec1cd";

type DeliveryChargesLineProps = {
  /** Fee from the selected area's areaset (before threshold free-delivery). */
  areaCharge: number;
  /** Merchandise / order value used for the free-delivery threshold check. */
  orderPrice: number;
  /** Backend `free_delivery_threshold` (0 / empty = disabled). */
  threshold: number | string | null | undefined;
  /** True when the customer has selected a delivery area. */
  hasArea?: boolean;
  className?: string;
};

/**
 * Shared "Delivery Charges:" line for print-order forms.
 * Free modes always render: "{N} AED ✕ {message}" (even when N is 0).
 * Does not change pricing math — display only.
 */
const DeliveryChargesLine: React.FC<DeliveryChargesLineProps> = ({
  areaCharge,
  orderPrice,
  threshold,
  hasArea = false,
  className = "mt-2",
}) => {
  const display = resolveDeliveryChargeDisplay({
    areaCharge,
    orderPrice,
    threshold,
    hasArea,
  });

  if (display.mode === "paid") {
    return (
      <p className={className}>
        {" "}
        Delivery Charges: {display.amount} AED{" "}
      </p>
    );
  }

  const strikeAmount = Number(display.strikeAmount) || 0;

  return (
    <p className={className}>
      {" "}
      Delivery Charges:{" "}
      <span className="text-muted" style={{ textDecoration: "line-through" }}>
        {strikeAmount} AED
      </span>
      <span
        aria-hidden="true"
        style={{
          color: FREE_DELIVERY_COLOR,
          marginLeft: "0.65rem",
          marginRight: "0.65rem",
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        ✕
      </span>
      <span style={{ color: FREE_DELIVERY_COLOR }}>{display.message}</span>
    </p>
  );
};

export default DeliveryChargesLine;
