"use client";
import AlertMessage from "@/components/AlertMessage";
import BenefitsSection from "@/components/BenefitsSection";
import DeliverySchedule from "@/components/DeliverySchedule";
import ErrorUi from "@/components/ErrorUi";
import FaqsSection from "@/components/FaqsSection";
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";
import PromotionBar from "@/components/PromotionBar";
import SizeChartSection from "@/components/SizeChartSection";
import TypesSection from "@/components/TypesSection";
import { getAreas } from "@/helpers/apiRequests";
import { DeliveryArea, PageData } from "@/libs/types";
import React, { useEffect, useState } from "react";
import CanvasOrderForm from "./CanvasOrderForm";
import SectionLoader from "@/components/Loader/SectionLoader";
import CPcardsChart from "./CPcardsChart";

type props = {
  sections: any;
  data: PageData;
};
const CanvasPrintingPage = ({ sections, data }: props) => {
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
    const [loading, setLoading] = useState(true);
    const loadAreas = async () => {
      setLoading(true);
      const data = await getAreas("canvas-printing");
      setAreas(data);
      setLoading(false);
    };
    useEffect(() => {
      loadAreas();
    }, []);
  if (!sections) return <ErrorUi />;
  //console.log("section -> ", sections);

  return (
    <div className="foam-board-page canvas-printing-page">
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
            <SizeChartSection section={sections?.sizechart} data={null}>
              <CPcardsChart data={data}/>
            </SizeChartSection>
          )}
          <div id="printing-form">
            <CanvasOrderForm data={data} areas={areas} />
          </div>
          {sections?.delivery && <DeliverySchedule section={sections?.delivery} tableClass=" mb-4 "/>}
          {sections?.faqs && <FaqsSection section={sections?.faqs} />}
          {!data?.isActive && <AlertMessage message={data?.alert_message} />}
        </>
      )}
    </div>
  );
};

export default CanvasPrintingPage;
