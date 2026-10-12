"use client";
import React from "react";
import "./footer.css";
import Link from "next/link";
import useApp from "@/store/useApp";

function Footer() {
  const { servicesMenu, policiesMenu, setCartOpened }: any = useApp();
  function handleCartOpen(e: any) {
    e.preventDefault();
    //console.log(e)
    e.target.classList.add("cart-opened");
    setCartOpened(true);
  }
  return (
    <footer className="footer-wrapper">
      <div className="footer--main">
        <div className="footer">
          <div className="footerLeftContent">
            <div className="footerLeftIcons">
              <h2 className="fw-bold footer-item-heading">Follow Us</h2>
              <div className="icons-container">
                <a
                  href="https://www.facebook.com/ozelustudio"
                  target="_blank"
                  rel=""
                >
                  <img
                    className="footerIcons"
                    alt="facebook"
                    src={"/images/images/facebook.svg"}
                    loading="lazy"
                  />
                </a>
                <a
                  target="_blank"
                  rel=""
                  href="https://www.instagram.com/ozelustudio/"
                >
                  <img
                    className="footerIcons"
                    alt="insta"
                    src={"/images/images/instagram.svg"}
                    loading="lazy"
                  />
                </a>
              </div>
              <h2 className="fw-bold footer-item-heading">Contact Us</h2>
              <div className="contact-info">
                <h3 className="footer-item-subheading mb-4">JVC Branch</h3>
                <p>Jeewar Building, Jumeirah Village Circle, Dubai</p>
                <p>
                  <a href="tel:+971545679479">0545679479</a>
                </p>
                <p>10:00AM - 10:00PM</p>
                <p>
                  <a href="mailto:care@ozelu.com" target="_blank">
                    care@ozelu.com
                  </a>
                </p>
                {/* <p>
                <a href="mailto:ozelu.studio21@gmail.com" target="_blank">
                  ozelu.studio21@gmail.com
                </a>
              </p> */}
              </div>
            </div>
          </div>
          <div className="footerLeftContent">
            <div className="info-2">
              <h4 className="fw-bold footer-item-heading">
                We deliver to locations like
              </h4>
              <p>Dubai, UAE (All Services)</p>
              <p>Sharjah, UAE (Selected Services)</p>
              <p>Abu Dhabi, UAE (Selected Services)</p>
            </div>
            <div className="info-2 pt-0">
              <h4 className="fw-bold footer-item-heading mt-md-0">
                E-Services Provided World Wide
              </h4>
              <p>United States Of America (USA)</p>
              <p>United Kingdom (UK)</p>
              <p>Canada</p>
              <p>Germany</p>
              <p>France</p>
              <p>Spain</p>
              <p>Rest Of The World</p>
            </div>
          </div>
          <div className="footerLeftContent">
            <div className="info-2">
              {servicesMenu && (
                <>
                  <h4 className="fw-bold footer-item-heading">Services</h4>
                  {servicesMenu?.children?.map((item: any) => {
                    return (
                      <p key={item?.url}>
                        <Link href={item?.url}>{item?.title}</Link>
                      </p>
                    );
                  })}
                </>
              )}
              {policiesMenu && (
                <>
                  <h4 className="fw-bold footer-item-heading">Policies</h4>
                  {policiesMenu?.children.map((item: any) => {
                    return (
                      <p key={item?.url}>
                        <Link href={item?.url}>{item?.title}</Link>
                      </p>
                    );
                  })}
                </>
              )}
            </div>
          </div>
          <div className="footerRightContent">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.2649539925687!2d55.20740371460065!3d25.059007383960633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6ddf48d6881d%3A0xc1c9baa2802d0f39!2sOzelu%20Online%20Photo%20Studio!5e0!3m2!1sen!2s!4v1634460303182!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              title="map"
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
          <div className="whatsAppInformation">
            <a
              target="_blank"
              className="d-block"
              rel="noreferrer"
              href="https://wa.me/971545679479"
            >
              <img
                src={
                  "https://res.cloudinary.com/dvk4zgeh4/image/upload/v1697891561/assets/whatsapp-icon.png"
                }
                alt="whatsapp"
                className="whatsAppIcon"
                loading="lazy"
                width="60"
                height="60"
              />
            </a>
          </div>
          <div className="stickyCart">
            <a
              target="_blank"
              rel="noreferrer"
              href="#"
              onClick={handleCartOpen}
            >
              <img
                src={`/images/ecomerece/cart-icon.png`}
                alt="Sticky Cart"
                className="stickyCartIcon"
                loading="lazy"
              />
            </a>
          </div>
        </div>
        <div className="footer-copyright">
          <div className="footer-rights d-flex justify-content-between py-2">
            <div className="rte rte-settings">
              <p className="m-0">
                © {new Date().getFullYear()} Ozelu. All Rights Reserved
              </p>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <img
                src={`/images/images/passport-size-photos-delivery/payment-method-1.png`}
                alt={"paymentMethod1"}
                loading="lazy"
              />
              <img
                src={`/images/images/passport-size-photos-delivery/payment-method-2.png`}
                alt={"paymentMethod2"}
                loading="lazy"
              />
              <img
                src={`/images/images/passport-size-photos-delivery/payment-method-3.png`}
                alt={"paymentMethod3"}
                loading="lazy"
              />
              <img
                src={`/images/images/passport-size-photos-delivery/payment-method-4.png`}
                alt={"paymentMethod4"}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
