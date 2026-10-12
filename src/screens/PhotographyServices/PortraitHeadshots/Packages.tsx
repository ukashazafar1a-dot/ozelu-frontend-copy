import React from "react";
import HeadDubai from "./HeadDubai";
import { htmlDecode, returnImage } from "@/helpers/generals";

const Packages = ({ section, dubai }: any) => {
  //console.log(section);
  return (
    <section>
      <div className="services-tittle-photography">
        <div className="container-photography">
          <h2 className="heading-h2 fw-bold mx-0 mb-4 text-md-left text-center">
            Portrait Headshot Packages
          </h2>
          <p className="d-none">
            Please book via whatsApp, by calling us or filling the form below.
          </p>
        </div>
      </div>
      <div className="php-photography">
        <div className="container-photography">
          <div className="row">
            <div className="col-md-6 text-center">
              {returnImage(section?.settings.image,'package-image',600)}
              {section?.settings?.title && (
                <h2
                  className="m-0 mb-2"
                  dangerouslySetInnerHTML={{
                    __html: htmlDecode(section?.settings?.title),
                  }}
                />
              )}
              {section?.settings?.text && (
                <div
                  className="rte"
                  dangerouslySetInnerHTML={{
                    __html: htmlDecode(section?.settings?.text),
                  }}
                />
              )}
            </div>
            <div className="col-md-6 text-center">
              {returnImage(section?.settings?.image2,'package-image',600)}
              {section?.settings?.title2 && (
                <h2
                  className="m-0 mb-2"
                  dangerouslySetInnerHTML={{
                    __html: htmlDecode(section?.settings?.title2),
                  }}
                />
              )}
              {section?.settings?.text2 && (
                <div
                  className="rte"
                  dangerouslySetInnerHTML={{
                    __html: htmlDecode(section?.settings?.text2),
                  }}
                />
              )}
            </div>
          </div>
          <HeadDubai section={dubai} />
        </div>
      </div>
    </section>
  );
};

export default Packages;
