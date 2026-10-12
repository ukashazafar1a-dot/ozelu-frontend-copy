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
            We Only Shoot Delicious Food
          </h1>
          <div className="rte rte-settings">
            <p>
              Contact us to answer a few questions for an instant quote and to
              provide you with the right photographer suited to your needs
            </p>
          </div>
          <div className="what-center">
            <a href="https://wa.me/10000000000">
              <button>WhatsApp to Book</button>
            </a>
            <button onClick={() => scrollToForm()}> Go to Contact Form</button>
          </div>
        </div>
        <div className="col-md-6">
          {returnImage(section?.settings?.image, "w-100",800)}
        </div>
      </div>
    </section>
  );
};

export default Banner;
