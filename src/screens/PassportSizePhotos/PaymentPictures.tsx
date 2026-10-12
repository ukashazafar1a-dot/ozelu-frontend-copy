import React from 'react'

function PaymentPictures() {
  return (
    <div className="container">
        <div className="paymentPictureSection container">
          <img 
            src={"/images/images/passport-size-photos-delivery/payment-method-1.png"} 
            alt="paymentMethod1" 
            loading="lazy" 
            />
          <img 
            src={"/images/images/passport-size-photos-delivery/payment-method-2.png"} 
            alt="paymentMethod2" 
            loading="lazy" 
            />
          <img 
            src={"/images/images/passport-size-photos-delivery/payment-method-3.png"} 
            alt="paymentMethod3" 
            loading="lazy" 
          />
          <img 
            src={"/images/images/passport-size-photos-delivery/payment-method-4.png"} 
            alt="paymentMethod4" 
            loading="lazy" 
          />
        </div>
    </div>
  )
}

export default PaymentPictures