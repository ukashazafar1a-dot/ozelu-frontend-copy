import Link from 'next/link'
import React from 'react'

function HowItWorks() {
  return (
    <section className="container">
      <div className="itWorks services-title">
        <h2 className="heading-h2 text-center mt-5 mb-3">How It Works?</h2>
      </div>
      <div className="stepRow mb-3">
        <div className="stepRoot">
          <div className="stepImage">
            <img
              src={"/images/images/passport-size-photos-delivery/step-1-take-photo-phone.png"}
              alt="itWorkStep1"
              loading='lazy'/>
          </div>
          <p className="heading-h3 fw-bold mb-2">Step 1</p>
          <div className="rte rte-settings content">
            <p>
            <strong>Take A Picture With Your Phone & Upload In The Form Below</strong>
            <br/>
            Follow the Guidelines and upload a picture in the form below. </p>
          </div>
        </div>
        <div className="stepRoot">
          <div className="stepImage">
            <img
              src={"/images/images/passport-size-photos-delivery/step-2-pay-online.png"}
              alt="itWorkStep2"
              loading='lazy'/>
          </div>
          <p className="heading-h3 fw-bold mb-2">Step 2</p>
          <div className="rte content">
            <p>
              <strong>Make The Payment Online</strong>
              <br/>
              Make the payment online using our secure payment gateway.
            </p>
          </div>
        </div>
        <div className="stepRoot">
          <div className="stepImage">
            <img
              src={"/images/images/passport-size-photos-delivery/step-3-same-day-free-delivery.jpg"}
              alt="sameDay"
              loading='lazy'
              />
          </div>
          <p className="heading-h3 fw-bold mb-2">Step 3</p>
          <div className="rte content">
            <p>
             <strong>Get It Delivered To Your Doorstep Same Day!</strong><br/>
             We edit the picture, print it out and deliver it to your home, same day, 
             before 12:00 am (except Saturdays)
            </p>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center align-items text-center">
        <Link 
            href="#passport-form" 
            className="btn--primary-new">Place Your Order</Link>
      </div>
    </section>
  )
}

export default HowItWorks