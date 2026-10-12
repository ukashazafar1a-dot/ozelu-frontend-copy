import { htmlDecode, returnImage } from "@/helpers/generals";
import Link from "next/link";
import React from "react";

const ServiceCard = ({ card }: any) => {
  return (
    <div
      className="services-box"
      style={{
        background: `${card?.bgclr ? card.bgclr : '#c8f5e0'}`,
        color: `${card?.textclr}`,
      }}
    >
      {returnImage(card?.image, "service--image", 460)}
      <div className="services-box-tittle">
        <Link className="text-decoration-none" href={card?.url ? card.url : "#"}>
          <h2
            className="txt-center heading-h3"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(card?.title),
            }}
          />
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
