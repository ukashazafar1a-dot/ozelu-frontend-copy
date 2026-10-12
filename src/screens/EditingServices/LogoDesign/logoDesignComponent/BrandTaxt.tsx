"use client"
import React from "react";

const textData = [
  {
    heading1: "HEIGHT-QUALITY SERVICE",
    text1:
      "We create innovative and appealing logo designs with the goal of providing high-quality services. You would be achieving the maximum design results that your brand deserves to appear as a Brand!",
    icon: <img src={"/images/images/logo-designing/yes.png"} alt="yes-icon" loading="lazy"  />
  },
  {
    heading1: "WE ARE CREATIVE GENIUSES",
    text1:
      "Valuable service requires time, thought, and creativity. We are exceptionally good at listening to the needs of our clients and coming back to them with most effective, reliable and creative solutions and put every effort into making sure you will be happy with the final results.",
    icon: <img src={"/images/images/logo-designing/yes.png"} alt="yes-icon" loading="lazy"  />
  },
  {
    heading2: "REASONABLE AND EFFECTIVE",
    text2:
      "We believe that quality does not always have to be expensive and thus have kept affordable rates for our services. Our price is reasonable, we provide services with best price value to our clients.",
    icon: <img src={"/images/images/logo-designing/yes.png"} alt="yes-icon" loading="lazy"  />
  },
  {
    heading2: "MAKING THE PERFECT LOGO DESIGN",
    text2:
      'Our keen communication and understanding of your requirements combined with our "out of box" designs will give you the perfect logo that showcases your brand in a unique way. We love to brainstorm logo ideas and develop the story behind its design.',
    icon: <img src={"/images/images/logo-designing/yes.png"} alt="yes-icon" loading="lazy"  />
  },
];

const BrandTaxt = () => {
  return (
    <div className="w-100 mt-5 brand_item_section py-5">
      <h3 className="heading-logo-text heading-h2 my-0 my-md-5 px-2">WHY HIRE US TO CREATE YOUR BRAND&rsquo;S LOGO DEIGN?</h3>
      <div className="text-data-container">
        {textData.slice(0, 2).map((data, index) => (
          <div key={index} className="column-flex-container">
            <div className="column-flex-contaoner-wrapper">
              <div className="data-icon desktop__view_icon">{data.icon}</div>
              <div className="text-data-container-font">
                <div className="mobile__view-inside d-flex align-items-start justify-content-start">
                  <div className="data-icon" >{data.icon}</div>
                  <h3>{data.heading1}</h3>
                </div>
                <span>{data.text1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-data-container">
        {textData.slice(2).map((data, index) => (
          <div key={index} className="column-flex-container">
            <div className="column-flex-contaoner-wrapper">
              <div className="data-icon desktop__view_icon">{data.icon}</div>
              <div className="text-data-container-font"> 
                <div className="mobile__view-inside d-flex align-items-start justify-content-start">
                  <div className="data-icon" >{data.icon}</div>
                  <h3>{data.heading2}</h3>
                </div>
                <span>{data.text2}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandTaxt;
