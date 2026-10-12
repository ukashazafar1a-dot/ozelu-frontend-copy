"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard from "./ProductCard";
import { Section } from "@/libs/schemaTypes";
import { htmlDecode } from "@/helpers/generals";
import { baseURL } from "@/libs/utils";
import SectionLoader from "../Loader/SectionLoader";

type props = {
  section: Section;
};

const FeaturedCollection = ({ section }: props) => {
  const [products, setProducts] = React.useState<any>(null);
  const [loading, setLoading] = useState(true);
  const swiperRef = React.useRef<any>(null);

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const fetchProducts = async (collectionId: string) => {
    try {
      setLoading(true);
      const apiURl = `${baseURL}/api/assets/collections/${collectionId}`;
      const data = await fetch(apiURl);
      const result = await data.json();
      //console.log(result);
      if(!result?.status){
        setProducts(null);
      }else{
        setProducts(result?.collection?.products);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (section) {
      if (section?.settings?.collection) {
        fetchProducts(section?.settings?.collection);
      } else {
        setProducts(null);
        setLoading(false);
      }
    }
  }, [section]);

  if(loading){
    return <SectionLoader />
  }

  if (!products || products.length < 1) return;

  return (
    <section className="SectionWrapper">
      <div className="container">
        {section?.settings?.title && (
          <div className="services-tittle">
            <div className="container">
              <h2
                className="text-center my-3 heading-h2"
                dangerouslySetInnerHTML={{
                  __html: htmlDecode(section?.settings?.title),
                }}
              />
            </div>
          </div>
        )}
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
                    slidesPerView: 4,
                  },
                }}
                spaceBetween={20}
              >
                {products &&
                  products.map((product: any) => {
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
};

export default FeaturedCollection;
