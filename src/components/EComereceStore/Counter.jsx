"use client"
import React from "react";
import "./styleCounter.scss";
const Counter = ({quantity, setQuantity}) => {

  function handleChangeQuantity(e,type){
    e.preventDefault()
    if(type == 'plus'){
      setQuantity(parseInt(quantity) + 1)
    }else if(type == 'minus'){
      if((parseInt(quantity) - 1) < 1) return;
      setQuantity(parseInt(quantity) - 1)
    }
  }
  return (
    
      <div className="quantity pr mr__10 qty__true quantity-wrapper">
        <input
          type="number"
          className="input-text qty text tc qty_cart_js"
          step="1"
          min="0"
          max="9999"
          value={quantity}
          size="4"
          pattern="[0-9]*"
          inputMode="numeric"
          onChange={(e)=>setQuantity(e.currentTarget.value)}
        />
        <div className="qty tc fs__14">
          <button type="button" className="plus db cb pa pd__0 pr__15 tr r__0" onClick={(e)=>handleChangeQuantity(e,'plus')}>
            <i className="fa fa-plus"></i>
          </button>
          <button
            type="button"
            onClick={(e)=>handleChangeQuantity(e,'minus')}
            className="minus db cb pa pd__0 pl__15 tl l__0 qty_1"
          >
            <svg className="dn" viewBox="0 0 24 24">
              {/* <use xlink:href="#scl_remove"></use> */}
            </svg>
            <i className="fa fa-minus"></i>
          </button>
        </div>
      </div>
   
  );
};

export default Counter;
