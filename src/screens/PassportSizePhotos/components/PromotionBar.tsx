import { htmlDecode, htmlEncode } from "@/helpers/generals";
import React from "react";

const PromotionBar = ({ section }: any) => {
  return (
    <section className="servics-tittle bg-darkgreen rich-text-section">
      <div className="container py-4 px-3">
        <div className="text-center">
          {section?.settings?.title && (
            <h2
              className="mb-3 h3"
              dangerouslySetInnerHTML={{
                __html: htmlDecode(section?.settings?.title),
              }}
            />
          )}

          {section?.settings?.content && (
            <div
              className="content text-center"
              dangerouslySetInnerHTML={{
                __html: htmlDecode(section?.settings?.content),
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default PromotionBar;
