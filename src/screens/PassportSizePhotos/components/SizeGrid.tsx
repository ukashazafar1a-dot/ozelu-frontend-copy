"use client";

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, Mousewheel } from "swiper/modules";
import SizeCard from "./SizeCard";

const SizeGrid = ({ content }: any) => {
  const [cards, setCards] = useState<any>(() =>
    Array.isArray(content) ? content : null
  );
  const swiperRef = React.useRef<any>(null);

  const updateSwiperHeight = React.useCallback((swiperInstance?: any) => {
    const swiper = swiperInstance ?? swiperRef.current;
    if (!swiper || !swiper.params) return;
    if (typeof swiper.updateAutoHeight !== "function") return;

    // Guard against Swiper being in an uninitialized state during navigation.
    // Prevents: "Cannot read properties of undefined (reading 'slidesPerView')"
    const safeUpdate = () => {
      const current = swiperRef.current;
      if (!current || current !== swiper || !current.params) return;
      try {
        current.updateAutoHeight();
      } catch {
        // No-op: next slide/layout change will recalculate height.
      }
    };

    requestAnimationFrame(safeUpdate);
    window.setTimeout(safeUpdate, 320);
  }, []);

  const handlePrev = function () {
    swiperRef.current?.slidePrev();
  };
  const handleNext = function () {
    swiperRef.current?.slideNext();
  };
  //console.log("blocks", content);
  useEffect(() => {
    if (Array.isArray(content)) {
      setCards(content);
    }
  }, [content]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || !swiper.params) return;
    updateSwiperHeight(swiper);
  }, [cards, updateSwiperHeight]);

  // Initial / not-yet-set state: render nothing instead of "No Data Found!" flash.
  if (cards === null || cards === undefined) {
    return null;
  }

  return (
    <div className="sg-wrapper pt-3">
      {cards && cards.length > 0 ? (
        <Swiper
          centeredSlides={false}
          loop={false}
          autoHeight={true}
          observer={true}
          observeParents={true}
          observeSlideChildren={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChangeTransitionEnd={(swiper) => {
            updateSwiperHeight(swiper);
          }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          breakpoints={{
            420: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            990: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            1200: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            1400: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
          }}
          modules={[Navigation, Mousewheel]}
          className=""
        >
          {cards?.map((card: any, i: any) => {
              return (
                <SwiperSlide key={i}>
                  <SizeCard block={card} onLayoutChange={updateSwiperHeight} />
                </SwiperSlide>
              );
            })
          }
          {cards.length > 1 && (
            <>
              <div
                className="swiper-button-next swiper-btn"
                onClick={handleNext}
              >
                <span>
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </div>
              <div
                className="swiper-button-prev swiper-btn"
                onClick={handlePrev}
              >
                <span>
                  <i className="fa-solid fa-chevron-left"></i>
                </span>
              </div>{" "}
            </>
          )}
        </Swiper>
      ) : (
        <>
          <div className="min-h-zeor-grad d-flex align-items-center justify-content-center gap-2 my-3 container">
            <div className="image-wrapper">
              <img
                src="https://placehold.co/50x50?text=%3F"
                alt="No Data Found - Demo Print Shop"
                loading="lazy"
                width="50"
                height="50"
              />
            </div>
            <div className="content fw-bold h3 font-primary m-0">No Data Found!</div>
          </div>
        </>
      )}
    </div>
  );
};

export default SizeGrid;
