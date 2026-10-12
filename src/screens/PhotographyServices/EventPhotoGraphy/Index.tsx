"use client";

import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import "./photography.css";
import "./stylesBanner.css";
import AppReservationForm from "../ReservationForm/AppReservationForm";
import EventDubai from "./EventDubai";
import EventGallery from "./EventGallery";
import SectionLoader from "@/components/Loader/SectionLoader";

const EventPhotoGraphy = ({ content }: any) => {
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
        <div className="wrapper-event-photography">
          <Banner
            section={
              sections && sections?.homeBanner ? sections?.homeBanner : null
            }
          />
          <EventDubai
            section={
              sections && sections?.eventPhotoDubai
                ? sections?.eventPhotoDubai
                : null
            }
          />
          <EventGallery
            section={
              sections && sections?.eventPhotoExm
                ? sections?.eventPhotoExm
                : null
            }
          />
          <section>
            <AppReservationForm
              service="Event Photography"
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

export default EventPhotoGraphy;
