"use client"
import React from "react";

const GridBtns = ({
  productsPerLineD,
  setViewSizeD,
  productsPerLineT,
  setViewSizeT,
  productsPerLineM,
  setViewSizeM,
}: any) => {
  return (
    <div
      className="cat_view col-auto"
      data-link="/collections/children?sort_by=manual&amp;"
    >
      <div className="dn dev_desktop dev_view_cat">
        <a
          rel="nofollow"
          href="#"
          data-mode="grid"
          data-dev="dk"
          data-col="6"
          className={
            productsPerLineD === 2
              ? "pr mr__10 cat_view_page view_6 view-active"
              : "pr mr__10 cat_view_page view_6"
          }
          onClick={(e) => setViewSizeD(e, 2)}
        ></a>
        <a
          rel="nofollow"
          href="#"
          data-mode="grid"
          data-dev="dk"
          data-col="4"
          className={
            productsPerLineD === 3
              ? "pr mr__10 cat_view_page view_4 view-active"
              : "pr mr__10 cat_view_page view_4"
          }
          onClick={(e) => setViewSizeD(e, 3)}
        ></a>
        <a
          rel="nofollow"
          href="#"
          data-mode="grid"
          data-dev="dk"
          data-col="3"
          className={
            productsPerLineD === 4
              ? "pr mr__10 cat_view_page view_3 view-active"
              : "pr mr__10 cat_view_page view_3"
          }
          onClick={(e) => setViewSizeD(e, 4)}
        ></a>
        <a
          rel="nofollow"
          href="#"
          data-mode="grid"
          data-dev="dk"
          data-col="15"
          className={
            productsPerLineD === 5
              ? "pr mr__10 cat_view_page view_15 view-active"
              : "pr mr__10 cat_view_page view_15"
          }
          onClick={(e) => setViewSizeD(e, 5)}
        ></a>
        <a
          rel="nofollow"
          href="#"
          data-mode="grid"
          data-dev="dk"
          data-col="2"
          className={
            productsPerLineD === 6
              ? "pr cat_view_page view_2 view-active"
              : "pr cat_view_page view_2"
          }
          onClick={(e) => setViewSizeD(e, 6)}
        ></a>
      </div>
      <div className="dn dev_tablet dev_view_cat">
        <a
          rel="nofollow"
          data-no-instant=""
          href="#"
          data-dev="tb"
          data-col="6"
          className={
            productsPerLineT === 2
              ? "pr mr__10 cat_view_page view_6 view-active"
              : "pr mr__10 cat_view_page view_6"
          }
          onClick={(e) => setViewSizeT(e, 2)}
        ></a>
        <a
          rel="nofollow"
          data-no-instant=""
          href="#"
          data-dev="tb"
          data-col="4"
          className={
            productsPerLineT === 3
              ? "pr mr__10 cat_view_page view_4 view-active"
              : "pr mr__10 cat_view_page view_4"
          }
          onClick={(e) => setViewSizeT(e, 3)}
        ></a>
        <a
          rel="nofollow"
          data-no-instant=""
          href="#"
          data-dev="tb"
          data-col="3"
          className={
            productsPerLineT === 4
              ? "pr cat_view_page view_3 view-active"
              : "pr cat_view_page view_3"
          }
          onClick={(e) => setViewSizeT(e, 4)}
        ></a>
      </div>
      <div className="flex dev_mobile dev_view_cat">
        <a
          rel="nofollow"
          data-no-instant=""
          href="#"
          data-dev="mb"
          data-col="12"
          className={
            productsPerLineM === 1
              ? "pr mr__10 cat_view_page view_12 view-active"
              : "pr mr__10 cat_view_page view_12"
          }
          onClick={(e) => setViewSizeM(e, 1)}
        ></a>
        <a
          rel="nofollow"
          data-no-instant=""
          href="#"
          data-dev="mb"
          data-col="6"
          className={
            productsPerLineM === 2
              ? "pr cat_view_page view_6 view-active fil-grid-btn"
              : "pr cat_view_page view_6"
          }
          onClick={(e) => setViewSizeM(e, 2)}
        ></a>
      </div>
    </div>
  );
};

export default GridBtns;
