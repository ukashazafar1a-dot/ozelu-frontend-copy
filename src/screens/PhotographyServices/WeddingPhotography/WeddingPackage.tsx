"use client";
import { htmlDecode } from "@/helpers/generals";
import React, { useEffect, useState } from "react";

const WeddingPackage = ({ section }: any) => {
  const [blocks, setBlocks] = useState<any>(null);
  //console.log(section);
  useEffect(() => {
    if (section) {
      setBlocks(section?.blocks);
    }
  }, [section]);
  //console.log('blocks',blocks)
  return (
    <>
      <section className="services-tittle-photography">
        <div className="container-photography">
          {section?.settings?.title && (
            <h2
              className="text-center my-5 fw-bold heading-h2 mx-0"
              dangerouslySetInnerHTML={{
                __html: htmlDecode(section?.settings?.title),
              }}
            />
          )}
        </div>
      </section>
      <section className="php-photography mb-5">
        <div className="container-photography">
          <div className="row">
            {blocks && blocks.length > 0 ? (
              blocks.map((block: any, index: number) => {
                const packExists =
                  block?.settings?.title && block?.settings?.text;
                return packExists ? (
                  <div className="col-md-4 p-3 text-center" key={block?._id}>
                    <h2 className="pl-custom">
                      {htmlDecode(block.settings.title)}
                    </h2>
                    <div
                      className="rte"
                      dangerouslySetInnerHTML={{
                        __html: htmlDecode(block.settings.text),
                      }}
                    />
                  </div>
                ) : null;
              })
            ) : (
              <></>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default WeddingPackage;
