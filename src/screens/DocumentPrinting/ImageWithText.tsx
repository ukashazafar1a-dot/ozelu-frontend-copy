"use client";
import { htmlDecode, returnImage } from "@/helpers/generals";
import React from "react";

function ImageWithText({ section }: any) {
  function scroll() {
    const form = document.getElementById("printing-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      className="photo-delivery"
      style={{
        backgroundColor: section?.settings?.bgClr || "#FFFCED",
        color: section?.settings?.textClr,
      }}
    >
      <div className="container pt-5 pb-3 pt-md-3 pb-md-5">
        {section?.settings?.title && (
          <h2 className="heading-h2 text-center mx-0 mt-0 mb-3 my-md-3 fw-bold">
            {section?.settings?.title}
          </h2>
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
            {returnImage(section?.settings?.image, "image-with-text", 600)}
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
                  className="btn--primary-new heading-h1 btn--darkyellow mx-auto"
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
}

export default ImageWithText;
