"use client";
import AppReservationForm from "../ReservationForm/AppReservationForm";
import { scroll } from "../../../utils";
import { returnImage } from "@/helpers/generals";

const Banner = ({section}:any) => {
  const scrollToForm = () => {
    const formRef = document.getElementById("reservation-form");
    scroll(formRef);
  };
  return (
    <section className="banner-photography">
      <div className="row align-items-center">
        <div className="col-md-6 py-3 pr-3 pl-12">
          <h1 className="re-cover-headshot fw-bold">
            {`Shoot Doesn’t End Until You Are Satisfied`}
          </h1>
          <div className="rte rte-settings">
            <p>{`
              Book a portrait headshot at your own home with full privacy and no
              rushing. Guarantee satisfaction; shoot doesn’t end until you are
              are satisfied.
            `}</p>
          </div>
          <div className="what-center">
            <a href="https://wa.me/10000000000">
              <button>WhatsApp to Book</button>
            </a>
            <button onClick={() => scrollToForm()}>Go to Contact Form</button>
          </div>
        </div>
        <div className="col-md-6">
          {returnImage(section?.settings?.image,'image-main',800)}
        </div>
      </div>
    </section>
  );
};

export default Banner;
