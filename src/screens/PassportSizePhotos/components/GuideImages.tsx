"use client";

import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, Mousewheel } from "swiper/modules";
import { returnImage } from "@/helpers/generals";

const GuideImages = ({ images }: any) => {
  const swiperRef = React.useRef<any>()
  const [products, setProducts] = useState([])

  const handlePrev = function(){
    swiperRef.current?.slidePrev()
  }

  const handleNext = function(){
    swiperRef.current?.slideNext()
  }
  //console.log("Baby images", images);
  return (
    <div className="gi-wrapper pt-3">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        loop={true}
        pagination={{
          clickable: true,
        }}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
          
        }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        modules={[Navigation, Pagination, Mousewheel]}
        className=""
      >
        {images && images.length > 0 ?
          images?.map((image: any, i: any) => {
            return (
              <SwiperSlide key={i}>
                <div className="d-flex align-items-center">
                  <div className="col-6 px-2 px-md-3">
                    <span className="beforeAfter-new-carusal">Before</span>
                    {returnImage(image?.beforeImg, "before--image", 460, "eager")}
                  </div>
                  <div className="col-6 px-2 px-md-3">
                    <span className="beforeAfter-new-carusal">After</span>
                    {returnImage(image?.afterImg, "after--imge", 460, "eager")}
                  </div>
                </div>
              </SwiperSlide>
            );
          }) : <></>}
        <div className="swiper-button-next swiper-btn" onClick={handleNext}>
          <span><i className="fa-solid fa-chevron-right"></i></span>
        </div>
        <div className="swiper-button-prev swiper-btn" onClick={handlePrev}>
          <span><i className="fa-solid fa-chevron-left"></i></span>
        </div>
      </Swiper>
    </div>
  );
};

export default GuideImages;
