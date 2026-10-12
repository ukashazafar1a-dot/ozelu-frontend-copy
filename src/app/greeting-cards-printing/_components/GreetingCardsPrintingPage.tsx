"use client";
import AlertMessage from "@/components/AlertMessage";
import BenefitsSection from "@/components/BenefitsSection";
import DeliverySchedule from "@/components/DeliverySchedule";
import GreetingCardsFeaturedCollection from "./GreetingCardsFeaturedCollection";
import ErrorUi from "@/components/ErrorUi";
import FaqsSection from "@/components/FaqsSection";
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";
import PromotionBar from "@/components/PromotionBar";
import SizeChartSection from "@/components/SizeChartSection";
import TypesSection from "@/components/TypesSection";
import SectionLoader from "@/components/Loader/SectionLoader";
import { SectionsObject } from "@/libs/schemaTypes";
import { DeliveryArea, PageData } from "@/libs/types";
import { getAreas } from "@/helpers/apiRequests";
import React, { useEffect, useState } from "react";
import GreetingCardsChart from "./GreetingCardsChart";
import GreetingCardsOrderForm from "./GreetingCardsOrderForm";

type props = {
  sections: SectionsObject | null;
  data: PageData;
};

const GreetingCardsPrintingPage = ({ sections, data }: props) => {
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAreas = async () => {
    setLoading(true);
    const areaData = await getAreas("greeting-cards-printing");
    setAreas(areaData);
    setLoading(false);
  };

  useEffect(() => {
    loadAreas();
  }, []);

  if (!sections) return <ErrorUi />;

  return (
    <div className="foam-board-page greeting-cards-printing-page">
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          {sections?.coverPhoto && (
            <ThreeColumns section={sections.coverPhoto} useH1ForTitle />
          )}
          {sections?.richtext && <PromotionBar section={sections?.richtext} />}
          {sections?.types && <TypesSection section={sections?.types} />}
          {sections?.benefits && <BenefitsSection section={sections?.benefits} />}
          {data?.greeting_cards_prices && data.greeting_cards_prices.length > 0 && (
            <SizeChartSection
              section={
                sections?.sizechart || {
                  settings: {
                    title: "Size Chart &amp; Prices",
                    content: "Please Choose Your Paper Type Below",
                  },
                  blocks: [],
                }
              }
            >
              <GreetingCardsChart data={data} />
            </SizeChartSection>
          )}
          <div id="printing-form">
            <GreetingCardsOrderForm data={data} areas={areas} />
          </div>
          <GreetingCardsFeaturedCollection
            title={sections?.framesCollection?.settings?.title}
            products={
              data?.greeting_cards_featured_collection?.products
                ? data.greeting_cards_featured_collection.products
                : []
            }
          />
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

export default GreetingCardsPrintingPage;
