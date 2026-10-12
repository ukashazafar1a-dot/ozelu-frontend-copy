import React from "react";
import "./styleEditingServices.css";
import Link from "next/link";
import { returnImage } from "@/helpers/generals";

const EditingServices = ({ section }: any) => {
  //console.log('section',section)
  return (
    <section className="editing-services--wrapper">
      <div className="services-tittle">
        <div className="container">
          <h2 className="text-center heading-h2 my-5">Editing Services</h2>
        </div>
      </div>
      <div className="editing-services">
        <div className="container">
          <div className="row mb-20">
            <div className="col-md-4 bg-gradient no-pad">
              {returnImage(
                section?.settings?.logodesign,
                "editing-service-img",460
              )}
            </div>
            <div className="col-md-8 px-0 bg-pink">
              <div className="editing-services-right">
                <h2 className="heading-h3 text-center">Logo Designing</h2>
                <div className="rte rte-settings mb-2">
                  <p>
                    If you need a logo for your new start-up or want to bring a
                    new persona to your already existing business, do get in
                    touch with us to design for you a fully customized logo
                    tailored specially to your goals and ideas.
                  </p>
                </div>
                <Link
                  href="editing-service/logo-designing"
                  className="btn-pink text-center text-black link"
                >
                  Click here for more details
                </Link>
              </div>
            </div>
          </div>
          <div className="row mb-20">
            <div className="col-md-4 bg-gradient no-pad">
              {returnImage(
                section?.settings?.cvtemplate,
                "editing-service-img",460
              )}
            </div>
            <div className="col-md-8 px-0 bg-lightgreen">
              <div className="editing-services-right">
                <h2 className="heading-h3 text-center">CV Templates</h2>
                <div className="rte rte-settings mb-2">
                  <p>
                    Choose from our free samples or paid templates (editable) of
                    well-designed expert approved CVs or get in touch with us to
                    design for you a fully customized CV based on the industry
                    you are hunting for and the profession you would like to get
                    into.{" "}
                  </p>
                </div>

                <Link
                  href="/cv-templates"
                  type="submit"
                  className="btn-green text-center text-black link"
                >
                  Click here for more details
                </Link>
              </div>
            </div>
          </div>
          <div className="row mb-20">
            <div className="col-md-4 bg-gradient no-pad">
              {returnImage(
                section?.settings?.photretouching,
                "editing-service-img",460
              )}
            </div>
            <div className="col-md-8 px-0 bg-yellow">
              <div className="editing-services-right">
                <h2 className="heading-h3 text-center">Photo Retouching</h2>
                <div className="rte rte-settings mb-2">
                  <p className="content">
                    Get in touch with us to have your
                    photos retouched by our highly skilled professionals in
                    Photoshop, Adobe Illustrator and other design tools and we
                    will make sure we exceed your expectations. Get a quote
                    within the same day of request, set your expectations and
                    pay online via your debit or credit card through our manual
                    payment link.
                  </p>
                </div>
                <Link
                  href="editing-service/photo-retouching"
                  className="btn-yellow link text-center text-black"
                >
                  Click here for more details
                </Link>
              </div>
            </div>
          </div>
          <div className="row mb-20">
            <div className="col-md-4 bg-gradient no-pad">
              {returnImage(
                section?.settings?.caricatures,
                "editing-service-img",460
              )}
            </div>
            <div className="col-md-8 px-0 bg-purple">
              <div className="editing-services-right">
                <h2 className="heading-h3 text-center">Caricatures</h2>
                <div className="rte mb-2">
                  <p className="content">
                    Check our samples of caricatures and digital illustrations
                    for different occasions like weddings, birthdays or as a
                    memory for couples. Get in touch with us to get a quote and
                    let us inspire you with our creativity.{" "}
                  </p>
                </div>
                <Link
                  href="editing-service/caricatures"
                  type="submit"
                  className="btn-purple text-center text-black link"
                >
                  Click here for more details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditingServices;
