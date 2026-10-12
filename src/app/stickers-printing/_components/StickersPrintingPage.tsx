"use client";
import BenefitsSection from "@/components/BenefitsSection";
import ErrorUi from "@/components/ErrorUi";
import FaqsSection from "@/components/FaqsSection";
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";
import PromotionBar from "@/components/PromotionBar";
import SizeChartSection from "@/components/SizeChartSection";
import TypesSection from "@/components/TypesSection";
import React, { useEffect, useState } from "react";
import SppOrderForm from "./SppOrderForm";
import DeliverySchedule from "@/components/DeliverySchedule";
import { DeliveryArea, PageData } from "@/libs/types";
import AlertMessage from "@/components/AlertMessage";
import StickerPrintingChart from "./StickerPrintingChart";
import { getAreas } from "@/helpers/apiRequests";
import SectionLoader from "@/components/Loader/SectionLoader";

type props = {
  sections: any;
  data: PageData;
};
const StickersPrintingPage = ({ sections, data }: props) => {
   const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
    const [loading, setLoading] = useState(true);
    const loadAreas = async () => {
      setLoading(true);
      const data = await getAreas("stickers-printing");
      setAreas(data);
      setLoading(false);
    };
    useEffect(() => {
      loadAreas();
    }, []);
  if (!sections) return <ErrorUi />;
  //console.log("section -> ", sections,data);

  
  return (
    <div className="foam-board-page stickers-printing-page">
      {loading ? (
        <SectionLoader/>
      ):(
        <>
        {sections?.coverPhoto && (
          <ThreeColumns section={sections.coverPhoto} useH1ForTitle />
        )}
        {sections?.richtext && <PromotionBar section={sections?.richtext} />}
        {sections?.types && <TypesSection section={sections?.types} />}
        {sections?.benefits && <BenefitsSection section={sections?.benefits} />}
        {sections?.sizechart && (
          <SizeChartSection section={sections?.sizechart}>
            <StickerPrintingChart data={data}/>
          </SizeChartSection>
        )}
        {/* {sections?.pricecalculator && (
          <SizeChartSection section={sections?.pricecalculator} data={null} />
        )} */}
        <div id="printing-form">
          <SppOrderForm data={data} areas={areas} />
        </div>
        {sections?.delivery && (
          <DeliverySchedule section={sections?.delivery} tableClass=" mb-4 " />
        )}
        {sections?.faqs && <FaqsSection section={sections?.faqs} />}
        {!data?.isActive && <AlertMessage message={data?.alert_message} />}
        </>
      )}
    </div>
  );
};

export default StickersPrintingPage;
