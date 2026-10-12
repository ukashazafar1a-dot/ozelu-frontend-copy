"use client";
import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import "./photoRetouching.css";
import "./style.css";
import "./photoRetiuchingForm.css";
import RetouchingTools from "./RetouchingTools";
import RetouchingServices from "./RetouchingServices";
import SectionLoader from "@/components/Loader/SectionLoader";
import RetouchingForm from "./RetouchingForm";

const PhotoRetouching = ({ content, data }: any) => {
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
        <div className="photo-retouching-wrapper">
          {/* Testing - Start */}
          {/* <RetouchingForm/> */}
          {/* Testing - End */}
          <Banner
            section={
              sections && sections.heroBanner ? sections.heroBanner : null
            }
          />
          <RetouchingTools
            section={
              sections && sections.toolsIcons ? sections.toolsIcons : null
            }
          />
          <RetouchingServices
            section={sections && sections.services ? sections.services : null}
          />
        </div>
      )}
    </>
  );
};

export default PhotoRetouching;
