"use client";
import { htmlDecode } from "@/helpers/generals";
import { Section } from "@/libs/schemaTypes";
import React from "react";
import { Image } from "./ui/Image";
import Link from "next/link";

type props = {
  section: Section | null;
  imageClass?: string | null;
};

const ImageWithText = ({ section, imageClass }: props) => {
  if (!section) return <></>;
  const scrollToForm = () => {
    const form = document.getElementById("orderForm");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section
      className="image-with-text--section iwt-section"
      style={{
        background: section?.settings?.bgClr,
        color: section?.settings?.textClr,
      }}
    >
      <div className="row m-0">
        <div className="col-md-6 p-3 px-md-5 d-flex align-items-center justify-content-center">
          <div className="d-flex align-items-center justify-content-center flex-column content-wrapper h-100">
            {section?.settings?.title && (
              <h1
                className="heading-h2 text-center mx-0 mt-0 mb-3 my-md-3 fw-bold"
                dangerouslySetInnerHTML={{
                  __html: htmlDecode(section?.settings?.title),
                }}
              />
            )}
            {section?.settings?.content && (
              <div
                className="rte mb-md-5 mb-3 text-center content"
                dangerouslySetInnerHTML={{
                  __html: htmlDecode(section?.settings?.content),
                }}
              />
            )}
            <div className="d-flex justify-content-center align-items text-center small-hide mb-4">
              <button
                className="btn--primary-new"
                title="Place Order"
                onClick={(e) => scrollToForm()}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6 p-0">
          <Image
            image={section.settings?.image}
            className={imageClass ? imageClass : ""}
          />
        </div>
        <div className="p-3 col-12 medium-hide">
          <div className="d-flex justify-content-center align-items text-center">
            <button
              className="btn--primary-new"
              title="Place Order"
              onClick={(e) => scrollToForm()}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageWithText;
