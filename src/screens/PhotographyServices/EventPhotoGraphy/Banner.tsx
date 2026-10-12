"use client";
import React from "react";
import { scroll } from "../../../utils";
import { returnImage } from "@/helpers/generals";

const Banner = ({section}:any) => {
  const scrollToForm = () => {
    const formRef = document.getElementById("reservation-form");
    scroll(formRef);
  };
  return (
    <section className="banner-photography">
      <div className="row align-items-center">
        <div className="col-md-6 pl-12 py-3 pr-3">
          <h1 className="re-cover-event fw-bold h1 text-center text-md-left">Your Event <br/>Our Final</h1>
          <div className="rte rte-settings">
            <p>
              Contact us for a quotation for the event you want us to cover and
              we will make sure we over deliver than your expectations.
            </p>
          </div>
          <div className="what-center">
            <a href="https://wa.me/971545679479">
              <button>WhatsApp to Book</button>
            </a>
            <button onClick={() => scrollToForm()}> Go to Contact Form</button>
          </div>
        </div>
        <div className="col-md-6">
          {returnImage(section?.settings?.image,'main-image',800)}
        </div>
      </div>
    </section>
  );
};

export default Banner;
