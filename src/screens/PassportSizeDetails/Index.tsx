"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import React, { useEffect, useState } from "react";
import "./style.css";
import PageContent from "./PageContent";

const PassSizeDetails = ({ content, data }: any) => {
  const [pageContent, setPageContent] = useState<any>(null);
  const [sections, setSections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setPageContent(content);
    setSections(data?.settings?.sections);
    setLoading(false);
  }, [content]);
  //console.log("sections", sections);
  return (
    <div className="passport-size-wrapper mb-5">
      {loading ? (
        <SectionLoader />
      ) : (
        <PageContent
          content={pageContent}
          section={
            sections && sections.singlePageBar ? sections?.singlePageBar : null
          }
        />
      )}
    </div>
  );
};

export default PassSizeDetails;
