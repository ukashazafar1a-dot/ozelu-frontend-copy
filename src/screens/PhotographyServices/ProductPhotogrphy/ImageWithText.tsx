import { returnImage } from "@/helpers/generals";
import React from "react";

const ImageWithText = ({ section }: any) => {
  return (
    <section className="php-photography product-photography">
      <div className="container-photography">
        <div className="row pt-30 align-items-start">
          <div className="col-md-7 text-left">
            <h1 className="text-md-left text-center fw-bold heading-h2 m-0 mb-3 ">
              Demo Product Photography
            </h1>
            <div className="rte rte-settings">
              <p>
                At Demo Print Shop we believe that a fantastic product demands
                equally amazing images. Our desire to showcase your items in the
                most intriguing and appealing way possible is driven by our love
                for detail and innovation. In order for your product to stand
                out in the cutthroat market of today, our qualified staff makes
                certain that every component of it is emphasized to perfection.
              </p>
              <p>
                Our services include E-commerce produce photography, catalogue
                photography, social media posts, editorial and lifestyle
                photography. Along with our creative expertise we give great
                attention to detail in our shoots and provide customizable
                solutions for all our clients according to your requirements.
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
