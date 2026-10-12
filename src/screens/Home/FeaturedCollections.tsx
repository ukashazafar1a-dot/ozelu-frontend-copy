"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";
import CollectionCard from "../../components/EComereceStore/CollectionCard";
import { Navigation } from "swiper/modules";

function FeaturedCollections() {
  const swiperRef = React.useRef<any>();
  const prevRef = React.useRef<any>();
  const nextRef = React.useRef<any>();
  const [collections, setCollections] = useState<any>([]);

  const handlePrev = function () {
    swiperRef.current?.slidePrev();
  };

  const handleNext = function () {
    swiperRef.current?.slideNext();
  };

  useEffect(() => {
    const getCollections = async () => {
      try {
        const { data } = await axios.get(
          process.env.NEXT_PUBLIC_API_URL +
            "/api/assets/collections/by-tag/" +
            "trending"
        );
        //console.log("Data",data)
        const { collections } = data;
        setCollections(collections);
      } catch (error) {
        setCollections([]);
      }
    };
    getCollections();
  }, []);
  //console.log(collections);
  return (
    <section className="SectionWrapper mb-3">
      {collections && (
        <div className="container ">
          <div className="services-tittle">
            <div className="container">
              <h2 className="text-center heading-h2 my-5 mx-0">
                E-Commerce Store
              </h2>
            </div>
          </div>
          <div className="mb-4" style={{ maxWidth: "1260px" }}>
            <div className="cards-wrapper">
              <Swiper
                className="equal_nt ratio_nt on_list_view_false w-full h-full"
                modules={[Navigation]}
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
                    slidesPerView: 3,
                  },
                  576: {
                    slidesPerView: 3,
                  },
                  768: {
                    slidesPerView: 4,
                  },
                }}
                spaceBetween={20}
              >
                {collections.map((collection: any) => {
                  return (
                    <SwiperSlide className="text-white" key={collection?.title}>
                      <CollectionCard collection={collection} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <i
                className="btn--next fa-solid fa-chevron-right"
                ref={nextRef}
                onClick={handleNext}
                typeof="next"
              ></i>
              <i
                className="btn--prev fa-solid fa-chevron-left"
                ref={prevRef}
                onClick={handlePrev}
                typeof="prev"
              ></i>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default FeaturedCollections;
