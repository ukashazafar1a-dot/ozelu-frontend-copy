'use client'

import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
// import "swiper/css/navigation";

import "./style.css";

// import required modules
import { Autoplay, Pagination, Navigation, Mousewheel } from "swiper/modules";

export default function App({ carouselName, babyImages }) {
  //console.log("Baby images",babyImages)
  return (
    <div className="swiper-container">
      <Swiper
        direction={"vertical"}
        spaceBetween={30}
        centeredSlides={true}
        mousewheel={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Autoplay, Pagination, Mousewheel]}
        className="mySwiper"
      >
        {babyImages && babyImages?.map((image,i) => {
          return (
            <SwiperSlide key={i}>
              <div className="image-container-new-carusal">
                <span className="beforeAfter-new-carusal">Before</span>
                <img
                  src={image?.beforeImgSrc}
                  alt="img"
                  className="image-inner-new-carusal"
                />
                <span className="beforeAfter-new-carusal">After</span>
                <img
                  src={image?.afterImgSrc}
                  alt="img"
                  className="image-inner-new-carusal"
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
