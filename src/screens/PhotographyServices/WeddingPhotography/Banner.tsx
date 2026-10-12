"use client";
import React from "react";
import AppReservationForm from "../ReservationForm/AppReservationForm";
import { scroll } from "../../../utils";
import { returnImage } from "@/helpers/generals";

const Banner = ({section}:any) => {
  const scrollToForm = () => {
    const formRef = document.getElementById("reservation-form");
    scroll(formRef);
  };
  return (
    <section className="banner-photography m-0">
      <div className="row align-items-center">
        <div className="col-md-6 pl-12 py-3 pr-3">
          <h1 className="re-cover h1">Capture Your Beautiful Moments</h1>
          <div className="rte rte-settings">
            <p>
              If you need a photographer for your special day at affordable
              prices and guaranteed good results, call us, WhatsApp us or simply
              submit our contact form.
            </p>
          </div>
          <div className="what-center">
            <a href="https://wa.me/971545679479">
              <button>WhatsApp to Book</button>
            </a>
            <button onClick={() => scrollToForm()}>Go to Contact Form</button>
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
