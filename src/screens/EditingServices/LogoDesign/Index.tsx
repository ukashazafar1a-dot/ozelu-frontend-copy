"use client";
import React, { useEffect, useState } from "react";
import CardSection from "./CardSection";
import Banner from "./logoDesignComponent/Banner";
import BrandTaxt from "./logoDesignComponent/BrandTaxt";
import LogoIcons from "./logoDesignComponent/LogoIcons";
import WorkSmaple from "./logoDesignComponent/WorkSmaple";
import "./style.css";
import SectionLoader from "@/components/Loader/SectionLoader";

const LogoDesign = ({ content }: any) => {
  const [sections, setSections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setSections(content);
    setLoading(false);
  }, [content]);
  //console.log('sections',sections)
  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <div className="logo-design--template">
          <Banner
            section={
              sections && sections.heroBanner ? sections.heroBanner : null
            }
          />
          <LogoIcons
            section={sections && sections.logoicons ? sections.logoicons : null}
          />
          <BrandTaxt />
          <WorkSmaple
            section={
              sections && sections.logoPortfolio ? sections.logoPortfolio : null
            }
          />
          <CardSection />
        </div>
      )}
    </>
  );
};

export default LogoDesign;
