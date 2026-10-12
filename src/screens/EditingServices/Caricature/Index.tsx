"use client";

import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import "./caricature.css";
import "./styles.css";
import CariTypes from "./CariTypes";
import WeddingCari from "./WeddingCari";
import BirthdayCari from "./BirthdayCari";
import SectionLoader from "@/components/Loader/SectionLoader";
import CoupleCari from "./CoupleCari";

const Caricature = ({ content }: any) => {
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
        <div className="caricatures--template wrapper-caricature">
          <Banner
            section={
              sections && sections?.homeBanner ? sections?.homeBanner : null
            }
          />
          <CariTypes />
          <WeddingCari
            section={sections && sections?.wedding ? sections?.wedding : null}
          />
          <CoupleCari
            section={sections && sections?.couple ? sections?.couple : null}
          />
          <BirthdayCari
            section={sections && sections?.birthday ? sections?.birthday : null}
          />
        </div>
      )}
    </>
  );
};

export default Caricature;
