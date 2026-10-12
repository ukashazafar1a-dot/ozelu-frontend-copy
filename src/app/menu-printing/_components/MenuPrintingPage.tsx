"use client";
import ErrorUi from "@/components/ErrorUi";
import FaqsSection from "@/components/FaqsSection";
import ThreeColumns from "@/screens/PhotosPrintingDelivery/ThreeColumns";
import PromotionBar from "@/components/PromotionBar";
import SizeChartSection from "@/components/SizeChartSection";
import TypesSection from "@/components/TypesSection";
import BenefitsSection from "@/components/BenefitsSection";
import React, { useEffect, useState } from "react";
import MenuOrderForm from "./MenuOrderForm";
import MenuChart from "./MenuChart";
import DeliverySchedule from "@/components/DeliverySchedule";
import AlertMessage from "@/components/AlertMessage";
import { DeliveryArea, PageData } from "@/libs/types";
import { getAreas } from "@/helpers/apiRequests";
import SectionLoader from "@/components/Loader/SectionLoader";

type Props = {
  sections: any;
  data: PageData;
};

const MenuPrintingPage = ({ sections, data }: Props) => {
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAreas = async () => {
    setLoading(true);
    const data = await getAreas("menu-printing");
    setAreas(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAreas();
  }, []);

  if (!sections) return <ErrorUi />;

  return (
    <div className="foam-board-page menu-printing-page">
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
          {data?.menu_prices && data.menu_prices.length > 0 && (
            <SizeChartSection
              section={
                sections?.sizechart || {
                  settings: {
                    title: "Size Chart &amp; Prices",
                    content: "Choose your print type below",
                  },
                }
              }
            >
              <MenuChart data={data} />
            </SizeChartSection>
          )}
          <div id="printing-form">
            <MenuOrderForm data={data} areas={areas} />
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

export default MenuPrintingPage;
