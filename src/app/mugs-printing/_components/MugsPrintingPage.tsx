"use client";
import AlertMessage from "@/components/AlertMessage";
import BenefitsSection from "@/components/BenefitsSection";
import DeliverySchedule from "@/components/DeliverySchedule";
import FeaturedCollection from "@/components/EComereceStore/FeaturedCollection";
import MugsFeaturedCollection from "./MugsFeaturedCollection";
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
import MugsChart from "./MugsChart";
import MugsOrderForm from "./MugsOrderForm";

type props = {
  sections: SectionsObject | null;
  data: PageData;
};

const MugsPrintingPage = ({ sections, data }: props) => {
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAreas = async () => {
    setLoading(true);
    const areaData = await getAreas("mugs-printing");
    setAreas(areaData);
    setLoading(false);
  };

  useEffect(() => {
    loadAreas();
  }, []);

  if (!sections) return <ErrorUi />;

  return (
    <div className="foam-board-page mugs-printing-page">
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
          {data?.mugs_prices && data.mugs_prices.length > 0 && sections?.sizechart && (
            <SizeChartSection section={sections.sizechart}>
              <MugsChart data={data} />
            </SizeChartSection>
          )}
          <div id="printing-form">
            <MugsOrderForm data={data} areas={areas} />
          </div>
          {data?.mugs_featured_collection?.products?.length ? (
            <MugsFeaturedCollection
              title={
                sections?.framesCollection?.settings?.title ||
                sections?.collection?.settings?.title
              }
              products={data.mugs_featured_collection.products}
            />
          ) : (
            sections?.collection && (
              <FeaturedCollection section={sections.collection} />
            )
          )}
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

export default MugsPrintingPage;
