"use client";
import AlertMessage from "@/components/AlertMessage";
import DeliverySchedule from "@/components/DeliverySchedule";
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
import TShirtsChart from "./TShirtsChart";
import TShirtsOrderForm from "./TShirtsOrderForm";
import MeasurementChartSection from "./MeasurementChartSection";

type props = { sections: SectionsObject | null; data: PageData };

export default function TShirtsPrintingPage({ sections, data }: props) {
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setAreas(await getAreas("t-shirts-printing"));
      setLoading(false);
    })();
  }, []);

  if (!sections) return <ErrorUi />;

  return (
    <div className="foam-board-page t-shirts-printing-page">
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          {sections?.coverPhoto && (
            <ThreeColumns section={sections.coverPhoto} useH1ForTitle />
          )}
          {sections?.richtext && <PromotionBar section={sections.richtext} />}
          {sections?.types && <TypesSection section={sections.types} />}
          {sections?.types1 && <TypesSection section={sections.types1} />}
          {sections?.types2 && <TypesSection section={sections.types2} />}
          {(data?.t_shirts_prices?.length ?? 0) > 0 && sections?.sizechart && (
            <SizeChartSection section={sections.sizechart}>
              <TShirtsChart data={data} />
            </SizeChartSection>
          )}
          <div id="printing-form">
            <TShirtsOrderForm data={data} areas={areas} />
          </div>
          {sections?.measurementchart && (
            <MeasurementChartSection section={sections.measurementchart} />
          )}
          {sections?.delivery && (
            <DeliverySchedule section={sections.delivery} tableClass=" mb-4 " />
          )}
          {sections?.faqs && <FaqsSection section={sections.faqs} />}
          {!data?.isActive && <AlertMessage message={data.alert_message} />}
        </>
      )}
    </div>
  );
}
