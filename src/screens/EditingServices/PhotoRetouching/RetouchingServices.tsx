"use client";
import { htmlDecode, returnImage } from "@/helpers/generals";
import React, { useEffect, useState } from "react";

const RetouchingServices = ({ section }: any) => {
  const [blocks, setBlocks] = useState<any>(null);
  useEffect(() => {
    if (section) {
      const rawBlocks = section?.blocks;
      if (Array.isArray(rawBlocks)) {
        setBlocks(rawBlocks);
      } else if (rawBlocks && typeof rawBlocks === "object") {
        setBlocks(Object.values(rawBlocks));
      } else {
        setBlocks([]);
      }
    }
  }, [section]);

  return (
    <section>
      <div className="services-tittle">
        <div className="container-retouching pt-2 pb-3">
          <h2 className="text-center fw-bold heading-h2 mx-0">
            Photo Retouching Services We Provide
          </h2>
        </div>
      </div>
      <div className="retouching-services mb-5">
        <div className="container-retouching">
          <div className="d-flex justify-content-center flex-wrap inner-side-view">
            {Array.isArray(blocks) &&
              blocks.map((block: any, index: number) => {
                const blockSettings = block?.settings || {};
                const title = blockSettings?.title || "";
                const description = blockSettings?.content || "";
                const image = blockSettings?.image;

              return (
                <div className="inn-item" key={`${title}-${index}`}>
                  <div
                    className="retouching-sec-left d-flex flex-column justify-content-between align-items-center"
                    data-index={index}
                  >
                    <div className="first-block">
                      <h3 className="text-center h2 fw-bold mb-3">
                        {title}
                      </h3>
                      {image ? (
                        <div className="d-flex justify-content-center mb-3 img-in-me">
                          {returnImage(image, "services--images", 460)}
                        </div>
                      ) : (
                        <></>
                      )}
                      <div
                        className="rte rte-settings text-center pb-3 content"
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(description),
                        }}
                      />
                    </div>
                    <div className="text-center my-3">
                      <a
                        href="https://wa.me/971545679479"
                        className="retouching-btn positioning2 d-inline"
                        rel="referrer opener"
                        target="_blank"
                      >
                        WhatsApp For Quote
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RetouchingServices;
