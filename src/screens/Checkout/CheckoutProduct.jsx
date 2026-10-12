"use client";
import React, { useContext, useEffect, useState } from "react";
import { useCart } from "react-use-cart";
import CheckoutProductCard from "./CheckoutProductCard";
import "./styleCheckoutComponent.scss";
import { checkFreeDelivery, getDeliveryCharges, resolveDeliveryChargeDisplay } from "@/helpers/generals";
import AppContext from "@/store/AppContext";

const CheckoutProduct = ({ classes, totalPrice,setTotalPrice,deliveryCharges, freeDeliveryThreshold,minPrice,area,areas }) => {
  const { items, cartTotal } = useCart();
  const { storePrices } = useContext(AppContext);
  const [extras,setExtras] = useState(0)

  function renderDeliveryCharges(){
    const areaCharge = getDeliveryCharges(storePrices, area, areas);
    const display = resolveDeliveryChargeDisplay({
      areaCharge,
      orderPrice: cartTotal,
      threshold: freeDeliveryThreshold,
      hasArea: Boolean(area),
    });

    if (display.mode === "paid") {
      return (
        <div className="heading-cont__checkout-product">
          <div>Delivery Charges</div>
          <div className="fw-medium">AED {display.amount}</div>
        </div>
      );
    }

    const strikeAmount = Number(display.strikeAmount) || 0;

    return (
      <div className="heading-cont__checkout-product">
        <div>Delivery Charges</div>
        <div className="fw-medium">
          <span className="text-muted" style={{ textDecoration: "line-through" }}>
            AED {strikeAmount}
          </span>
          <span
            aria-hidden="true"
            style={{
              color: "#6ec1cd",
              marginLeft: "0.65rem",
              marginRight: "0.65rem",
              fontWeight: 600,
            }}
          >
            ✕
          </span>
          <span style={{ color: "#6ec1cd" }}>{display.message}</span>
        </div>
      </div>
    );
  }

  useEffect(()=>{
    let newPrice = 0, newExtras = 0, newDeliveryCharges = 0;
    if((cartTotal + deliveryCharges) < minPrice){
      newExtras = minPrice - (cartTotal + deliveryCharges);
      newPrice = minPrice;
    }else{
      newExtras = 0;
      if(checkFreeDelivery(cartTotal,freeDeliveryThreshold)){
        newPrice = cartTotal;
      }else{
        newPrice = cartTotal + deliveryCharges;
      }
    }


    setExtras(newExtras)
    setTotalPrice(newPrice)


  },[totalPrice,deliveryCharges,cartTotal])

  //console.log(items);
  return (
    <div className={`product-container__checkout ${classes}`}>
      <div className="product-card-container__checkout">
        {items && items?.length > 0 ? (
          items.map((item) => {
            return <CheckoutProductCard key={item?.id} item={item} />;
          })
        ) : (
          <></>
        )}
      </div>
      <div className="product-card-container__checkout">
        <div className="heading-cont__checkout-product">
          <div>Subtotal</div>
          <div className="fw-medium">AED {cartTotal}</div>
        </div>
        {renderDeliveryCharges()}
        {(extras > 0) && <div className="heading-cont__checkout-product">
          <div>Extras</div>
          <div className="fw-medium">AED {extras}</div>
        </div>}
        {/* <div className='heading-cont__checkout-product'>
            <div><h5>Shipping</h5>
            <div className='prod-shipping__checkout'>?</div>
            </div>
            <div><h5>AED 320.00</h5></div>
        </div> */}
      </div>
      <div>
        <div className="heading-cont__checkout-product">
          <div className="cart-total--final">Total</div>
          <div className="cart-total--final">AED {totalPrice}</div>
        </div>
        <div className="mt-3 text-black-50">*Minimum Order Value Is {minPrice} AED</div>
      </div>
    </div>
  );
};

export default CheckoutProduct;
