"use client";
import React from "react";

type OrderTotalPriceProps = {
  /** Final amount (print subtotal + delivery), same as the read-only Price field. */
  total: number;
  className?: string;
};

/** Clarifies final charge below line items and delivery (matches Price field). */
const OrderTotalPrice: React.FC<OrderTotalPriceProps> = ({
  total,
  className = "",
}) => {
  const amount = Number.isFinite(total) ? parseFloat(total.toFixed(2)) : 0;

  return (
    <p className={`order-summary__total-price mt-2 mb-0 ${className}`.trim()}>
      Total Price:{" "}
      <span style={{ color: "#6ec1cd" }}>{amount} AED</span>
    </p>
  );
};

export default OrderTotalPrice;
