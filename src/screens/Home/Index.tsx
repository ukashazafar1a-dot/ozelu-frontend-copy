"use client";
import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import "../../css/home.css";
import "./style.scss";
import SameDayDelivery from "./SameDayDelivery";
import AppServices from "./Services/AppServices";
import PhotoServices from "./Services/PhotoServices";
import EditingServices from "./Services/EditingServices";
import TrendingProducts from "./TrendingProducts";
import dynamic from "next/dynamic";
import SectionLoader from "@/components/Loader/SectionLoader";

type props = {
  content?: any;
};

function Index({ content }: props) {
  const [sections, setSections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const AppReviews: any = dynamic(() => import("./AppReviews/AppReviews"), {
    loading: () => <SectionLoader />,
    ssr: false,
  });
  const FeaturedCollections: any = dynamic(
    () => import("./FeaturedCollections"),
    {
      loading: () => <SectionLoader />,
      ssr: false,
    }
  );
  const AppGuidelineTool: any = dynamic(
    () => import("./AppGuidelineTool/AppGuidelineTool"),
    {
      loading: () => <SectionLoader />,
      ssr: false,
    }
  );
  useEffect(() => {
    setSections(content);
    setLoading(false);
  }, [content]);
  //console.log('sections',sections);
  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          <Banner section={sections ? sections["home-banner"] : null} />
          <SameDayDelivery
            section={sections ? sections["passport-size-photo"] : null}
          />
          {/* <AppGuidelineTool
            section={sections ? sections.photoGuidelineTool : null}
          /> */}
          <AppServices
            section={sections ? sections.photoDocumentPrinting : null}
          />
          <FeaturedCollections />
          <EditingServices
            section={sections ? sections.editingServices : null}
          />
          {/* <PhotoServices
            section={sections ? sections.photographyServices : null}
          /> */}
          <TrendingProducts />
          <AppReviews />
        </>
      )}
    </>
  );
}

export default Index;
