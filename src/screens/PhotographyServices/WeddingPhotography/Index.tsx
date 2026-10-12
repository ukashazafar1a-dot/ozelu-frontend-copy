"use client";

import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import "./photography.css";
import "./style.css";
import AppReservationForm from "../ReservationForm/AppReservationForm";
import WeddingDubai from "./WeddingDubai";
import WeddingPackage from "./WeddingPackage";
import WeddingGallery from "./WeddingGallery";
import SectionLoader from "@/components/Loader/SectionLoader";

const WeddingPhotography = ({ content }: any) => {
  const [sections, setSections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setSections(content);
    setLoading(false);
  }, [content]);
  //console.log("sections", sections);
  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <div className="wrapper-wedding-photography">
          <Banner
            section={
              sections && sections?.homeBanner ? sections?.homeBanner : null
            }
          />
          <WeddingDubai
            section={
              sections && sections?.weddingDubai ? sections?.weddingDubai : null
            }
          />
          <WeddingPackage section={
              sections && sections?.packages
                ? sections?.packages
                : null
            }/>
          <WeddingGallery
            section={
              sections && sections?.weddingExamples
                ? sections?.weddingExamples
                : null
            }
          />
          <section>
            <AppReservationForm
              service="Wedding Photography"
              image={
                sections && sections?.reserveForm
                  ? sections?.reserveForm?.settings?.image?.src
                  : null
              }
            />
          </section>
        </div>
      )}
    </>
  );
};

export default WeddingPhotography;
