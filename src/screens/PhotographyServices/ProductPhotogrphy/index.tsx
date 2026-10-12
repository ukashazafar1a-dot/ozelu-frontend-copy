"use client";
import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import ImageWithText from "./ImageWithText";
import ImagesGallery from "./ImagesGallery";
import AppReservationForm from "../ReservationForm/AppReservationForm";
import SectionLoader from "@/components/Loader/SectionLoader";

const ProductPhotographyPage = ({ content }: any) => {
  const [sections, setSections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setSections(content);
    setLoading(false);
  }, [content]);
  //console.log("sections", sections);
  return (
    <div className="product-photography-page-wrapper">
      {loading ? (
        <SectionLoader />
      ) : (
        <div className="main_wrapper d-block overflow-hidden wrapper-event-photography">
          <Banner section={
              sections && sections?.homeBanner ? sections?.homeBanner : null
            }/>
          <ImageWithText section={
              sections && sections?.productDubai
                ? sections?.productDubai
                : null
            }/>
          <ImagesGallery section={
              sections && sections?.productExamples
                ? sections?.productExamples
                : null
            }/>
          <AppReservationForm
            service="Food Photography"
            title={"Request for Quote"}
            image={
              sections && sections?.reserveForm
                ? sections?.reserveForm?.settings?.image?.src
                : null
            }
          />
        </div>
      )}
    </div>
  );
};

export default ProductPhotographyPage;
