import { returnImage } from "@/helpers/generals";
import React from "react";

const EventDubai = ({section}:any) => {
  return (
    <section className="php-photography">
      <div className="container-photography">
        <div className="row pt-30 align-items-start">
          <div className="col-md-7 text-left">
            <h2 className=" text-md-left text-center fw-bold heading-h2 m-0 mb-3 ">Event Photography in Dubai</h2>
            <div className="rte rte-settings">
              <p>
                If you have a corporate event or need photographers for a live
                coverage event, contact us via call or WhatsApp for quotations
                and bookings.
                <br />
                <br />
                We have a team of experienced photographers who have covered
                well known events such as UAE National Day celebrations, major
                corporate events like conferences and performance reviews,
                Formula 1 and other medium to large scale events.
              </p>
            </div>
          </div>
          <div className="col-md-5">
            {returnImage(section?.settings?.image,'class-image',600)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDubai;
