"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "./styles.css";
import "./photoDeliveryPage.css";
import PaymentPictures from "./PaymentPictures";
import CountingSection from "./CountingSection";
import Faqs from "./Faqs";
import SectionLoader from "@/components/Loader/SectionLoader";
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";
import NotActivePopup from "../DocumentPrinting/NotActivePopup";
import VideoSection from "./components/VideoSection";
import TipsSection from "./components/TipsSection";
import { getAreas } from "@/helpers/apiRequests";
import { PageData } from "@/libs/types";
import DeliverySchedule from "@/components/DeliverySchedule";
import PromotionBar from "@/components/PromotionBar";

const PhotoSizeChart = dynamic(() => import("./components/PhotoSizeChart"), {
  loading: () => <SectionLoader />,
  ssr: false,
});

const PhotosGuide = dynamic(() => import("./PhotosGuide"), {
  ssr: false,
});

const OrderForm = dynamic(() => import("./OrderForm/OrderForm"), {
  loading: () => <SectionLoader />,
  ssr: false,
});

type props = {
  content?: any;
};

function Index({ content }: props) {
  const [sections, setSections] = useState<any>(
    content?.settings?.sections ?? null
  );
  const [data, setData] = useState<PageData | null>(content?.data ?? null);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    setSections(content?.settings?.sections ?? null);
    setData(content?.data ?? null);
  }, [content]);

  const loadAreas = async () => {
    const areaData = await getAreas("passport-size");
    setAreas(areaData);
  };

  return (
    <div className="passport_page_template">
      <ThreeColumns
        section={
          sections && sections?.coverPhoto ? sections?.coverPhoto : null
        }
      />
      <PromotionBar
        section={sections && sections?.richtext ? sections?.richtext : null}
      />

      <PhotoSizeChart
        section={
          sections && sections?.passportSize ? sections?.passportSize : null
        }
      />
      <PhotosGuide
        section={
          sections && sections?.photoGuides ? sections?.photoGuides : null
        }
      />
      <VideoSection
        section={
          sections && sections?.videoSection ? sections?.videoSection : null
        }
      />
      <TipsSection
        section={
          sections && sections?.tipsSection ? sections?.tipsSection : null
        }
      />
      {data && (
        <div id="printing-form">
          <span id="passport-form" aria-hidden="true" />
          <OrderForm data={data} areas={areas} />
        </div>
      )}
      <PaymentPictures />
      <CountingSection
        section={
          sections && sections?.countingSection
            ? sections?.countingSection
            : null
        }
      />
      <div style={{ padding: "20px 0" }}>
        <DeliverySchedule
          section={
            sections && sections?.delivery ? sections?.delivery : null
          }
        />
      </div>
      <Faqs
        section={
          sections && sections?.faqSection ? sections?.faqSection : null
        }
      />
      {!data?.isActive ? (
        <NotActivePopup message={data?.alert_message} />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Index;
