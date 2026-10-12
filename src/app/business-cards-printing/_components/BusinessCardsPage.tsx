"use client";
import ErrorUi from "@/components/ErrorUi";
import FaqsSection from "@/components/FaqsSection";
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";
import PromotionBar from "@/components/PromotionBar";
import SizeChartSection from "@/components/SizeChartSection";
import TypesSection from "@/components/TypesSection";
import React, { useEffect, useState } from "react";
import BcardsOrderForm from "./BcardsOrderForm";
import DeliverySchedule from "@/components/DeliverySchedule";
import AlertMessage from "@/components/AlertMessage";
import { DeliveryArea, PageData } from "@/libs/types";
import { getAreas } from "@/helpers/apiRequests";
import BcardsChart from "./BcardsChart";
import SectionLoader from "@/components/Loader/SectionLoader";

type props = {
  sections: any;
  data: PageData;
};
const BusinessCardsPage = ({ sections, data }: props) => {
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
  const [loading, setLoading] = useState(true);
  const loadAreas = async () => {
    setLoading(true);
    const data = await getAreas("business-cards-printing");
    setAreas(data);
    setLoading(false);
  };
  useEffect(() => {
    loadAreas();
  }, []);
  if (!sections) return <ErrorUi />;
  //console.log("section -> ", sections);

  return (
    <div className="foam-board-page business-cards-printing-page">
      {loading ? (
        <SectionLoader/>
      ):<>
        {sections?.coverPhoto && (
          <ThreeColumns section={sections.coverPhoto} useH1ForTitle />
        )}
        {sections?.richtext && <PromotionBar section={sections?.richtext} />}
        {sections?.businesstypes && (
          <TypesSection section={sections?.businesstypes} />
        )}
        {sections?.premiumtypes && (
          <TypesSection section={sections?.premiumtypes} />
        )}
        {sections?.sizechart && (
          <SizeChartSection section={sections?.sizechart}>
            <BcardsChart data={data}/>
          </SizeChartSection>
        )}
        <div id="printing-form">
          <BcardsOrderForm data={data} areas={areas} />
        </div>
        {sections?.delivery && (
          <DeliverySchedule section={sections?.delivery} tableClass=" mb-4 " />
        )}
        {sections?.faqs && <FaqsSection section={sections?.faqs} />}
        {!data?.isActive && <AlertMessage message={data?.alert_message} />}
      </>}
    </div>
  );
};

export default BusinessCardsPage;
