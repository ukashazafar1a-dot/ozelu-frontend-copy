"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import React, { useEffect, useState } from "react";
import PageContent from "./PageContent";

const PassportPhotoReqPage = ({ content }: any) => {
  const [sections, setSections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setSections(content?.settings?.sections);
    setLoading(false);
  }, [content]);
  //console.log("sections", sections);
  return (
    <div className="page--wrapper">
      {loading ? (
        <SectionLoader />
      ) : (
        <PageContent
          section={
            sections && sections.pageBanner ? sections?.pageBanner : null
          }
        />
      )}
    </div>
  );
};

export default PassportPhotoReqPage;
