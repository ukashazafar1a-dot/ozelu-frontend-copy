"use client";
import React, { useEffect,useState } from "react";
import slugify from "slugify";
import SizeChartModel from "./SizeChartModel";
import _ from 'lodash'
import {
  findVariantsByOption,
  sizeChartValues,
} from "@/helpers/CollectionHelper";

type VariantOption = {
  name: string;
  values: string[];
  _id: string;
};

type VariantSelectProps = {
  option: VariantOption;
  selected_value?: string;
  index?: number;
  selectedVariant?: any;
  handleVariantChange?: any;
  product?: any;
};

const VariantDropdown = ({
  option,
  selected_value,
  index,
  handleVariantChange,
  selectedVariant,
  product,
}: VariantSelectProps) => {
  // console.log("option ", option, "variant", product, 'selected_value',selected_value,index);

  function getOtherOptions(options:any, indexToExclude:any) {
      // Make a copy of the options array
      const otherOptions = options.slice();
      // Remove the element at the specified index
      otherOptions.splice(indexToExclude, 1);
      return otherOptions;
  }

  function findVariantByOptions(variants:any, targetOptions:any) {
    return variants.find((variant:any) => _.isEqual(variant.options,targetOptions));
  }

  function getCurrentVariant(otherOptions:any){
    return findVariantByOptions(product.variants,otherOptions)
  }

  function getImage(option:any){
    if(selectedVariant){
      let otherOptions = getOtherOptions(selectedVariant.options,index)
      otherOptions.push(option);
      const variant = getCurrentVariant(otherOptions);
      if(variant) return 'url('+variant?.featured_image?.src+')';
    }
    return 'url(https://res.cloudinary.com/dvk4zgeh4/image/upload/v1677099749/media/xuk4kwfiyxqg9gqfai4g.webp)';
  }


  return (
    <div
      data-opname={option?.name}
      className={`nt_select_ppr1 swatch is-label is-${
        option?.name && slugify(option?.name.toLowerCase())
      }`}
      id="nt_select_ppr_1"
    >
      <p className="swatch__title mb-0 d-flex align-items-center justify-content-between">
        <span>
          {option?.name}:
          <span className="nt_name_current"> {selected_value}</span>
        </span>
        {product?.size_chart && sizeChartValues?.includes(option?.name) ? (
          <SizeChartModel content={product?.size_chart} />
        ) : (
          <></>
        )}
      </p>

      <ul
        className="swatches-select swatch__list_pr"
        data-id={index}
        data-size="2"
      >
        {option?.values &&
          option?.values.map((value: any, i: any) => {
            // const singleVt = findVariantsByOption(
            //   product?.variants,
            //   option,
            //   value
            // );
            //console.log('founded varient',singleVt)
            return (
              <li
                key={i}
                data-index={i}
                data-value={value}
                className={`variant--swatch-item is-selected ${
                  value == selected_value ? "is-selected" : ""
                }`}
                data-escape={value}
                onClick={(e) => handleVariantChange(e, index)}
                style={{
                  backgroundImage: getImage(value),
                }}
              >
                <span className="sr-only">{value}</span>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default VariantDropdown;
