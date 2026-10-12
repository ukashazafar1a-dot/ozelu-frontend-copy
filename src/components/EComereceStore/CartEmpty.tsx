"use client";
import useApp from "@/store/useApp";
import { useRouter } from "next-nprogress-bar";

import React from "react";

const CartEmpty = () => {
  const { setCartOpened } = useApp();
  const router = useRouter();
  const handleClick = () => {
    setCartOpened(false);
    router.push("/collections");
  };
  return (
    <div className="empty tc mt__40">
      <i className="fa fa-shopping-bag pr mb__10"></i>
      <p>Your cart is empty.</p>
      <div className="return-to-shop mb__15">
        <button className="btn--addToCart" type="button" onClick={() => handleClick()}>
          <span className="truncate">Return To Shop</span>
        </button>
      </div>
    </div>
  );
};

export default CartEmpty;
