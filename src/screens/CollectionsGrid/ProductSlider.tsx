"use client";
import ProductCard from "@/components/EComereceStore/ProductCard";
import Link from "next/link";
import React from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

type props = {
  collection?: any
};

const ProductSlider = ({ collection }: props) => {
  
  const swiperRef = React.useRef<any>();
  const prevRef = React.useRef<any>();
  const nextRef = React.useRef<any>();
  const handlePrev = function () {
    swiperRef.current?.slidePrev();
  };
  const handleNext = function () {
    swiperRef.current?.slideNext();
  };

  if(!collection) return ;
  //console.log(collection)
  return (
    <section
      className="product--slider-section mt-4 mb-0 pt-3 pb-0 SectionWrapper"
      data-collection-title={collection?.title}
      data-collection-id={collection?._id}
    >
      <div className="container ">
        <div className="section--header d-flex align-items-center justify-content-between gap-2 text-left mb-3 flex-wrap">
          <h2 className="text-left collection--title m-0 d-block">
            {collection?.title ? collection?.title : 'Collection'}
          </h2>
          {collection?.slug && (
            <Link
              href={`/collections/` + collection?.slug}
              className="btn--primary-new btn--darkgrey"
            >
              View All
            </Link>
          )}
        </div>
        <div className="d-block" style={{ maxWidth: "1260px" }}>
          {collection?.products && collection?.products.length > 0 ? (
            <div className="cards-wrapper">
              <Swiper
                className="equal_nt ratio_nt on_list_view_false w-full h-full"
                modules={[Navigation]}
                loop={collection?.products.length > 4 ? true : false}
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
                {collection?.products?.map((product: any,index:number) => {
                  return (
                    <SwiperSlide className="text-white" key={index}>
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
          ) : (
            <>
             <p>No products found.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
