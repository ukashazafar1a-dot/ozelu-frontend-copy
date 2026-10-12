"use client";

import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import "./style.css";
import AppReservationForm from "../ReservationForm/AppReservationForm";
import Packages from "./Packages";
import ServiceExamples from "./ServiceExamples";
import SectionLoader from "@/components/Loader/SectionLoader";

const PortraitHeadshots = ({ content }: any) => {
  const [sections, setSections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setSections(content);
    setLoading(false);
  }, [content]);
  //console.log('sections',sections)
  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <div className="portrait-headshots-wrapper wrapper-headshot-photography">
          <Banner
            section={
              sections && sections?.homeBanner ? sections?.homeBanner : null
            }
          />
          <Packages
            section={
              sections && sections?.headPackages ? sections?.headPackages : null
            }
            dubai={sections && sections?.headDubai ? sections?.headDubai : null}
          />
          <ServiceExamples
            section={
              sections && sections?.headshotsExamples
                ? sections?.headshotsExamples
                : null
            }
          />
          <section className="new--form">
            <AppReservationForm
              service="Portraits Photography"
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

export default PortraitHeadshots;
