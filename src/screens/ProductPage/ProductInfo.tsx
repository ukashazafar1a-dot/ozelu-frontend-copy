"use client";
import React from "react";
import { htmlDecode } from "../../helpers/generals";
import "./styleProductInfo.css";

import { useState } from "react";
const ProductInfo = ({ product }: any) => {
  const [active, setActive] = useState(1);
  const handleClick = (tabNumber: any) => {
    setActive(tabNumber);
  };

  return (
    <div className="wrapper__product-info" id="wrap_des_pr">
      <div className="container container_des">
        <div
          id="shopify-section-pr_description1"
          className="shopify-section shopify-tabs sp-tabs nt_section"
        >
          <ul className="ul_none ul_tabs is-flex fl_center fs__16 des_mb_2 des_style_1">
            <li
              className={`tab_title_block ${active === 1 && "active"}`}
              onClick={(e) => {
                e.preventDefault();
                handleClick(1);
              }}
            >
              <a className="db cg truncate pr" href="#">
                Description
              </a>
            </li>
            {/* <li className={`tab_title_block ${active===2 && "active"}`} onClick={(e)=>{e.preventDefault();handleClick(2)}}>
              <a className="db cg truncate pr" href="#">
                Variants
              </a>
            </li>
            <li className={`tab_title_block ${active===3 && "active"}`} onClick={(e)=>{e.preventDefault();handleClick(3)}}>
              <a className="db cg truncate pr"
                href="">
                Size Chart
              </a>
            </li> */}
          </ul>
          <div
            className={`panel entry-content sp-tab des_mb_2 des_style_1 sp-tab ${
              active === 1 ? "" : "dn"
            }`}
            id=""
          >
            <div className="js_ck_view"></div>
            <div className="heading bgbl dn">
              <a
                className="tab-heading flex al_center fl_between pr cd chp fwm"
                href=""
              >
                <span className="txt_h_tab">Description</span>
                <span className="nav_link_icon ml__5"></span>
              </a>
            </div>
            <div className="sp-tab-content product-description">
              {product?.description && (
                <div
                  className="rte"
                  dangerouslySetInnerHTML={{
                    __html: htmlDecode(product.description),
                  }}
                ></div>
              )}
            </div>
          </div>
          <div
            className={`panel entry-content sp-tab des_mb_2 des_style_1 ${
              active === 2 ? "" : "dn"
            }`}
            id="tab_pr_description1-1"
          >
            <div className="js_ck_view"></div>
            <div className={`heading bgbl dn`}>
              <a
                className="tab-heading flex al_center fl_between pr cd chp fwm"
                href="tab_pr_description1-1"
              >
                <span className="txt_h_tab">Variants</span>
                <span className="nav_link_icon ml__5"></span>
              </a>
            </div>
            <div className="sp-tab-content">
              <table className="pr_attrs">
                <tbody>
                  <tr className="attr_pa_color">
                    <th className="attr__label">Color</th>
                    <td className="attr__value">
                      <p>White, Black, Navy Blue, Royal Blue, Pastel Yellow</p>
                    </td>
                  </tr>
                  <tr className="attr_pa_size">
                    <th className="attr__label">Size</th>
                    <td className="attr__value">
                      <p>S, M, L, XL, XXL</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            className={`panel entry-content sp-tab des_mb_2 des_style_1 ${
              active === 3 ? "" : "dn"
            }`}
            id="tab_ce2439b8-6a37-4481-a009-9427484adf93"
          >
            <div className="js_ck_view"></div>
            <div className="heading bgbl dn">
              <a
                className="tab-heading flex al_center fl_between pr cd chp fwm"
                href="#tab_ce2439b8-6a37-4481-a009-9427484adf93"
              >
                <span className="txt_h_tab">Size Chart</span>
                <span className="nav_link_icon ml__5"></span>
              </a>
            </div>
            <div className="sp-tab-content">
              <div>
                <img
                  src="https://cdn.shopify.com/s/files/1/0613/5758/8700/files/size_charts-02_480x480.jpg?v=1655554552"
                  alt=""
                  style={{
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                    height: "480px",
                    width: "480px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
