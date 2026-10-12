"use client";
import React, { useEffect, useState } from "react";
import ImageWithText from "./ImageWithText";
import SizeChart from "./SizeChart";
import Faqs from "./Faqs";
import "./index.css";
import SectionLoader from "@/components/Loader/SectionLoader";
import ThreeColumns from "./ThreeColumns";
import NotActivePopup from "../DocumentPrinting/NotActivePopup";
import dynamic from "next/dynamic";
import { getAreas } from "@/helpers/apiRequests";
import DeliverySchedule from "@/components/DeliverySchedule";
import FeaturedCollection from "./FeaturedCollection";
import PromotionBar from "@/components/PromotionBar";
import TypesSection from "@/components/TypesSection";

const Index = ({ content }: any) => {
  const [sections, setSections] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const PhotoPrintingForm: any = dynamic(
    () => import("./PhotoPrintingForm/PhotoPrintingForm"),
    {
      loading: () => <SectionLoader />,
      ssr: false,
    }
  );

  const loadAreas = async function () {
    const data = await getAreas("photo-printing");
    setAreas(data);
  };

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    setSections(content?.settings?.sections);
    setData(content?.data);
    setLoading(false);
  }, [content]);
  return (
    <div className="printing-delivery--wrapper">
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          {/* <Banner/> */}
          <ThreeColumns
            section={
              sections && sections?.coverPhoto ? sections?.coverPhoto : null
            }
          />
          <div className="printing-delivery">
            <PromotionBar
              section={
                sections && sections?.richtext ? sections?.richtext : null
              }
            />
            {sections?.types && (
              <TypesSection section={sections.types} />
            )}
            <ImageWithText
              section={
                sections && sections?.photoDelivery
                  ? sections?.photoDelivery
                  : null
              }
            />
            <SizeChart data={data} section={sections && sections?.sizeChart ? sections.sizeChart : null} />
            <div id="printing-form">
              <PhotoPrintingForm data={data} areas={areas} sections={sections} />
            </div>
            {}
            <FeaturedCollection
              title={sections?.framesCollection?.settings?.title}
              products={data && data.photos_featured_collection && data.photos_featured_collection.products ? data.photos_featured_collection.products : []}
            />           
            <DeliverySchedule section={
                sections && sections?.delivery ? sections?.delivery : null
              }/>
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
        </>
      )}
    </div>
  );
};

export default Index;
