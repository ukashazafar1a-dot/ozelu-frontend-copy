import React from "react";
import "./stylePhotoServices.css";
import Link from "next/link";
import { returnImage } from "@/helpers/generals";

const PhotoServices = ({section}:any) => {
  //console.log('section',section)
  return (
    <>
      <div className="services-tittle">
        <div className="container">
          <h2 className="text-center my-5 mx-0 heading-h2">Photography Services</h2>
        </div>
      </div>
      <section className="photography-services--wrapper">
        <div className="photography-services">
          <div className="container">
            <div className="row">
              <div className="col-md-4">
                <div className="services bg-blue services-img ">
                  <Link
                    href="/photography-service/portrait-headshots"
                    className="text-decoration-none"
                  >
                    {returnImage(section?.settings?.headshots,'photography-service',460)}
                    <h3 className="heading-h3 text-left">
                      Portrait Headshots
                    </h3>
                    <p className="content">
                      Corporate Headshots, Couple Photos,
                      <br /> Website Banners,
                      <br /> Graduation Shots and
                      <br /> other Portrait Headshots
                    </p>
                  </Link>
                </div>
              </div>
              <div className="col-md-4">
                <div className="services bg-green services-img">
                  <Link
                    href="/photography-service/event-photography"
                    className="text-decoration-none"
                  >
                    {returnImage(section?.settings?.event,'photography-service',460)}
                    <h3 className="heading-h3 text-left">Event Photography</h3>
                    <p className="content">
                      Corporate Events, Private Events,
                      <br /> Birthday Parties,
                      <br /> Gender Reveal and
                      <br />
                      other type of Events
                    </p>{" "}
                  </Link>
                </div>
              </div>
              <div className="col-md-4">
                <div className="services bg-purple services-img">
                  <Link
                    href="/photography-service/wedding-photography"
                    className="text-decoration-none"
                  >
                    {returnImage(section?.settings?.wedding,'photography-service',460)}
                    <h3 className="heading-h3 text-left">
                      Wedding Photography
                    </h3>
                    <p className="content">
                      We do consultation before the event,
                      <br /> edit photos, option to print
                      <br /> and create a photo album
                    </p>{" "}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PhotoServices;
