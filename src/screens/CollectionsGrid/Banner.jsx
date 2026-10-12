import { returnImage } from "@/helpers/generals";
import React from "react";



const Banner = () => {
  return (
    <div className="container-photography index-section">
      <div className="row pt-30 align-items-center">
        <div className="col-md-6 mb-5">
          <h1 className="mb-3 h1 fw-bold text-md-left text-center ">Gateway To Artistic Haven</h1>
          <div className="rte mb-3 font-primary text-md-left text-center">
            <p>
              Discover our exquisite collection of wall art, curated greeting
              cards, timeless photo frames and many other products. Unleash your
              creativity and add a touch of artistry to every corner of your
              world. Your journey to artistic enchantment begins here.
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <img
            src="https://ozelu.s3.eu-north-1.amazonaws.com/Assets/e-commerce-collections-cover-photo.jpg"
            alt="Gateway To Artistic Haven"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;
