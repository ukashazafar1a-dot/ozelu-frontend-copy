"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import axios from "axios";
import ProductCard from "../../components/EComereceStore/ProductCard";
import { Navigation } from "swiper/modules";

function TrendingProducts() {
  const swiperRef = React.useRef<any>();
  const [products, setProducts] = useState([]);
  const [isError,setIsError] = useState(false);

  const handlePrev = function () {
    swiperRef.current?.slidePrev();
  };

  const handleNext = function () {
    swiperRef.current?.slideNext();
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const {data} = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/assets/collections/trendings");
        const {products} = data.collection;
        setProducts(products)
      } catch (error) {
        setIsError(true)
      }
    };
    getProducts();
  }, []);

  if(isError || products.length < 1) return;

  return (
    <section className="SectionWrapper">
      <div className="container">
        <div className="services-tittle">
          <div className="container">
            <h2 className="text-center my-3 heading-h2">Trending Now</h2>
          </div>
        </div>
        {products && (
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
                  280: {
                    slidesPerView: 2,
                  },
                  576: {
                    slidesPerView: 2,
                  },
                  768: {
                    slidesPerView: 3,
                  },
                }}
                spaceBetween={20}
              >
                {products.map((product: any) => {
                  return (
                    <SwiperSlide key={product?.slug} className="text-white">
                      <ProductCard product={product} />
                    </SwiperSlide>
                  );
                })}
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
        )}
      </div>
    </section>
  );
}

export default TrendingProducts;
