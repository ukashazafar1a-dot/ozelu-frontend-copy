import { returnImage } from "@/helpers/generals";
import React from "react";

const WorkSmaple = ({ section }: any) => {
  return (
    <div className="work-sample-container container">
      <h3 className="heading-logo-text mt-5 mb-3 fw-bold heading-h2">
        CREATIVE LOGO DESIGN PORTFOLIO
      </h3>
      <p className="text-center d-none">Take a look at our creative logo designs</p>
      <div className="logo-work-container">
        <div className="logo--item">
          {returnImage(section?.settings?.image1, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image2, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image3, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image4, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image5, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image6, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image7, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image8, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image9, "logo-worksection-img",256)}
        </div>
        <div className="logo--item">
          {returnImage(section?.settings?.image10, "logo-worksection-img",256)}
        </div>
      </div>
    </div>
  );
};

export default WorkSmaple;
