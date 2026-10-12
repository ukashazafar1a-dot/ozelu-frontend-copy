"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard from "@/components/EComereceStore/ProductCard";
import { htmlDecode } from "@/helpers/generals";

type props = {
  products: any[];
  title?: string;
};

const DEFAULT_TITLE = "Do You Need Photo Frames";

const GreetingCardsFeaturedCollection = ({ products, title }: props) => {
  const swiperRef = React.useRef<any>();

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  if (!products || products.length < 1) return null;

  const heading = title?.trim() ? title : DEFAULT_TITLE;

  return (
    <section className="SectionWrapper greeting-cards-featured-collection">
      <div className="container">
        <div className="services-tittle">
          <div className="container">
            <h2
              className="heading-h2 text-center my-3"
              dangerouslySetInnerHTML={{
                __html: htmlDecode(heading),
              }}
            />
          </div>
        </div>
        <div style={{ maxWidth: "1260px" }}>
          <div className="cards-wrapper">
            <Swiper
              className="equal_nt ratio_nt on_list_view_false"
              style={{ width: "100%", height: "100%" }}
              modules={[Navigation]}
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
              }}
              breakpoints={{
                280: { slidesPerView: 2 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 4 },
              }}
              spaceBetween={20}
            >
              {products.map((product: any) => (
                <SwiperSlide key={product?.slug} className="text-white">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
            <i
              className="btn--next fa-solid fa-chevron-right"
              onClick={handleNext}
              typeof="next"
            ></i>
            <i
              className="btn--prev fa-solid fa-chevron-left"
              onClick={handlePrev}
              typeof="prev"
            ></i>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GreetingCardsFeaturedCollection;
