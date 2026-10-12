import Link from "next/link";
import React from "react";

const Banner = () => {
  return (
    <>
      <section className="wrapper-banner">
        <div className="homeSectionPassport passportDeliverySectionHome">
          <div className="homeSectionLeftContent photoDeliveryHomeSection w-full">
            <div>
              <h2 className="cover-photo-heading">
                GET YOUR <br />
                PASSPORT PHOTO <br />
                DELIVERED TO <br />
                YOU! <br />
              </h2>
            </div>
            <div className="description cover-photo-content fw-bold">
              100% Government Compliant, Passport Size Photo Delivery in Dubai!
            </div>
            <div className="orderPlayButton">
              <Link href="#passport-form" className="orderButton heading-h3">
                Place Your Order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;
