"use client";
import { htmlDecode, returnImage, scrollToTop } from "@/helpers/generals";
import React, { useEffect } from "react";
import ContentTable from "./ContentTable";
import Link from "next/link";
import VideoSection from "../PassportSizePhotos/components/VideoSection";

const PageContent = ({ content, section }: any) => {
  //console.log(content, section);

  const renderVideo = (section: any) => {
    if (section?.settings?.link) {
      return (
        <section className="d-block container pb-5">
          {section?.settings?.title && (
            <div className="section--header text-center mb-5">
              <h2 className="heading-h2 text-center mx-0 mt-0 fw-bold">
                {section?.settings?.title}
              </h2>
            </div>
          )}
          {section?.settings?.link && (
            <div className="iframe-wrapper mx-auto">
              <div className="postion-relative iframe-contaniner">
                <iframe
                  className="inn-iframe "
                  src={`${section?.settings?.link}&theme=dark&autohide=1&modestbranding=1&showinfo=0&fs=0&controls=1&playsinline=1&rel=0&enablejsapi=1`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          )}
        </section>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="title-main py-5 px-3 text-center mb-3">
        <h1 className="h2 fw-bold">{content?.title}</h1>
      </div>
      <div className="main-actions d-flex justify-content-start text-left flex-column align-items-center mb-3 p-3 container border">
        {section?.settings?.text && (
          <div
            className="rte mb-3 w-100 text-left"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.text),
            }}
          />
        )}
        <Link
          href={"/passport-size-photos#passport-form"}
          onClick={scrollToTop}
          className="btn--primary-new rounded-pill btn--green align-self-md-start align-self-center"
        >
          <span>Place Order</span>
        </Link>
      </div>
      <div className="inner container">
        <div className="image-wrapper mb-5 d-flex justify-content-center align-items-center gap-3 small-view-image">
          <div className="image-wrapper">
            {returnImage(content?.before_image, "card-image", 800)}
          </div>
          <div className="image-wrapper">
            {returnImage(content?.after_image, "card-image", 800)}
          </div>
        </div>
        {renderVideo(section)}
        <ContentTable content={content?.requirements} />
        <div className="main-actions d-flex justify-content-center align-items-center">
          <Link
            href={"/passport-size-photos#passport-form"}
            onClick={scrollToTop}
            className="btn--primary-new btn--green"
          >
            Place Order Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageContent;
