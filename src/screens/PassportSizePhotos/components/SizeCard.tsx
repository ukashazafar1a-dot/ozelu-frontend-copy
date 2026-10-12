"use client";
import React from "react";
import OptionTable from "./OptionTable";
import Link from "next/link";
import { returnImage } from "@/helpers/generals";
import slugify from "slugify";

const SizeCard = ({ block, onLayoutChange }: any) => {
  const returnSlug = (str: any) => {
    if (str) {
      const slug = slugify(str, {
        replacement: "-",
        lower: true,
      });
      return slug;
    } else {
      return "";
    }
  };

  return (
    <div className="size-card-wrapper w-100">
      <div className="sc-main">
        <div className="section--heading">
          <h2 className="h2  mb-3 text-center">{block?.title}</h2>
        </div>
        <div className="images-wrapper w-100 mb-3 d-flex justify-content-center align-items-center gap-2">
          <div className="image-wrapper">
            {returnImage(block?.before_image, "card-image", 250)}
          </div>
          <div className="image-wrapper">
            {returnImage(block?.after_image, "card-image", 250)}
          </div>
        </div>
        <OptionTable content={block?.requirements} onLayoutChange={onLayoutChange} />
        <div className="card-actions text-center d-flex align-items-center justify-content-center gap-2 flex-wrap">
          <Link
            href={"/passport-photo-requirements/" + returnSlug(block?.slug)}
            className="btn--default-primary btn--rounded-new"
          >
            <span>For More Details</span>
          </Link>
          <Link
            href={"/passport-photo-requirements"}
            className="btn--default-primary btn--rounded-new"
          >
            <span>More Sizes</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SizeCard;
