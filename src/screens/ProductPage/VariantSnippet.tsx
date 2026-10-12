"use client";
import React, { useEffect } from "react";
import slugify from "slugify";
import SizeChartModel from "./components/SizeChartModel";
import VariantDropdown from "./components/VariantDropdown";
import { sizeChartValues } from "@/helpers/CollectionHelper";

const get_color = [
  "color",
  "colors",
  "colour",
  "colours",
  "Color",
  "Colors",
  "Colour",
];
const get_img_v = [
  "type",
  "Type",
  "Choose your type",
  "Frames",
  "frames",
  "Choose your Type",
  "choose your type",
];

const VariantSnippet = ({ product, selectedVariant, changeVariant }: any) => {
  const [variants, setVariants] = React.useState<any>([]);
  function findVariant(opt1?: string, opt2?: string, opt3?: string) {
    return variants.find((v: any) => {
      return (
        (!opt1 || v?.option1 === opt1) &&
        (!opt2 || v?.option2 === opt2) &&
        (!opt3 || v?.option3 === opt3)
      );
    });
  }
  function isOptionAvailable(optionIndex: number, value: string) {
    return product?.variants?.some((variant: any) => {
      if (optionIndex === 0) {
        return (
          variant?.option1 === value &&
          (!selectedVariant?.option2 ||
            variant?.option2 === selectedVariant?.option2) &&
          (!selectedVariant?.option3 ||
            variant?.option3 === selectedVariant?.option3)
        );
      }

      if (optionIndex === 1) {
        return (
          variant?.option2 === value &&
          (!selectedVariant?.option1 ||
            variant?.option1 === selectedVariant?.option1) &&
          (!selectedVariant?.option3 ||
            variant?.option3 === selectedVariant?.option3)
        );
      }

      if (optionIndex === 2) {
        return (
          variant?.option3 === value &&
          (!selectedVariant?.option1 ||
            variant?.option1 === selectedVariant?.option1) &&
          (!selectedVariant?.option2 ||
            variant?.option2 === selectedVariant?.option2)
        );
      }

      return false;
    });
  }

  const handleVariantChange = (e: any, index: number) => {
    const value = e?.currentTarget?.dataset?.value;

    let opt1 = selectedVariant?.option1;
    let opt2 = selectedVariant?.option2;
    let opt3 = selectedVariant?.option3;

    if (index === 0) opt1 = value;
    if (index === 1) opt2 = value;
    if (index === 2) opt3 = value;

    const validVariant = findVariant(opt1, opt2, opt3);

    // ❌ Stop if variant does NOT exist
    if (!validVariant) {
      console.warn("Invalid variant combination:", opt1, opt2, opt3);
      return;
    }

    // ✅ Only change if valid
    changeVariant(
      validVariant.option1,
      validVariant.option2,
      validVariant.option3
    );
  };

  function getOptionImage(option: any) {}

  function containsColorWord(optionName: any) {
    return get_color.some((color) =>
      optionName.toLowerCase().includes(color.toLowerCase())
    );
  }
  function containsImageWord(optionName: any) {
    return get_img_v.some((color) =>
      optionName.toLowerCase().includes(color.toLowerCase())
    );
  }
  useEffect(() => {
    setVariants(product?.variants);
  }, [product]);
  //console.log("Rendering VariantSnippet", { product, selectedVariant });
  return (
    <>
      <div className="fimg_false variations mb__40 style__circle size_medium style_color des_color_1 remove_soldout_false">
        {product?.options?.map((option: any, index: any) => {
          let selected_value: any = null;
          switch (index) {
            case 0:
              selected_value = selectedVariant?.option1;
              break;
            case 1:
              selected_value = selectedVariant?.option2;
              break;
            default:
              selected_value = selectedVariant?.option3;
              break;
          }
          return (
            <div className="variant--snippet" key={index}>
              <>
                {containsColorWord(option.name) ? (
                  <div className="nt_select_ppr0  swatch is-color is-ntcolor">
                    <p className="swatch__title mb-0 d-flex align-items-center justify-content-between">
                      <span className="field--title">
                        {option.name}:
                        <span className="nt_name_current">
                          {" "}
                          {selected_value}
                        </span>
                      </span>
                      {product?.size_chart &&
                      (product?.template == "custom-mug-printing" ||
                        product?.template == "mug-products") ? (
                        <SizeChartModel
                          title={"Mugs Colors"}
                          content={product?.size_chart}
                        />
                      ) : (
                        <></>
                      )}
                    </p>
                    <ul
                      className="swatches-select swatch__list_pr"
                      data-id={index}
                      data-size="2"
                    >
                      {option?.values.map((value: any, i: any) => {
                        return (
                          <li
                            key={i}
                            data-index={i}
                            data-value={value}
                            className={`ttip_nt tooltip_top_right nt-swatch swatch_pr_item bg_css_natural-beige ${
                              value == selected_value ? "is-selected" : ""
                            }`}
                            data-escape={value}
                            onClick={(e) => handleVariantChange(e, index)}
                          >
                            <span className="tt_txt">{value}</span>
                            <span
                              className={`swatch__value_pr pr bg_color_${slugify(
                                value.toLowerCase()
                              )} lazyloadt4sed`}
                            ></span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <>
                    <div
                      data-opname={option.name}
                      className={`nt_select_ppr1 swatch is-label is-${slugify(
                        option.name.toLowerCase()
                      )}`}
                      id="nt_select_ppr_1"
                    >
                      <p className="swatch__title mb-0 d-flex align-items-center justify-content-between">
                        <span>
                          {option.name}:
                          <span className="nt_name_current">
                            {" "}
                            {selected_value}
                          </span>
                        </span>
                        {product?.size_chart &&
                        sizeChartValues?.includes(option?.name) ? (
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
                        {option?.values.map((value: any, i: any) => {
                          const isAvailable = isOptionAvailable(index, value);
                          return (
                            <li
                              key={i}
                              data-index={i}
                              data-value={value}
                              className={`nt-swatch swatch_pr_item pr bg_css_38x42-cm ${
                                value == selected_value ? "is-selected" : ""
                              }${
                                !isAvailable
                                  ? "is-disabled opacity-40 pointer-events-none"
                                  : ""
                              }`}
                              data-escape={value}
                              onClick={
                                isAvailable
                                  ? (e) => handleVariantChange(e, index)
                                  : undefined
                              }
                            >
                              <span className="swatch__value_pr">{value}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                )}
              </>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default VariantSnippet;
