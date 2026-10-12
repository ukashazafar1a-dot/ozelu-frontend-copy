"use client";
import ErrorUi from "@/components/ErrorUi";
import FaqsSection from "@/components/FaqsSection";
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";
import PromotionBar from "@/components/PromotionBar";
import SizeChartSection from "@/components/SizeChartSection";
import TypesSection from "@/components/TypesSection";
import BenefitsSection from "@/components/BenefitsSection";
import React, { useEffect, useState } from "react";
import FlyersOrderForm from "./FlyersOrderForm";
import FlyersChart from "./FlyersChart";
import DeliverySchedule from "@/components/DeliverySchedule";
import AlertMessage from "@/components/AlertMessage";
import { DeliveryArea, PageData } from "@/libs/types";
import { getAreas } from "@/helpers/apiRequests";
import SectionLoader from "@/components/Loader/SectionLoader";

type Props = {
  sections: any;
  data: PageData;
};

const FlyersPrintingPage = ({ sections, data }: Props) => {
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAreas = async () => {
    setLoading(true);
    const data = await getAreas("flyers-printing");
    setAreas(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAreas();
  }, []);

  if (!sections) return <ErrorUi />;

  return (
    <div className="foam-board-page flyers-printing-page">
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          {sections?.coverPhoto && (
            <ThreeColumns section={sections.coverPhoto} useH1ForTitle />
          )}
          {sections?.richtext && <PromotionBar section={sections?.richtext} />}
          {sections?.types && <TypesSection section={sections?.types} />}
          {sections?.benefits && (
            <BenefitsSection section={sections?.benefits} />
          )}
          {data?.flyers_prices && data.flyers_prices.length > 0 && (
            <SizeChartSection
              section={
                sections?.sizechart || {
                  settings: {
                    title: "Size Chart &amp; Prices",
                    content: "Please Choose Your Flyer Type Below",
                  },
                }
              }
            >
              <FlyersChart data={data} />
            </SizeChartSection>
          )}
          <div id="printing-form">
            <FlyersOrderForm data={data} areas={areas} />
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

export default FlyersPrintingPage;
