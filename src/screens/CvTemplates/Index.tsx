"use client";
import React, { useEffect, useState } from "react";
import Banner from "./CVdesigningComponent/Banner";
import "./CVdesigningComponent/style.css";
import "./styles.css";
import dynamic from "next/dynamic";
import SectionLoader from "@/components/Loader/SectionLoader";
import NotActivePopup from "../DocumentPrinting/NotActivePopup";

const CVcustomDesigning = ({ content }: any) => {
  const [sections, setSections] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const CVtempletes = dynamic(
    () => import("./CVdesigningComponent/CVtempletes"),
    {
      loading: () => <SectionLoader />,
      ssr: false,
    }
  );
  useEffect(() => {
    setSections(content?.settings?.sections);
    setData(content?.data)
    setLoading(false)
  }, [content]);
  //console.log('content',content,"sections", sections,'data',data);
  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <div className="cv-templates--page">
          <Banner
            section={
              sections && sections.homeBanner ? sections.homeBanner : null
            }
          />
          <CVtempletes />
          {!data?.isActive ? (
            <NotActivePopup message={data?.alert_message} />
          ) : (
            <></>
          )}
        </div>
      )}
    </>
  );
};

export default CVcustomDesigning;
