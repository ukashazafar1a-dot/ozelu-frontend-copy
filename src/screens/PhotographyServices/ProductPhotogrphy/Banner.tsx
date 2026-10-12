"use client";
import React from "react";
import { scroll } from "../../../utils";
import { returnImage } from "@/helpers/generals";

const Banner = ({ section }: any) => {
  const scrollToForm = () => {
    const formRef = document.getElementById("reservation-form");
    scroll(formRef);
  };
  return (
    <section className="banner-photography  mb-md-5">
      <div className="row align-items-center">
        <div className="col-md-6 pl-12 py-3 pr-3">
          <h1 className="re-cover-event fw-bold h1 text-center text-md-left">
            Picture Perfect Products
          </h1>
          <div className="rte rte-settings">
            <p>
              Contact us today to discuss how we can elevate your products
              visual appeal and create a lasting impression on your customers.
              We look forward to collaborating with you and bringing your
              products to life through our lens.
            </p>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center justify-content-md-start">
            <button className="btn--service-action">
              <a href="https://wa.me/10000000000" className="link">WhatsApp to Book</a>
            </button>
            <button
              onClick={() => scrollToForm()}
              className="btn--service-action"
            >
              Go to Contact Form
            </button>
          </div>
        </div>
        <div className="col-md-6">
          {returnImage(section?.settings?.image, "w-100 pb-0",800)}
        </div>
      </div>
    </section>
  );
};

export default Banner;
