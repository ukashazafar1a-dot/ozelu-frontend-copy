"use client";
import React from "react";
import "./styleCart.scss";
import "../Home/Services/styleEComerecServices.css";
import { useState } from "react";
import CartProduct from "./CartProduct";
import TrendingProducts from "../Home/TrendingProducts";

const product = [
  {
    image:
      "//cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_120x.png?v=1654873704 120w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_240x.png?v=1654873704 240w",
    name: "Snack Monster - Funny Kids’ Tshirt",
    color: "White",
    size: "10 Year",
    price: 50,
    id: "1",
  },
  {
    image:
      "//cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_120x.png?v=1654873704 120w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_240x.png?v=1654873704 240w",
    name: "Snack Monster - Funny Kids’ Tshirt",
    color: "White",
    size: "10 Year",
    price: 50,
    id: "2",
  },
];

const Index = () => {
  const [grandTotal, setGrandTotal] = useState(0);
  const updateGrandTotal = (grandTotal) => {
    setGrandTotal(grandTotal);
  };
  return (
    <div>
      <div className="wrapper_e-comerece wrapper-custom">
        <div className="shopify-section page_section_heading">
          <div className="page-head_cart tc pr oh page_head_cart_heading">
            <div className="container pr z_100">
              <h1 className="tu mb__10 cw">Shopping cart</h1>
            </div>
          </div>
        </div>
        <div className="shopify-section cart_page_section container my-5">
          {product.length === 0 && (
            <div className="empty_cart_page tc dn" style={{ display: "block" }}>
              <i className="fa-duotone fa-cart-circle-exclamation"></i>
              <h4 className="cart_page_heading mg__0 mb__20 tu fs__30">
                Your cart is empty.
              </h4>
              <div className="cart_page_txt">
                Before proceed to checkout you must add some products to your
                shopping cart.
                <br /> You will find a lot of interesting products on our "Shop"
                page.
              </div>
              <div className="mt__30"></div>
              <p className="mb__15">
                <a
                  className="button button_primary tu js_add_ld"
                  href="/collections/all"
                >
                  Return To Shop
                </a>
              </p>
            </div>
          )}
          <div className="cookie-message dn tc">
            Enable cookies to use the shopping cart
          </div>
          <form className="frm_cart_ajax_true frm_cart_page nt_js_cart pr oh ">
            <div className="cart_header">
              <div className="row al_center">
                <div className="col-5">Product</div>
                <div className="col-3 tc">Price</div>
                <div className="col-2 tc">Quantity</div>
                <div className="col-2 tc tr_md">Total</div>
              </div>
            </div>
            <hr />
            {product.map((item) => (
              <CartProduct
                key={item}
                product={item}
                setPrice={updateGrandTotal}
                grandTotal={grandTotal}
              />
            ))}

            <div className="cart__footer mt__60 mb__40">
              <div className="row">
                <div className="col-12 col-md-6 cart_actions tl_md tc order-md-2 order-2 mb__50">
                  <label
                    for="CartSpecialInstructions"
                    className="cart-note__label dib cd mb__10"
                  >
                    <span className="txt_add_note ">
                      How did you hear about us{" "}
                    </span>
                    <span className="txt_edit_note dn">Edit Order Note</span>
                  </label>

                  <div style={{ disply: "flex" }}>
                    <input
                      type="radio"
                      id="CartSpecialInstructions"
                      name="note"
                      value="Instagram "
                    />
                    &nbsp;{" "}
                    <label for="CartSpecialInstructions">Instagram</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="CartSpecialInstructions"
                      name="note"
                      value="Facebook "
                    />
                    &nbsp; <label for="CartSpecialInstructions">Facebook</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="CartSpecialInstructions"
                      name="note"
                      value=">TikTok "
                    />
                    &nbsp; <label for="CartSpecialInstructions">TikTok</label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="CartSpecialInstructions"
                      name="note"
                      value=">Google Search "
                    />
                    &nbsp;{" "}
                    <label for="CartSpecialInstructions">Google Search</label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="CartSpecialInstructions"
                      name="note"
                      value=">Family &amp; Friends "
                    />
                    &nbsp;{" "}
                    <label for="CartSpecialInstructions">
                      Family &amp; Friends
                    </label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="CartSpecialInstructions"
                      name="note"
                      value=">Ripe Market "
                    />
                    &nbsp;{" "}
                    <label for="CartSpecialInstructions">Ripe Market</label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="CartSpecialInstructions"
                      name="note"
                      value=">Events "
                    />
                    &nbsp; <label for="CartSpecialInstructions">Events</label>
                  </div>
                </div>
                <div className="col-12 tr_md tc order-md-4 order-4 col-md-6">
                  <div className="js_cat_dics"></div>
                  <div className="total row in_flex fl_between al_center cd fs__18 tu">
                    <div className="col-auto">
                      <strong>Subtotal:</strong>
                    </div>
                    <div className="col-auto tr js_cat_ttprice fs__20 fwm">
                      <div className="cart_tot_price">Dhs. {grandTotal}</div>
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <p className="db txt_tax_ship mb__5">
                    Taxes, shipping and discounts codes calculated at checkout
                  </p>

                  <div className="clearfix"></div>
                  <button
                    type="submit"
                    data-confirm="ck_lumise"
                    name="checkout"
                    className="btn_checkout  tu mt__10 mb__10  w-50"
                  >
                    Check Out
                  </button>
                  <div className="clearfix"></div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="container my-5">
        <hr />
        <TrendingProducts />
      </div>
    </div>
  );
};

export default Index;
