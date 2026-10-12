"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import { Image } from "@/components/ui/Image";
import { htmlDecode } from "@/helpers/generals";
import { Section } from "@/libs/schemaTypes";
import { DocumentSpecs, PageData } from "@/libs/types";
import React, { useEffect, useState } from "react";
type props = {
  data: PageData;
  section: Section | null;
};
const LaminationChart = ({ data, section }: props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sorted, setSorted] = useState<DocumentSpecs[] | null>(null);
  const [blocks, setBlocks] = useState<any>(null);

  useEffect(() => {
    if (data) {
      setSorted(data?.document_laminations ? data?.document_laminations : []);
      setLoading(false);
    }
  }, [data]);
  useEffect(() => {
    if (section) {
      setBlocks(section?.blocks);
    }
  }, [section]);
  //console.log(options, sorted);
  return (
    <div className="margin-bottom container">
      <div className="formControll">
        {section?.settings?.title && (
          <h2 className="headingSizeChart heading-h2 text-center mt-5 mb-3 fw-bold">
            {section?.settings?.title}
          </h2>
        )}
        {section?.settings?.content && (
          <div
            className="text-center mb-5"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.content),
            }}
          />
        )}
      </div>
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          <div className="photoPrintingSizesChart dp-table-inside text-center mb-5">
            <table className="photoSize table">
              <thead>
                <tr>
                  <th>Type of Lamination</th>
                  <th>Price (A4)</th>
                  <th>Price (A3)</th>
                </tr>
              </thead>
              <tbody>
                {sorted &&
                  sorted.map((print: any) => (
                    <tr key={print?._id}>
                      <td>{print?.type}</td>
                      <td>{print?.a4_price}</td>
                      <td>{print?.a3_price}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {blocks && blocks?.length > 0 ? (
            <div className="d-flex justify-content-start gap-2 spec-list smart_scroll pb-2">
              {blocks?.map((block: any, index: number) => {
                return (
                  <div className="spec-card" key={index}>
                    <div className="image-wrapper mb-2">
                      <Image image={block.settings?.image} />
                    </div>
                    <div className="p-2">
                      <h3 className="fw-bold">{block?.settings?.title}</h3>
                      <div
                        className="rte content"
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(block?.settings?.content),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};

export default LaminationChart;
