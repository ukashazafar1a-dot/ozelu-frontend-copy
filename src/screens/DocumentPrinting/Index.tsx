"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SectionLoader from "@/components/Loader/SectionLoader";
import NotActivePopup from "./NotActivePopup";
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";
import ImageWithText from "./ImageWithText";
import { getAreas } from "@/helpers/apiRequests";
import Faqs from "./Faqs";
import { PageData } from "@/libs/types";
import { sortArrayAlphabetically } from "@/libs/utils";
import BindingChart from "./BindingChart";
import LaminationChart from "./LaminationChart";
import VolumeBasedPricingChart from "./VolumeBasedPricingChart";
import DeliverySchedule from "@/components/DeliverySchedule";
import PromotionBar from "@/components/PromotionBar";

const DacumentPrintingForm = dynamic(
  () => import("./DcumentPrintingForm/DacumentPrintingForm"),
  {
    loading: () => <SectionLoader />,
    ssr: false,
  }
);

const Index = ({ content }: any) => {
  // console.log("Content",content)
  const [sections, setSections] = useState<any>(null);
  const [data, setData] = useState<PageData | null>(null);
  const [areas, setAreas] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const loadAreas = async () => {
    const data = await getAreas("document-printing");
    //console.log('data',data);
    if (data) {
      const sortedAreas = sortArrayAlphabetically(data);
      setAreas(sortedAreas);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    setSections(content?.settings?.sections);
    setData(content?.data);
    setLoading(false);
  }, [content]);
  // console.log("Content",content)
  // console.log(sections, "data", data, "areas", areas);

  return (
    <div className="wrapper-dacument-container">
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
          <PromotionBar
            section={sections && sections?.richtext ? sections?.richtext : null}
          />
          <ImageWithText
            section={
              sections && sections?.photoDelivery
                ? sections?.photoDelivery
                : null
            }
          />
          {data && (
            <>
              {/* <PricesChart data={data} /> */}
              <VolumeBasedPricingChart data={data} />
              <BindingChart
                data={data}
                section={
                  sections && sections?.binding ? sections?.binding : null
                }
              />
              <LaminationChart
                data={data}
                section={
                  sections && sections?.lamination ? sections?.lamination : null
                }
              />
            </>
          )}
          {data && <DacumentPrintingForm data={data} areas={areas} />}
          {!data?.isActive ? (
            <NotActivePopup message={data?.alert_message} />
          ) : (
            <></>
          )}
          <DeliverySchedule
            section={sections && sections?.delivery ? sections?.delivery : null}
          />
          <Faqs
            section={
              sections && sections?.faqSection ? sections?.faqSection : null
            }
          />
        </>
      )}
    </div>
  );
};

export default Index;
