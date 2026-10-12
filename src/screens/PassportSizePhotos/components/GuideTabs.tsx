"use client";
import React, { useMemo, useState } from "react";
import GuideImages from "./GuideImages";
import { htmlDecode } from "@/helpers/generals";

function normalizeGuideBlocks(blocks: any) {
  if (!blocks) return [];
  if (Array.isArray(blocks)) return blocks;
  if (typeof blocks === "object") return Object.values(blocks);
  return [];
}

function buildGuideImages(blocks: any, type: string) {
  return normalizeGuideBlocks(blocks)
    .filter((block: any) => block?.type === type)
    .map((block: any) => ({
      beforeImg: block?.settings?.beforeImage,
      afterImg: block?.settings?.afterImage,
    }));
}

const GuideTabs = ({ section }: any) => {
  const tabs = ["Adult", "Kid", "Baby"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const { adultImages, kidImages, babyImages } = useMemo(
    () => ({
      adultImages: buildGuideImages(section?.blocks, "mensPhoto"),
      kidImages: buildGuideImages(section?.blocks, "kidsPhoto"),
      babyImages: buildGuideImages(section?.blocks, "babyPhoto"),
    }),
    [section?.blocks]
  );

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };

  return (
    <div className="gt-wrapper d-flex align-items-center text-center justify-content-center flex-column">
      <div className="btn-group mb-3" role="group" aria-label="Guidelines tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`btn btn-light px-4 fw-medium ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tabs-wrapper w-100 pb-3">
        <div
          className={`tab-content adult-tab ${
            activeTab === "Adult" ? "active-tb" : ""
          }`}
        >
          <AdultContent section={section} images={adultImages} />
        </div>
        <div
          className={`tab-content kid-tab ${
            activeTab === "Kid" ? "active-tb" : ""
          }`}
        >
          <KidContent section={section} images={kidImages} />
        </div>
        <div
          className={`tab-content baby-tab ${
            activeTab === "Baby" ? "active-tb" : ""
          }`}
        >
          <BabyContent section={section} images={babyImages} />
        </div>
      </div>
    </div>
  );
};

export default GuideTabs;

const AdultContent = ({ images, section }: any) => {
  return (
    <>
      {section && (
        <div className="content-fine-heere">
          <div className="info-side col-md-6 pt-3">
            <div className="rte rte-settings text-left">
              <h1 className="section-heading h2">{section?.settings?.adultTitle}</h1>
              <div
                className="rte rte-settings"
                dangerouslySetInnerHTML={{
                  __html: htmlDecode(section?.settings?.adultInfo),
                }}
              />
            </div>
          </div>
          <div className="media-side col-md-6 p-0">
            <GuideImages images={images} />
          </div>
        </div>
      )}
    </>
  );
};

const BabyContent = ({ images, section }: any) => {
  return (
    <>
      {section && (
        <div className="content-fine-heere">
          <div className="info-side col-md-6 pt-3">
            <div className="rte rte-settings text-left">
              <h1 className="section-heading h2">{section?.settings?.babyTitle}</h1>
              <div
                className="rte rte-settings"
                dangerouslySetInnerHTML={{
                  __html: htmlDecode(section?.settings?.babyInfo),
                }}
              />
            </div>
          </div>
          <div className="media-side col-md-6">
            <GuideImages images={images} />
          </div>
        </div>
      )}
    </>
  );
};

const KidContent = ({ images, section }: any) => {
  return (
    <>
      {section && (
        <div className="content-fine-heere">
          <div className="info-side col-md-6 pt-3">
            <div className="rte rte-settings text-left">
              <h1 className="section-heading h2">{section?.settings?.kidsTitle}</h1>
              <div
                className="rte rte-settings"
                dangerouslySetInnerHTML={{
                  __html: htmlDecode(section?.settings?.kidsInfo),
                }}
              />
            </div>
          </div>
          <div className="media-side col-md-6">
            <GuideImages images={images} />
          </div>
        </div>
      )}
    </>
  );
};
