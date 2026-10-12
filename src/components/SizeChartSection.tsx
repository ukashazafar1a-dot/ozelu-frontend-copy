"use client";
import { htmlDecode } from "@/helpers/generals";
import { Section } from "@/libs/schemaTypes";
import { PageData } from "@/libs/types";
import React from "react";

type props = {
  section: Section | null;
  children?: React.ReactNode;
  data?: PageData | null;
};

const SizeChartSection = ({ section, children, data }: props) => {
  return (
    <div className="margin-bottom container">
      <div className="formControll">
        {section?.settings?.title && (
          <h2
            className="headingSizeChart heading-h2 text-center mt-5 mb-3 fw-bold"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.title),
            }}
          />
        )}
        {section?.settings?.content && (
          <div
            className="text-center mb-4"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.content),
            }}
          />
        )}
      </div>
      {children}
    </div>
  );
};

export default SizeChartSection;
