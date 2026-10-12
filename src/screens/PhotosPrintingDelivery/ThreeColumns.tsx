"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar } from "swiper/modules";
import {
  htmlDecode,
  normalizeStepBodyHtml,
  returnImage,
  splitStepContent,
} from "@/helpers/generals";
import ActionBtn from "./ActionBtn";

function buildStepItem(section: any, stepNum: number) {
  const subtitleKey = `step${stepNum}subtitle`;
  const contentKey = `step${stepNum}content`;
  const explicitSubtitle = section?.settings?.[subtitleKey];
  const stepContent = section?.settings?.[contentKey];

  if (explicitSubtitle) {
    return {
      subtitle: explicitSubtitle,
      content: normalizeStepBodyHtml(stepContent),
    };
  }
  const { subtitle, content } = splitStepContent(stepContent);
  return { subtitle, content: normalizeStepBodyHtml(content) };
}

const ThreeColumns = ({ section, useH1ForTitle = true, sectionClassName = "" }: any) => {
  const data = [1, 2, 3].map((stepNum) => ({
    image: section?.settings?.[`step${stepNum}img`],
    title: section?.settings?.[`step${stepNum}title`],
    ...buildStepItem(section, stepNum),
  }));
  //console.log(data)
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    function handleWindowSize() {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setIsMobile(width < 768);
      }
    }
    window.addEventListener("resize", handleWindowSize);
    handleWindowSize();
    return () => {
      window.removeEventListener("resize", handleWindowSize);
    };
  }, []);
  //console.log(section);
  return (
    <>
      {/* Styled JSX */}
      <style jsx>{`
        @media (min-width: 769px) {
          .tc-main-23jdhi3dljm4 {
            background-image: url(${section?.settings?.bgimgDesktop?.src});
          }
        }
        @media (max-width: 768px) {
          .tc-main-23jdhi3dljm4 {
            background-image: url(${section?.settings?.bgimgMobile
              ? section?.settings?.bgimgMobile?.src
              : section?.settings?.bgimgDesktop?.src});
          }
        }
      `}</style>
      <section
        className={`section--wrapper bgImg-section tc-main-23jdhi3dljm4${sectionClassName ? ` ${sectionClassName}` : ""}`}
      >
        <div className="inside-main">
          <div className="section--header mt-3 mb-4">
            {section?.settings?.title && (
              <h1 className="heading-h2 text-center mb-2 p-0 mx-0 mt-0">
                {section?.settings?.title}
              </h1>
            )}
            {section?.settings?.content && (
              <div
                className="rte text-center font-simple sub-heading"
                dangerouslySetInnerHTML={{
                  __html: htmlDecode(section?.settings?.content),
                }}
              />
            )}
          </div>
          {isMobile ? (
            <Swiper
              className="w-100"
              modules={[Navigation, Pagination, Scrollbar]}
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              slidesPerView={1}
              spaceBetween={20}
              loop={true}
              autoHeight={true}
            >
              {data.map((item: any, index: number) => {
                return (
                  <SwiperSlide className="slides p-3" key={index}>
                    <div className="tc-img-wrapper">
                      {returnImage(item?.image,'three-columns-image',260)}
                    </div>
                    {item?.title && (
                      <p className="heading-h3 fw-bold mb-2">{item?.title}</p>
                    )}
                    {item?.subtitle && (
                      <div
                        className="rte rte-settings content subtitle"
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(item?.subtitle),
                        }}
                      />
                    )}
                    {item?.content && (
                      <div
                        className="rte rte-settings content"
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(item?.content),
                        }}
                      />
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div className="mb-3 tc-flex">
              {data.map((item: any, index: number) => {
                return (
                  <div
                    className="tc-flex-item p-3 d-flex flex-column text-center align-items-center justify-content-start"
                    key={index}
                  >
                    <div className="tc-img-wrapper">
                      {returnImage(item?.image,'three-columns-image',260)}
                    </div>
                    {item?.title && (
                      <p className="heading-h3 fw-bold mb-2">{item?.title}</p>
                    )}
                    {item?.subtitle && (
                      <div
                        className="rte rte-settings content subtitle"
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(item?.subtitle),
                        }}
                      />
                    )}
                    {item?.content && (
                      <div
                        className="rte rte-settings content"
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(item?.content),
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="d-flex justify-content-center align-items text-center">
            <ActionBtn
              btnBgClr={section?.settings?.btnBgClr}
              btnTextClr={section?.settings?.btnTextClr}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ThreeColumns;
