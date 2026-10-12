"use client";

import React, { useState } from "react";
import { countryList } from "../../../utils";
import "./style.css";
import Loading from "../../../components/Loading";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { returnImage } from "@/helpers/generals";

const AppGuidelineTool = ({section}:any) => {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(false);
  const [purposeList, setPurposeList] = useState([
    {
      purpose: "Passport Size Photo",
      value: "passport",
    },
    {
      purpose: "Visa",
      value: "visa",
    },
  ]);
  const [selectedValues, setSelectedValues] = useState({
    age: "Adults",
    purpose: "Passport Size Photo",
    country: "Algeria",
  });
  const [purpose, setPurpose] = useState<string | null>("Passport Size Photo");
  const [age, setAge] = useState("Adults");
  const [country, setCountry] = useState<string | null>("Algeria");
  const [dimension, setDimension] = useState("35mm X 45mm");
  const [background, setBackground] = useState("White");

  function onPurposeChange(purpose: any) {
    setSelectedValues({ ...selectedValues, purpose: purpose.target.value });
  }
  function onCountryChange(country: any) {
    setSelectedValues({ ...selectedValues, country: country.target.value });
    if (country.target.value == "United Arab Emirates") {
      if (purposeList.length <= 2) {
        setPurposeList([
          ...purposeList,
          {
            purpose: "Emirates ID",
            value: "Emirates ID",
          },
          {
            purpose: "UAE School Photo",
            value: "UAE School Photo",
          },
        ]);
      }
    } else {
      if (purposeList.length > 2) {
        setPurposeList(purposeList.splice(0, 2));
      }
    }
  }

  function onAgeChange(age: any) {
    setSelectedValues({ ...selectedValues, age: age.target.value });
  }

  function onCheckGuideLines(e: any) {
    e.preventDefault();
    setShowLoading(true);
    setCountry(selectedValues.country);
    setPurpose(selectedValues.purpose);
    setAge(selectedValues.age);
    setTimeout(() => {
      setShowLoading(false);
    }, 500);
  }
  function setDimensions() {
    console.log("Country", country);
    setBackground("White");
    if (country === "Canada" && purpose === "Passport Size Photo") {
      setDimension("50mm X 70mm");
    } else if (
      country === "Columbia" ||
      country === "India" ||
      country === "Saudi" ||
      country === "USA"
    ) {
      setDimension("51mm X 51mm");
    } else if (country === "Turkey") {
      setDimension("50mm X 60mm");
    } else if (country === "China") {
      setDimension("33mm X 48mm");
    } else if (country === "Egypt") {
      setDimension("40mm X 60mm");
    } else if (
      (country === "Belarus" && purpose === "Passport Size Photo") ||
      country === "Sudan"
    ) {
      setDimension("40mm X 50mm");
    } else if (country === "Cyprus" && purpose === "Visa") {
      setDimension("40mm X 50mm");
    } else if (country === "Syria") {
      setDimension("40mm X 40mm");
    } else if (country === "Brazil") {
      setDimension("30mm X 40mm");
    } else if (country === "Romania") {
      setDimension("30mm X 40mm + 7mm white box below photo");
    } else if (
      (country === "France" && purpose === "Passport Size Photo") ||
      country === "New Zealand"
    ) {
      setDimension("35mm X 45mm");
      setBackground("Grey");
    } else if (country === "Palestine") {
      setDimension("35mm X 45mm");
      setBackground("Blue");
    } else if (country === "United Arab Emirates") {
      setDimension("35mm X 40mm");
    } else {
      setDimension("35mm X 45mm");
    }
  }
  useEffect(() => {
    setDimensions();
  }, [country]);
  //console.log('section',section)
  return (
    <section className="guidelines--wrapper">
      {showLoading && <Loading />}
      <div className="services-tittle my-3">
        <h2 className="text-center heading-h2">
          Check Out Our Simple Passport Size <br /> Photo Guidelines Tool
        </h2>
      </div>
      <div className="guidelines py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <p className="content">
                Select the country, the type of document you intend to apply for
                and your age below.
              </p>
              <form className="guidelines-form">
                <label>Select Country Applying For</label>
                <select
                  onChange={(e) => onCountryChange(e)}
                  name="area"
                  id="area"
                  className="selectOptions"
                >
                  {countryList.map((country, i) => {
                    return (
                      <option key={i} value={country.name}>
                        {country?.name}
                      </option>
                    );
                  })}
                </select>
                <label>Select Purpose</label>
                <select
                  onChange={(e) => onPurposeChange(e)}
                  name="area"
                  id="area"
                  className="selectOptions"
                >
                  {purposeList.map((purpose, i) => {
                    return (
                      <option key={i} value={purpose.purpose}>
                        {purpose?.purpose}
                      </option>
                    );
                  })}
                </select>
                <label>Select Age - Adult, Baby or Kid</label>
                <select onChange={(e) => onAgeChange(e)}>
                  <option value="Adults">{`Adult (10 Years")`}</option>
                  <option value="Babies">Baby (0-5 Years)</option>
                  <option value="Kids">Kid (6-10 Years)</option>
                </select>

                <button
                  type="submit"
                  onClick={(e) => onCheckGuideLines(e)}
                  value="Submit"
                  className="theme-btn my-3"
                >
                  Check Guidelines
                </button>

                <div className="lower-sec content rte rte-settings">
                  <h6>
                    Below are the guidelines for <span>{country}</span>{" "}
                    <span> {purpose} </span> for <span>{age}</span>
                  </h6>
                  <br />
                  <div className="rte rte-settings">
                    <span>Photo Size: {dimension}</span>
                    <br />
                    <span>Background: {background}</span>
                  </div>

                  <br />
                  <ul className="content list_items">
                    {age === "Adults" && (
                      <>
                        <li>Keep straight face</li>
                        <li>Look straight into the camera lens </li>
                        <li>Your eyes must be open and visible</li>
                        <li>
                          No hair on face (if female, please don’t hide your
                          eyebrows or any part of face with hair)
                        </li>
                        <li>No smiling, keep a neutral expression</li>
                        <li>Preferable to not wear eye glasses</li>
                        <li>
                          Ears should show (if female, this is highly
                          recommended but not necessary - for scarfed women, you
                          can ignore)
                        </li>
                      </>
                    )}
                    {age === "Babies" && (
                      <>
                        <li>{`Have the baby's face straight`}</li>
                        <li>
                          Make the baby look straight into the camera lense or
                          somewhere towards the phone
                        </li>
                        <li>
                          Eyes must be open and visible (some customer agents
                          allow closed eyes too but don&lsquo;t risk)
                        </li>
                        <li>No hair or anything on the face of baby</li>
                        <li>
                          Take picture with neutral expression, preferably poker
                          faced, no smiling
                        </li>
                        <li>{`Preferable to have the baby's mouth closed`}</li>
                      </>
                    )}
                    {age === "Kids" && (
                      <>
                        <li>
                          Make the kid stand or sit straight with a straight
                          face
                        </li>
                        <li>Make him look straight into the camera lense</li>
                        <li>Eyes must be open and visible</li>
                        <li>{`No hair on face (if female, please don't hide eyebrows or any part of face with
											hair)
										`}</li>
                        <li>No smiling, a neutral expression mus tbe kept</li>
                        <li>
                          Preferable that the kid is not wearing eye glasses
                        </li>
                        <li>{`The kid's ears should show (if female, this is highly recommended but not necessary)
										`}</li>
                      </>
                    )}
                  </ul>
                  {age === "Babies" && (
                    <div>{`
									Pro Tip - Make the baby lie on a flat surface like a bed and position the phone
									camera
									on top of the baby's forehead and then click multiple photos
								`}</div>
                  )}
                </div>
              </form>
            </div>
            <div className="col-md-7 brdr-lft">
              {age === "Adults" && (
                <div className="row">
                  <div className="col-md-6">
                    <h2 className="text-center fw-bold my-2">Before Sample</h2>
                     {returnImage(section?.settings?.adultimagebefore)}
                  </div>
                  <div className="col-md-6">
                    <h2 className="text-center fw-bold my-2">After Sample</h2>
                    {returnImage(section?.settings?.adultimageafter)}
                  </div>
                </div>
              )}

              {age === "Babies" && (
                <div className="row">
                  <div className="col-md-6">
                    <h2 className="text-center fw-bold my-2">Before Sample</h2>
                    {returnImage(section?.settings?.babyimagebefore)}
                  </div>
                  <div className="col-md-6">
                    <h2 className="text-center fw-bold my-2">After Sample</h2>
                    {returnImage(section?.settings?.babyimageafter)}
                  </div>
                </div>
              )}

              {age === "Kids" && (
                <div className="row">
                  <div className="col-md-6">
                    <h2 className="text-center fw-bold my-2">Before Sample</h2>
                    {returnImage(section?.settings?.kidsimagebefore)}
                  </div>
                  <div className="col-md-6">
                    <h2 className="text-center fw-bold my-2">After Sample</h2>
                    {returnImage(section?.settings?.kidsimageafter)}
                  </div>
                </div>
              )}

              <br />
              <br />
              <div className="lower-sec rte rte-settings mb-5">
                <p>
                  Click on “Online Order” button to go to our online form to
                  submit a photo from your phone, which we will convert into a
                  passport size photo, sent via email and if you live in{" "}
                  <b>Dubai</b>, we can even deliver the hard copy to your
                  location <b>within same day.</b>
                </p>
                <p>
                  <b>Note:</b> {`It's`} <b>not</b> done by an auto computer
                  algorithm, however, our {`expert's`} in photoshop will take
                  care of the editing and making sure that the photo is accepted
                  (with <b>money-back guarantee</b> in case of rejection).
                </p>
              </div>
              <div className="d-block text-center">
                <Link
                  href="/passport-size-photos"
                  className="theme-btn order-btn mt-3"
                >
                  Online Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppGuidelineTool;
