"use client";
import React, { useEffect } from "react";
import "./styleCheckoutProductCard.scss";
const CheckoutProductCard = ({ item }) => {
  //console.log("item", item);
  return (
    <div className="checkout-product-card">
      <div className="img-cont__checkout-product">
        <img
          src={
            item?.image?.src
              ? item?.image?.src
              : "//cdn.shopify.com/shopifycloud/shopify/assets/no-image-50-3d8cc48bd078edcd544c8d60f929ed2d8800a3fc52e0f602e84b1767e392bfcd_1728x.gif"
          }
          alt="img"
          loading="lazy"
        />
        <div className="prod-qty__checkout">{item?.quantity}</div>
      </div>
      <div className="product-info__checkout">
        <h5 className="ml-3 cart-product-title">{item?.title}</h5>
        <h6 className="ml-3">{item?.title_option}</h6>
      </div>
      <div className="price__checkout">
        <h5 className="cart-product-price fw-medium">{item?.itemTotal} AED</h5>
      </div>
    </div>
  );
};

export default CheckoutProductCard;
