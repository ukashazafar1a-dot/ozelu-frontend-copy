"use client";
import React from "react";
import { useCart } from "react-use-cart";


const CartItems = ({item}:any) => {
  const {removeItem,updateItemQuantity} = useCart();

  const handleChangeQuantity = (id:any, q:any) => {
    updateItemQuantity(id, parseInt(q));
  };

  return (
    <>
    <div
      key={item.id}
      className="mini_cart_item js_cart_item cart_item_42958172520668 flex al_center pr oh"
    >
      <div className="mini_cart_img">
        <img
          className="lz_op_ef w__100 lazyautosizes lazyloadt4sed"
          src={
            item?.image?.src
              ? item.image.src
              : "https://placehold.co/600x400?text=Demo"
          }
          alt={item?.image?.alt}
          loading="lazy"
        />
      </div>
      <div className="mini_cart_info">
        <div className="mini_cart_title truncate">{item.title}</div>
        <div className="mini_cart_meta">
          {item.title_option !== 'Default title' && <div className="cart_meta_variant">{item.title_option}</div>}
          <div className="cart_meta_price price">
            <div className="cart_price">Dhs. {item.price}</div>
          </div>
        </div>
        <div className="mini_cart_actions">
          <div className="quantity pr mr__10 qty__true">
            <input
              type="number"
              className="input-text qty text tc qty_cart_js no-number"
              step={1}
              min={0}
              max={9999}
              value={item.quantity}
              size={4}
              pattern="[0-9]*"
              inputMode="numeric"
              onChange={(e) =>
                handleChangeQuantity(item.id, e.currentTarget.value)
              }
            />
            <div className="qty tc fs__14">
              <button
                type="button"
                style={{ paddingRight: "15px" }}
                className="plus db cb pa pd__0 tr r__0 no-button"
                onClick={(e) =>
                  handleChangeQuantity(item.id, item.quantity + 1)
                }
              >
                <i className="fa fa-plus"></i>
              </button>
              <button
                type="button"
                style={{ paddingLeft: "15px" }}
                className="minus db cb pa pd__0 tl l__0 qty_1 no-button"
                onClick={(e) =>
                  handleChangeQuantity(item.id, item.quantity - 1)
                }
                disabled={item?.quantity == 1 ? true : false }>
                {<i className="fa fa-minus"></i>}
              </button>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              removeItem(item.id);
            }}
            rel="nofollow"
            className="cart_ac_remove js_cart_rem ttip_nt tooltip_top_right"
          >
            <span className="tt_txt">Remove this item</span>
            <i className="fa fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
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
    </>
  );
};

export default CartItems;
