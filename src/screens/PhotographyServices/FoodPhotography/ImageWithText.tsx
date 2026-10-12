import { returnImage } from "@/helpers/generals";
import React from "react";

const ImageWithText = ({ section }: any) => {
  return (
    <section className="php-photography food-photography">
      <div className="container-photography">
        <div className="row pt-30 align-items-start">
          <div className="col-md-7 text-left">
            <h1 className=" text-md-left text-center fw-bold heading-h2 m-0 mb-3 ">
              Food Photography Services
            </h1>
            <div className="rte rte-settings">
              <p>
                If you require a photographer or videographer for menu
                photography, food styling, food videos or social media photos,
                contact us via call or WhatsApp for quotations and bookings.
               </p>
               <p>
                We have a team of highly experienced photographers and
                videographers who have worked with reputed fast food chains and
                fine dining restaurants on building their menus, both in terms
                of designing their menus and capturing their food to evoke
                desire, delight and hunger.
              </p>
            </div>
          </div>
          <div className="col-md-5">
            {returnImage(section?.settings?.image, "w-100",600)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageWithText;
