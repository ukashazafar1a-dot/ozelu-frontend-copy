import { returnImage } from "@/helpers/generals";
import React from "react";

const RetouchingTools = ({ section }: any) => {
  return (
    <section className="services-tittle py-md-5">
      <div className="py-2">
        <h2 className="text-center fw-bold heading-h2">Tools We Use</h2>
      </div>
      <div className="py-3 px-2 tools">
        <div className="tools-img d-flex align-items-center justify-content-center gap-md-3 ">
          {returnImage(section?.settings?.image1,'retouching--tool',256)}
          {returnImage(section?.settings?.image2,'retouching--tool',256)}
          {returnImage(section?.settings?.image3,'retouching--tool',256)}
          {returnImage(section?.settings?.image4,'retouching--tool',256)}
        </div>
      </div>
    </section>
  );
};

export default RetouchingTools;
