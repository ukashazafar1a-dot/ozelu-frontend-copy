"use client";
import ProductCard from "@/components/EComereceStore/ProductCard";
import Link from "next/link";
import React from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

type props = {
  products?: any;
  title?: any;
};

const TrendingProducts = ({ products, title }: props) => {
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
        <div className="section--header d-flex align-items-center justify-content-between gap-2 text-left mb-3 flex-wrap">
          <h2 className="text-left collection--title m-0 d-block">{title}</h2>
          <Link
            href={`/collections`}
            className="btn--primary-new btn--darkgrey"
          >
            View All
          </Link>
        </div>
        {products && (
          <div className="mb-4" style={{ maxWidth: "1260px" }}>
            <div className="cards-wrapper">
              <Swiper
                className="equal_nt ratio_nt on_list_view_false w-full h-full"
                modules={[Navigation]}
                loop={true}
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
                {products.map((product: any) => {
                  return (
                    <SwiperSlide className="text-white" key={product?._id}>
                      <ProductCard product={product} />
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
};

export default TrendingProducts;
