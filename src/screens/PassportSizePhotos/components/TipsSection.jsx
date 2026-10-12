"use client";
import React, { useState } from "react";
import FsLightbox from "fslightbox-react";
import { returnImage } from "@/helpers/generals";

const TipsSection = ({ section }) => {
  const [adultToggler, setAdultToggler] = useState(false);
  const [kidsToggler, setKidsToggler] = useState(false);
  const [babyToggler, setBabyToggler] = useState(false);
  const [selectedTip, setSelectedTip] = useState("Adult");
  //console.log(section);
  const handleClick = (str) => {
    setSelectedTip(str);
  };

  if(!section) return <></>;

  return (
    <section className="d-block container ">
      <div className="section--header text-center mb-5">
        <h2 className="heading-h2 text-center mx-0 mt-0 fw-bold">
          {section?.settings?.title}
        </h2>
      </div>
      <div className="d-flex align-items-center justify-content-center gap-3 mb-3 buttons--flex">
        {section?.settings?.adultImage && (
          <button
            className={`btn--primary-new rounded-pill ${
              selectedTip == "Adult" ? "active" : "nothing"
            }`}
            onClick={() => handleClick("Adult")}
          >
            Adult Tips
          </button>
        )}
        {section?.settings?.kidsImage && (
          <button
            className={`btn--primary-new rounded-pill ${
              selectedTip == "Kids" ? "active" : "nothing"
            }`}
            onClick={() => handleClick("Kids")}
          >
            Kids Tips
          </button>
        )}
        {section?.settings?.babyImage && (
          <button
            className={`btn--primary-new rounded-pill ${
              selectedTip == "Baby" ? "active" : "nothing"
            }`}
            onClick={() => handleClick("Baby")}
          >
            Baby Tips
          </button>
        )}
      </div>
      <div className="images-wrapper">
        {selectedTip == "Adult" && section?.settings?.adultImage ? (
          <div className="image_wrapper">
            <div
              className="inside-new"
              onClick={() => setAdultToggler(!adultToggler)}
            >
              {returnImage(section?.settings?.adultImage, "w-100")}
            </div>
            <FsLightbox
              toggler={adultToggler}
              sources={[section?.settings?.adultImage?.src]}
            />
          </div>
        ) : (
          <></>
        )}
        {selectedTip == "Kids" && section?.settings?.kidsImage ? (
          <div className="image_wrapper">
            <div
              className="inside-new"
              onClick={() => setKidsToggler(!kidsToggler)}
            >
              {returnImage(section?.settings?.kidsImage, "w-100")}
            </div>
            <FsLightbox
              toggler={kidsToggler}
              sources={[section?.settings?.kidsImage?.src]}
            />
          </div>
        ) : (
          <></>
        )}
        {selectedTip == "Baby" && section?.settings?.babyImage ? (
          <div className="image_wrapper">
            <div
              className="inside-new"
              onClick={() => setBabyToggler(!babyToggler)}
            >
              {returnImage(section?.settings?.babyImage, "w-100")}
            </div>
            <FsLightbox
              toggler={babyToggler}
              sources={[section?.settings?.babyImage?.src]}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </section>
  );
};

export default TipsSection;
