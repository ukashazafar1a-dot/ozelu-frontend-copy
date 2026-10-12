"use client";
import React, { useContext, useEffect } from "react";
import { useCart } from "react-use-cart";
import AppContext from "../../store/AppContext";
import { redirect } from "next/navigation";
import CartItems from "./CartItems";
import CartEmpty from "./CartEmpty";
import "./MiniCart.scss"
import CartCheckoutBtn from './CartCheckoutBtn'

function MiniCart() {
  const { cartIsOpened, setCartOpened } = useContext(AppContext);
  const { cartTotal, items, isEmpty, updateItemQuantity, removeItem } =
    useCart();

  const handleCartClose = function (e) {
    setCartOpened(false);
  };

  const handleChangeQuantity = (id, q) => {
    updateItemQuantity(id, parseInt(q));
  };


  const handleCollectionRedirect = (e) => {
    e.preventDefault();
    redirect("/collections/all");
    setCartOpened(false);
  };

  // useEffect(() => {
  //   //console.log("items", items.reverse());
  // }, [cartIsOpened,items]);
  return (
    <>
      <div id="gliconsymbols" className="hide dn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <symbol id="scl_remove">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>{" "}
          </symbol>
          <symbol id="scl_edit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>{" "}
            </svg>{" "}
          </symbol>
          <symbol id="scl_selected">
            {" "}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M9 20l-7-7 3-3 4 4L19 4l3 3z"></path>
            </svg>
          </symbol>
        </svg>
      </div>
      <div
        className={`mask-overlay ntpf t__0 r__0 l__0 b__0 op__0 ${
          cartIsOpened ? "mask_opened op__1" : ""
        }`}
        onClick={handleCartClose}
      >
        <span></span>
      </div>
      <section className="mini_cart_container">
        <div className={`nt_fk_canvas dn ${cartIsOpened ? "act_opened" : ""}`}>
          <form
            action="/cart"
            method="post"
            noValidate=""
            className="nt_mini_cart nt_js_cart flex column h__100 btns_cart_1"
          >
            <div className="mini_cart_header d-flex align-items-center justify-content-between">
              <div className="h6 widget-title tu fs__16 mg__0">
                Shopping cart
              </div>
              <i
                className="fas fa-xmark close_pp"
                onClick={handleCartClose}
              ></i>
            </div>
            <div className="mini_cart_wrap">
              <div className="mini_cart_content fixcl-scroll">
                <div className="fixcl-scroll-content">
                  {isEmpty ? (
                    <CartEmpty />
                  ) : (
                    <div className="mini_cart_items js_cat_items lazyloadt4sed">
                      {items?.sort((a, b) => b.last_updated - a.last_updated).map((item) => {
                        return <CartItems item={item} key={item?.id} />;
                      })}
                    </div>
                  )}
                </div>
              </div>
              {!isEmpty && (
                <div
                  className="mini_cart_footer js_cart_footer dn d-block">
                  <div className="js_cat_dics"></div>
                  <div className="total row fl_between al_center">
                    <div className="col-auto">
                      <strong>Subtotal:</strong>
                    </div>
                    <div className="col-auto tr js_cat_ttprice">
                      <div className="cart_tot_price">Dhs. {cartTotal}</div>
                    </div>
                  </div>
                  <p className="txt_tax_ship mb__5 fs__12">
                    Taxes, shipping and discounts codes calculated at checkout
                  </p>
                  <CartCheckoutBtn setCartOpened={setCartOpened}/>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default MiniCart;
