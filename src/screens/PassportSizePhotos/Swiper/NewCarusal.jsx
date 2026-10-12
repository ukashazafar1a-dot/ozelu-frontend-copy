"use client"
import React from "react";
import Swiper from "./Swiper";
import "./style.css";

const slides = ["adult", "baby", "kid"];

const NewAppCarusal = ({ carouselName, adultImages, babyImages, kidImages }) => {
  return (
    <div>
      <div className="fluid">
        <div
          id={carouselName}
          className="carousel vertical slide"
          data-ride="carousel"
        >
          <div className="carousel-inner" role="listbox">
            {slides?.map((slide, i) => {
              return (
                <div
                  key={i}
                  className={
                    i == 0
                      ? "carousel-item  background-transparent active"
                      : "carousel-item  background-transparent"
                  }
                >
                  <div className="swiper-text-container">
                    {i == 0 && (
                      <div className="content-new-carusal">
                        <h1 className="heading">
                          Instructions for Adult Passport
                          Size Photography
                        </h1>
                        <ul>
                          <li>Keep straight face</li>
                          <li>Look straight into the camera lense</li>
                          <li>Your eyes must be open and visible</li>
                          <li>
                            No hair on face (if female, please don’t hide your
                            eyebrows or any part of face with hair)
                          </li>
                          <li>No smiling, keep a neutral expression</li>
                          <li>Preferable to not wear eye glasses</li>
                          <li>
                            Ears should show (if female, this is highly
                            recommended but not necessary - for scarfed women,
                            you can ignore)
                          </li>
                        </ul>
                      </div>
                    )}
                    {i == 1 && (
                      <div className="content-new-carusal">
                        <h1 className="heading">
                          Take a photo of your kid from the comfort of your home
                          using the below guidelines
                        </h1>
                        <ul>
                          <li>
                            {" "}
                            Make the kid stand or sit straight with a straight
                            face
                          </li>
                          <li>Make him look straight into the camera lense</li>
                          <li>Eyes must be open and visible</li>
                          <li>
                            No hair on face (if female, please don’t hide
                            eyebrows or any part of face with hair)
                          </li>
                          <li>No smiling, a neutral expression must be kept</li>
                          <li>
                            Preferable that the kid is not wearing eye glasses
                          </li>
                          <li>
                            The kids ears should show (if female, this is
                            highly recommended but not necessary)
                          </li>
                        </ul>
                      </div>
                    )}
                    {i == 2 && (
                      <div className="content-new-carusal">
                        <h1 className="heading">
                          How to take a photo of a Baby for a passport size
                          photo?
                        </h1>
                        <ul>
                          <li>Have the baby&lsquo;s face straight</li>
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
                            Take picture with neutral expression, preferably
                            poker faced, no smiling
                          </li>
                          <li> Preferable to have the baby&lsquo;s mouth closed</li>
                          <li>
                            Ears should show (this is highly recommended but not
                            necessary)
                          </li>
                        </ul>
                      </div>
                    )}
                    <Swiper
                      babyImages={
                        i === 0
                          ? adultImages
                          : i === 1
                          ? kidImages
                          : i === 2
                          ? babyImages
                          : null
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <a
            className="carousel-control-prev"
            href={"#" + carouselName}
            role="button"
            data-slide="prev"
          >
            <span aria-hidden="true">
              <i className="fa-solid fa-chevron-left" style={{color:"#12613c"}}></i>
            </span>
            <span className="sr-only">Previous</span>
          </a>
          <a
            className="carousel-control-next"
            href={"#" + carouselName}
            role="button"
            data-slide="next"
          >
            <span aria-hidden="true">
              <i className="fa-solid fa-chevron-right" style={{color:"#12613c"}}></i>
            </span>
            <span className="sr-only" >Next</span>
          </a>
        </div>
        <br />
      </div>
    </div>
  );
};

export default NewAppCarusal;
