"use client"
import { useRouter } from 'next/navigation';
import React from 'react'

const CartCheckoutBtn = ({setCartOpened}:any) => {
    const router = useRouter();
    const handleCheckout = (e:any) => {
       e.preventDefault();
       router.push("/checkout");
       setCartOpened(false)
    };
  return (
    <button
    type="submit"
    onClick={handleCheckout}
    className="button btn-checkout mt__10 mb__10 js_add_ld truncate"
  >
    Check Out
  </button>
  )
}

export default CartCheckoutBtn