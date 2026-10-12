"use client";
import React from "react";
import { returnImage } from "@/helpers/generals";

const Banner = ({section}:any) => {
  return (
    <section className="wrapper-caricature">
      <div className="banner-caricature">
        <div className="row banner-row py-3 m-0 w-100">
          <div className="col-md-5 d-flex flex-column justify-content-center banner-caricature-left">
            <h1 className="banner-heading">
              CARICATURES <br />&<br /> ILLUSTRATIONS
            </h1>
            <p className="banner-text pt-3">
              We create unique and personalized caricatures and illustrations
            </p>
          </div>
          <div className="col-md-7">
            {returnImage(section?.settings?.image)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
