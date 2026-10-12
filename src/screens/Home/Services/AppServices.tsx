import React, { useEffect, useState } from "react";
import "./styleAppServices.css";
import SectionLoader from "@/components/Loader/SectionLoader";
import { Navigation, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ServiceCard from "./ServiceCard";
import { htmlDecode } from "@/helpers/generals";

const AppServices = ({ section }: any) => {
  const [blocks, setBlocks] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const swiperRef = React.useRef<any>();
  const prevRef = React.useRef<any>();
  const nextRef = React.useRef<any>();

  const handlePrev = function () {
    swiperRef.current?.slidePrev();
  };

  const handleNext = function () {
    swiperRef.current?.slideNext();
  };
  //console.log(section);
  useEffect(() => {
    setBlocks(section?.blocks);
    setLoading(false);
  }, [section]);
  //console.log("blocks", blocks);
  //console.log("section", section);
  if(!blocks) return '';
  return (
    <section className="printing-services--wrapper">
      <div className="printing-services SectionWrapper">
        <div className="services-tittle">
          <div className="container">
            <h2
              className="text-center heading-h2 my-5 mx-0"
              dangerouslySetInnerHTML={{
                __html: htmlDecode(section?.settings?.title),
              }}
            />
          </div>
        </div>
        {loading ? (
          <SectionLoader />
        ) : (
          <>
            {blocks && blocks?.length > 0 ? (
              <div
                className="mb-4 services-wrapper"
                style={{
                  background: `${
                    section?.settings?.bgclr
                      ? section?.settings?.bgclr
                      : "#fffee5"
                  }`,
                }}
              >
                <div className="cards-wrapper container py-5">
                  <Swiper
                    className="equal_nt ratio_nt on_list_view_false w-full h-full"
                    modules={[Navigation, Pagination, Scrollbar]}
                    loop={true}
                    navigation={{
                      prevEl: prevRef?.current,
                      nextEl: nextRef?.current,
                    }}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                    onBeforeInit={(swiper) => {
                      //console.log("Swiper>>",swiper)
                      swiperRef.current = swiper;
                    }}
                    breakpoints={{
                      280: {
                        slidesPerView: 1,
                      },
                      576: {
                        slidesPerView: 1,
                      },
                      768: {
                        slidesPerView: 3,
                      },
                    }}
                    spaceBetween={20}
                  >
                    {blocks.map((card: any) => {
                      return (
                        <SwiperSlide className="text-white" key={card?.title}>
                          <ServiceCard card={card?.settings} />
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
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AppServices;
