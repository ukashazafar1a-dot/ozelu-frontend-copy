"use client";
import React, { useState } from "react";
import "../Home/Services/styleEComerecServices.css";
import "./styleCart.scss";
import Counter from "@/components/EComereceStore/Counter";

const CartProduct = ({ product, grandTotal, setPrice }) => {
  const [quantity, setQuantity] = useState(1);
  // const handleIncrease = () => {
  //   const subPrevTotal = quantity * product.price;
  //   const newQuantity = quantity + 1;
  //   setQuantity(newQuantity);
  //   const newTotal = (grandTotal - subPrevTotal) + (newQuantity*product.price);
  //   setPrice(newTotal)
  // };
  // const handleDecrease = () => {
  //   const subPrevTotal = quantity * product.price;

  //   if (quantity > 1) {
  //     const newQuantity = quantity - 1;
  //    setQuantity(newQuantity);
  //    const newTotal = (grandTotal - subPrevTotal) + (newQuantity*product.price);
  //    setPrice(newTotal)
  // }

  // };
  return (
    <div className="">
      <div className="cart_items js_cat_items">
        <div className="cart_item js_cart_item cart_item_42958172520668">
          <div className="ld_cart_bar"></div>
          <div className="row al_center">
            <div className="col-12 col-md-12 col-lg-5">
              <div className="page_cart_info flex al_center">
                <a href="/products/snack-monster-funny-kids-tshirt?variant=42958172520668">
                  <img
                    className="w__100 lz_op_ef lazyautosizes lazyloadt4sed"
                    src={product?.image}
                    alt=""
                  />
                </a>
                <div className="mini_cart_body ml__15">
                  <h5 className="mini_cart_title mg__0 mb__5">
                    <a href="/products/snack-monster-funny-kids-tshirt?variant=42958172520668">
                      {product?.name}
                    </a>
                  </h5>
                  <div className="mini_cart_meta">
                    <p className="cart_meta_variant">
                      Color: <strong>{product?.color}</strong>
                    </p>
                    <p className="cart_meta_variant">
                      Size: <strong>{product?.size}</strong>
                    </p>
                  </div>
                  <div className="mini_cart_tool mt__10">
                    <a
                      href="/products/bitter-lemon-food-pun-funny-women-s-tshirt?variant=42975828574428"
                      rel="nofollow"
                      data-no-instant=""
                      className="cart_ac_edit js__qs ttip_nt tooltip_top_right"
                      data-id="42975828574428"
                    >
                      <span className="tt_txt">Edit this item</span>
                      <svg viewBox="0 0 24 24">
                        {/* <use xlink:href="#scl_remove"></use> */}
                      </svg>
                    </a>
                    <a
                      href="/cart/change?quantity=0&amp;id=42975828574428:17a8009f0f8ae4363f7d4a08deab7baa"
                      rel="nofollow"
                      data-no-instant=""
                      className="cart_ac_remove js_cart_rem ttip_nt tooltip_top_right"
                      data-id="42975828574428:17a8009f0f8ae4363f7d4a08deab7baa"
                    >
                      <span className="tt_txt">Remove this item</span>
                      <svg viewBox="0 0 24 24"></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4 col-lg-3 tc__ tc_lg">
              <div className="cart_meta_prices price">
                <div className="cart_price">{product?.price}</div>
              </div>
            </div>
            <div className="col-12 col-md-4 col-lg-2 tc mini_cart_actions">
              <Counter quantity={quantity} setQuantity={setQuantity}/>
              {/* <div className="quantity pr mr__10 qty__true cart-input-field-cont-style">
                <input
                  type="number"
                  id={product.id}
                  className="input-text qty tc qty_cart_js cart-input-field-style"
                  value={quantity}
                  inputMode="numeric"
                />
                <div className="qty tc fs__14">
                  <button
                    onClick={handleIncrease}
                    type="button"
                    className="plus db cb pa pd__0 pr__15 tr r__0 onHover"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  <button
                    onClick={handleDecrease}
                    type="button"
                    className="minus db cb pa pd__0 pl__15 tl l__0 qty_1 onHover"
                  >
                    <svg className="dn" viewBox="0 0 24 24"></svg>
                    {quantity > 1 && <FontAwesomeIcon icon={faMinus} />}
                    {quantity === 1 && (
                      <i className="fa fa-trash w-c-n" aria-hidden="true"></i>
                    )}
                  </button>
                </div>
              </div> */}
            </div>
            <div className="col-12 col-md-4 col-lg-2 tc__ tr_lg">
              <span className="cart-item-price fwm cd js_tt_price_it" id="price">
                {product?.price * quantity}
              </span>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default CartProduct;
