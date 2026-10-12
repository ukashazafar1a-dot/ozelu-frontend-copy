import { Site } from "@/libs/site";
import React from "react";
type props = {
  value?: string;
  title?: string;
  selected?: boolean;
  handleOnClick?: (value:any) => void;
  image?: string;
};
const TypeCard = ({ title, selected, handleOnClick, image, value }: props) => {
  return (
    <div
      className={`type-card d-flex flex-column justify-content-center align-items-center ${
        selected ? "selected" : ""
      }`}
      style={{cursor:'pointer'}}
      onClick={()=>handleOnClick != undefined && handleOnClick(value)}
    >
      <div className="mb-0  d-flex  justify-content-center align-items-center w-full">
        <img
          src={
            image
              ? image
              : Site.placeholder?.image
          }
          alt=""
          loading="lazy"
          className="mx-auto object-cover"
        />
      </div>
      <p className="text-center mb-0 py-2 w-full px-1">
        {title ? title : "Rolled Canvas"}{" "}
      </p>
    </div>
  );
};

export default TypeCard;
