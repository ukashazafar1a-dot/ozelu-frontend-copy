import { htmlDecode } from "@/helpers/generals";
import { Section } from "@/libs/schemaTypes";
import React from "react";
type props = {
  section: Section | null;
  tableClass?: string;
};
const DeliverySchedule = ({ section, tableClass }: props) => {
  if (!section) return <></>;
  return (
    <section className="delivery-schedule--section">
      <div className="container">
        <div className="d-block">
          {section?.settings?.title && (
            <div
              className="heading-h2 text-center mx-0 mb-3 fw-bold"
              dangerouslySetInnerHTML={{
                __html: htmlDecode(section?.settings?.title),
              }}
            />
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
        {section?.settings?.table && (
          <div
            className={`d-flex justify-content-center overflow-x-auto w-100 dp-table-inside text-center customizeable-table ${
              tableClass ? tableClass : ""
            }`}
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.table),
            }}
          />
        )}
      </div>
    </section>
  );
};

export default DeliverySchedule;
