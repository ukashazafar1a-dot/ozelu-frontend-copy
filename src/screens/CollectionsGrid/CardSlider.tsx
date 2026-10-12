"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import CollectionCard from "@/components/EComereceStore/CollectionCard";

function CardSlider({ collections }: any) {
  const swiperRef = React.useRef<any>();
  const prevRef = React.useRef<any>();
  const nextRef = React.useRef<any>();
  const handlePrev = function () {
    swiperRef.current?.slidePrev();
  };
  const handleNext = function () {
    swiperRef.current?.slideNext();
  };
  return (
    <section className="SectionWrapper mt-5 mb-0 pt-3">
      <div className="container ">
        <div className="services-tittle">
          <div className="container">
            <h2 className="text-center heading-h2 my-5 mx-0">E-Commerce Store</h2>
          </div>
        </div>
        {collections && (
          <div className="mb-4" style={{ maxWidth: "1260px" }}>
            <div className="cards-wrapper">
              <Swiper
                className="equal_nt ratio_nt on_list_view_false w-full h-full"
                modules={[Navigation]}
                loop={collections?.length > 4 ? true : false} 
                navigation={{
                  prevEl: prevRef?.current,
                  nextEl: nextRef?.current,
                }}
                onBeforeInit={(swiper) => {
                  //console.log("Swiper>>",swiper)
                  swiperRef.current = swiper;
                }}
                breakpoints={{
                  280: {
                    slidesPerView: 2,
                  },
                  576: {
                    slidesPerView: 3,
                  },
                  768: {
                    slidesPerView: 4,
                  },
                }}
                spaceBetween={10}
              >
                {collections.map((collection: any,index:number) => {
                  return (
                    <SwiperSlide className="text-white" key={index}>
                      <CollectionCard collection={collection} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <i
                className="btn--next fa-solid fa-chevron-right cursor-pointer"
                ref={nextRef}
                onClick={handleNext}
                typeof="next"
              ></i>
              <i
                className="btn--prev fa-solid fa-chevron-left cursor-pointer"
                ref={prevRef}
                onClick={handlePrev}
                typeof="prev"
              ></i>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CardSlider;
