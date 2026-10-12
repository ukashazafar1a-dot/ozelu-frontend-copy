"use client";
import { returnImage } from "@/helpers/generals";
import React from "react";

const Banner = ({section}:any) => {
  return (
    <section className="photo-retouching">
      <div className="fluid">
        <div className="d-md-flex">
          <div className="text-center text-md-left hero-area-text-retouching py-3">
            <h1 className="cover-photo-heading ">Photo Retouching</h1>
            <div className="rte rte-settings cover-photo-content">
              To receive a quote please WhatsApp us, choose the type of retouch
              and we’ll edit with great finesse within promised time
            </div>
            <a
              href="https://wa.me/971545679479"
              target="_blank"
              rel="referrer opener"
              className="retouching-btn hero-area-btn retouching-btnn"
            >
              Whatsapp For Quote
            </a>
          </div>
          <div className="col-md-5 p-md-0">
            {returnImage(section?.settings?.image,'w-100',800)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
