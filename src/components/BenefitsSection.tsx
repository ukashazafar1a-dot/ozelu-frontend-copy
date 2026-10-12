"use client";
import { htmlDecode } from "@/helpers/generals";
import { Section } from "@/libs/schemaTypes";
import React from "react";
import { Image } from "./ui/Image";

type props = {
  section: Section | null;
};

const BenefitsSection = ({ section }: props) => {
  function scroll() {
    const form = document.getElementById("orderForm");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  }
  return (
    <div
      className="benefits-section"
      style={{
        background: section?.settings?.bgClr,
        color: section?.settings?.textClr,
      }}
    >
      <div className="container py-3 pt-md-3 pb-md-5">
        {section?.settings?.title && (
          <h2
            className="heading-h2 text-center my-3 fw-bold"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.title),
            }}
          />
        )}
        {section?.settings?.text && (
          <div
            className="rte mb-5 text-center content"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.text),
            }}
          />
        )}
        <div className="row">
          <div className="col-md-6 p-0">
            <Image image={section?.settings?.image} />
          </div>
          <div className="col-md-6">
            <div className="photo-txt content">
              {section?.settings?.content && (
                <div
                  className="rte"
                  dangerouslySetInnerHTML={{
                    __html: htmlDecode(section?.settings?.content),
                  }}
                />
              )}
              <div className="py-3 my-2 d-flex align-items-center justify-content-center text-center">
                <button
                  onClick={scroll}
                  className="btn--primary-new heading-h1 mx-auto"
                  style={{
                    background: section?.settings?.btnBgClr,
                    color: section?.settings?.btnTextClr,
                  }}
                >
                  Place Your Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;
