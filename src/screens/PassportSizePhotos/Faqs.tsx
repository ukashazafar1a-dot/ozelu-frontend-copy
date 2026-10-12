"use client";
import React, { useEffect, useState } from "react";
import { htmlDecode } from "@/helpers/generals";
import SectionLoader from "@/components/Loader/SectionLoader";
import { toggleAccordian } from "@/libs/utils";

function Faqs({ section }: any) {
  const [blocks, setBlocks] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  //console.log(section);
  useEffect(() => {
    setBlocks(section?.blocks);
    setLoading(false);
  }, [section]);
  //console.log("blocks", blocks);
  return (
    <div className="bg-faq">
      <div className="faqSection container py-5">
        <h2 className="faqHeading playfair-heading-800 text-center m-0">
          FAQ&lsquo;s
        </h2>
        <div className="pb-5">
          {loading ? (
            <SectionLoader />
          ) : (
            <div className="faq--item">
              {blocks && blocks?.length > 0 ? (
                blocks?.map((block: any, i: any) => {
                  return (
                    <>
                    {block?.settings?.question &&
                    block?.settings?.answer ? (
                      <div key={i} className={block?.settings?.isActive ? 'active-panel': ''}>
                        <button
                          className={`accordion ${block?.settings?.isActive ? 'active-btn': ''}`}
                          onClick={(e) => toggleAccordian(e)}
                        >
                          {block?.settings?.question}
                        </button>
                        <div
                          className={`panel rte ${block?.settings?.isActive ? 'active-panel': ''}`}
                          data-hide={`${!block?.settings?.isActive}`}
                          style={{maxHeight: block?.settings?.isActive ? '100%': ''}}>
                          <div
                            className="rte"
                            dangerouslySetInnerHTML={{
                              __html: htmlDecode(block?.settings?.answer),
                            }}
                          />
                        </div>
                        <hr className="faqLine" />
                      </div>
                    ) : (
                      <></>
                    )}
                  </>
                  );
                })
              ) : (
                <></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Faqs;
