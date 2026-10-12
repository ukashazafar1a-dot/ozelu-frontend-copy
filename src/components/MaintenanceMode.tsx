import React from "react";
import MainSvg from "./MainSvg";
import { Site } from "@/libs/site";

const MaintenanceMode = () => {
  return (
    <div className="vh-100 d-flex align-items-center justify-content-center text-center">
      <div className="px-4 py-5 my-5 text-center">
        <MainSvg />
        <h1 className="display-5 text-body-emphasis">Under Maintenance</h1>
        <div className="col-lg-6 mx-auto">
          <p className="mb-4 font-poppins">
            We apologize for the inconvenience but Demo is currently
            undergoing scheduled maintenance to improve our services for you.
            We are performing some essential updates and enhancements. Our team
            is working hard to bring you a better experience.
          </p>
          <p className="mb-4 font-poppins">
            If you need immediate assistance or have any questions, please{" "}
            <strong>WhatsApp us on</strong>{" "}
            <a
              href={`https://wa.me/${Site.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0d6efd" }}
            >
              {Site.phone}
            </a>{" "}
            or <strong>email us</strong> at{" "}
            <a
              href={`mailto:${Site.email.care}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0d6efd" }}
            >
              {Site.email.care}
            </a>
            .
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a
              href={`https://wa.me/${Site.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact us on WhatsApp"
              className="d-inline-flex align-items-center justify-content-center text-decoration-none"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(180deg, #55d66b 0%, #23b542 100%)",
                boxShadow: "0 6px 14px rgba(34, 181, 66, 0.24)",
              }}
            >
              <i className="fa-brands fa-whatsapp text-white fs-2" />
            </a>
            <a
              href={`mailto:${Site.email.care}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email us"
              className="d-inline-flex align-items-center justify-content-center text-decoration-none"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(180deg, #8dc4ff 0%, #4e86df 100%)",
                boxShadow: "0 6px 14px rgba(78, 134, 223, 0.24)",
              }}
            >
              <i className="fa-regular fa-envelope text-white fs-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
