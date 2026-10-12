"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import axios from "axios";
import ProductCard from "../../components/EComereceStore/ProductCard";
import SectionLoader from "@/components/Loader/SectionLoader";

function RecommendedProducts() {
  const swiperRef = React.useRef<any>();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const { data } = await axios.get(
          process.env.NEXT_PUBLIC_API_URL +
          "/api/assets/collections/trendings"
        );
        const { products } = data.collection;
        setProducts(products);
        setLoading(false);
      } catch (error) {
        setIsError(true)
      }
    };
    getProducts();
  }, []);

  if(isError || products.length < 1) return;

  return (
    <div className="SectionWrapper mb-5">
      <div className="container">
        {loading ? (
          <SectionLoader />
        ) : (
          <>
            {products && products.length > 0 && (
              <>
                <section className="services-tittle">
                  <div className="container px-md-2 px-0">
                    <h2 className="txt-center heading-h2 mx-0">Trending Products</h2>
                  </div>
                </section>
                <section style={{ maxWidth: "1260px" }}>
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
                          slidesPerView: 4,
                        },
                      }}
                      spaceBetween={20}
                    >
                      {products.map((product: any, i: any) => {
                        return (
                          <SwiperSlide key={i} style={{ background: "white" }}>
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
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RecommendedProducts;
