"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Field, Formik, FieldArray, ErrorMessage, getIn } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import ImageDropzone from "../../../components/Dropzones/ImageDropzone";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import DeliveryChargesLine from "@/components/DeliveryChargesLine";
import { IMAGE_PRINT_TYPES } from "@/constants/uploadSupportedTypes";
import Checkout from "../../../components/Checkout";
import SearchableSelect from "../../../components/SearchableSelect";
import useApp from "../../../store/useApp";
import _ from "lodash";
import * as Yup from "yup";
import LoadingProgress from "../../../components/LoadingProgress";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import InfoTooltip from "@/components/InfoTooltip";
import showCustomPopup from "@/components/NoSwal";
import { privacyOptions } from "@/utils";
import {
  convertLength,
  getClosestSize,
  getSizesMaxDimenstions,
  getAreaSet,
  getMaxSize,
  checkFreeDelivery,
  getDeliveryCharges,
  hasValidFiles,
} from "@/helpers/generals";
import { sortArrayAlphabetically } from "@/libs/utils";
import { DeliveryArea, FbsThick, PageData } from "@/libs/types";
import {
  cityAreaLayer,
  fileUploading,
  formSubmission,
  pushDatalyer,
  pushDropdownLayer,
  pushOrderLayer,
  stripeStart,
} from "@/datalayers/CP";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadProgress from "@/components/FileUploadProgress";
import {
  buildOptionSelectOptions,
  getFoamBoardAddOnPriceKey,
  getFoamBoardFileAddOnTotal,
  getOptionBreakdownByType,
  getOptionUnitPrice,
  hasFoamBoardOptionsForSize,
  resolveFoamBoardOptionSelection,
} from "@/libs/foamBoardPricing";

/**
 * Max allowed for one custom side when the other side is already set.
 * Uses the largest preset sheet and allows rotation (same idea as getClosestSize).
 * Example max sheet 84.1×118.9 → width 102 with height 80 is allowed.
 */
function getFoamCustomSideMax(
  field: "width" | "height",
  otherSide: number,
  maxWidth: number,
  maxHeight: number,
): number {
  const absoluteMax = Math.max(maxWidth, maxHeight);
  if (!Number.isFinite(otherSide) || otherSide <= 0) {
    return absoluteMax;
  }
  const allowed: number[] = [];
  if (field === "width") {
    if (otherSide <= maxHeight) allowed.push(maxWidth);
    if (otherSide <= maxWidth) allowed.push(maxHeight);
  } else {
    if (otherSide <= maxWidth) allowed.push(maxHeight);
    if (otherSide <= maxHeight) allowed.push(maxWidth);
  }
  return allowed.length > 0 ? Math.max(...allowed) : absoluteMax;
}

const ValidationSchema = Yup.object().shape({
  firstname: Yup.string().required("Required"),
  lastname: Yup.string().required("Required"),
  phone: Yup.string().required("Required"),
  address: Yup.string().required("Required"),
  area: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
  sizes: Yup.array().of(
    Yup.object().shape({
      files: Yup.array()
        // .test(
        //   "fileSize",
        //   "Please check the size of the photos you have uploaded, each file should be less than a maximum of 10mb",
        //   function (files: any, { parent }) {
        //     const { isSelected } = parent;
        //     if (!isSelected || !files || files.length === 0) {
        //       return true;
        //     }
        //     if (files && files.length > 0) {
        //       for (const file of files) {
        //         const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
        //         if (file.size > maxSizeInBytes) {
        //           return false;
        //         }
        //       }
        //       return true;
        //     } else {
        //       return true;
        //     }
        //   }
        // )
        .test(
          "thickness",
          "Thickness is required",
          function (files: any, { parent }) {
            const { isSelected } = parent;
            if (!isSelected || !files || files.length === 0) {
              return true;
            }
            if (files && files.length > 0) {
              for (const file of files) {
                if (file.thickness == "") {
                  return false;
                }
              }
              return true;
            } else {
              return true;
            }
          }
        ),
      width: Yup.number().when(["custom", "isSelected"], {
        is: (custom: boolean, isSelected: boolean) => custom === true && isSelected === true,
        then: (schema) => schema.min(1, "Width must be greater than 0"),
        // .max(maxWidth, `Width cannot exceed ${maxWidth}`)
        // .test("max-height-dependent", "Width exceeds the allowed height limit", function (value) {
        //     const { height } = this.parent;
        //     if (height) {
        //         const maxAllowedWidth = getMaxDimension(height, "height");
        //         return !maxAllowedWidth || value <= maxAllowedWidth;
        //     }
        //     return true;
        // }),
      }),
      height: Yup.number().when(["custom", "isSelected"], {
        is: (custom: boolean, isSelected: boolean) => custom === true && isSelected === true,
        then: (schema) => schema.min(1, "Height must be greater than 0"),
        // .max(maxHeight, `Height cannot exceed ${maxHeight}`)
        // .test("max-width-dependent", "Height exceeds the allowed width limit", function (value) {
        //     const { width } = this.parent;
        //     if (width) {
        //         const maxAllowedHeight = getMaxDimension(width, "width");
        //         return !maxAllowedHeight || value <= maxAllowedHeight;
        //     }
        //     return true;
        // }),
      }),
    })
  ),
});

type props = {
  data?: PageData;
  areas: DeliveryArea[] | null;
};
const FbpOrderForm = ({ data, areas }: props) => {
  const { tryCreateToken, foamBoardPrintingPrices, resetStripeElements, sessionId } = useApp();
  const [showLoading, setShowLoading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [price, setPrice] = useState<any>(
    data?.min_price ? data?.min_price : 0
  );
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [orderValue, setOrderValue] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<any>(
    data?.free_delivery_threshold ? data?.free_delivery_threshold : 0
  );
  const [sizes, setSizes] = useState<any>([]);
  const [thickness, setThickness] = useState<FbsThick[] | null>([]);
  const foamBoardDisplayOptions = data?.foam_board_display_options ?? [];
  const foamBoardMountingOptions = data?.foam_board_mounting_options ?? [];
  const foamBoardLaminations = data?.foam_board_laminations ?? [];
  const formRef = useRef<any>();
  //console.log('photo printing prices',foamBoardPrintingPrices);

  const initialValues = useMemo(
    () => ({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      address: "",
      area: "",
      city: "",
      comments: "",
      privacy: "",
      customSize: false,
      sizes:
        data?.foam_board_sizes?.map((size) => ({
          ...size,
          isSelected: false,
          files: [],
          custom: false,
        })) ?? [],
    }),
    [data]
  );

  const getPresetSizesForPricing = () =>
    sizes?.length ? sizes : data?.foam_board_sizes ?? [];

  const getFoamBoardDropzoneProps = (size: any, _sizeIndex: number) => {
    const sizeKey = getFoamBoardAddOnPriceKey(size, getPresetSizesForPricing());
    return {
      foamBoardOptionOrder: true,
      showFoamBoardDisplay: hasFoamBoardOptionsForSize(
        foamBoardDisplayOptions,
        sizeKey,
      ),
      displayOptions: buildOptionSelectOptions(
        foamBoardDisplayOptions,
        sizeKey,
        "No Stand",
      ),
      showFoamBoardMounting: hasFoamBoardOptionsForSize(
        foamBoardMountingOptions,
        sizeKey,
      ),
      mountingOptions: buildOptionSelectOptions(
        foamBoardMountingOptions,
        sizeKey,
        "No Mounting",
      ),
      showPhotoLamination: hasFoamBoardOptionsForSize(
        foamBoardLaminations,
        sizeKey,
      ),
      laminationOptions: buildOptionSelectOptions(
        foamBoardLaminations,
        sizeKey,
        "No Lamination",
      ),
    };
  };

  const getSizeLabel = (size: any) =>
    `${size.width}cmX${size.height}cm (${size.width_in_inches}"x${size.height_in_inches}" inches)`;

  const resetForm = function () {
    formRef.current.resetForm();
    calculatePrice();
    resetStripeElements();
  };

  const getNewCustomSize = function () {
    let closestSize = getClosestSize(sizes, 0, 0);
    return {
      width: 0,
      height: 0,
      width_in_inches: 0,
      height_in_inches: 0,
      isSelected: true,
      custom: true,
      files: [],
      price: closestSize.price,
      thicknesses: closestSize.thicknesses,
      //discounts: closestSize.discounts,
    };
  };

  const onChangeCustomSize = function (value: any) {
    formRef?.current.setFieldValue("customSize", value);
    let { sizes } = getFormikValues();
    // Add custom size if there isn't any
    let haveCustomSize = false;
    sizes &&
      sizes?.forEach((size: any) => {
        if (size?.custom) {
          haveCustomSize = true;
        }
      });

    if (!haveCustomSize) {
      let closestSize = getClosestSize(sizes, 0, 0);
      sizes = [
        ...sizes,
        {
          width: 0,
          height: 0,
          width_in_inches: 0,
          height_in_inches: 0,
          isSelected: true,
          custom: true,
          files: [],
          price: closestSize.price,
          thicknesses: closestSize.thicknesses,
          //discounts: closestSize.discounts,
        },
      ];
      formRef?.current.setFieldValue("sizes", sizes);
    }

    if (value) {
      let newSizes = sizes?.map((size: any) => {
        return size.custom ? { ...size, isSelected: true } : size;
      });
      formRef?.current.setFieldValue("sizes", newSizes);
    } else {
      let newSizes = sizes?.map((size: any) => {
        return size.custom ? { ...size, isSelected: false } : size;
      });
      formRef?.current.setFieldValue("sizes", newSizes);
    }
  };

  const getCustomSizeLength = function () {
    const { sizes } = getFormikValues();
    let count = 0;
    sizes?.map((size: any) => {
      if (size.custom) count++;
    });
    return count;
  };

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    if (!formikValues) return {};
    return formikValues;
  };

  function getSizeQuantity(size: any) {
    try {
      if (!size || !size?.files) return 0;
      let copies = size?.files?.map((item: any) => parseInt(item.count));
      let totalQuantity = _.sum(copies);
      return totalQuantity;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  function calculatePrice() {
    setTimeout(() => {
      setPrice(0);
      setOrderValue(0);
      let newPrice = 0;
      let newOrderValue = 0;
      let newDeliveryCharges = 0;
      const { sizes, area } = getFormikValues();

      let value = newOrderValue + calculateTotalPrice();
      value = parseFloat(value.toFixed(2));
      newOrderValue = value;

      const minP = Number(data?.min_price) || 0;
      if (newOrderValue < minP) {
        newOrderValue = minP;
      }
      setPrice(newOrderValue);
      setOrderValue(newOrderValue);

      if (checkFreeDelivery(newOrderValue, freeDeliveryThreshold)) {
        newDeliveryCharges = 0;
      } else {
        newDeliveryCharges = getDeliveryCharges(
          foamBoardPrintingPrices,
          area,
          areas
        );
      }
      setDeliveryCharges(newDeliveryCharges);
    }, 100);
  }

  function onSubmit() {
    if (!data?.isActive) {
      //console.log(data)
      showCustomPopup(data?.alert_message);
      return;
    }
    formSubmission("Foam Board Panels Printing", "form_submission_attempt");
    const {
      firstname,
      lastname,
      email,
      phone,
      address,
      area,
      city,
      comments,
      privacy,
      sizes,
    } = getFormikValues();

    let haveFiles = hasValidFiles(sizes);
    if (!haveFiles) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please upload picture!",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
      formSubmission("Foam Board Panels Printing", "form_submission_error", {
        title: "Validation Error",
        text: "Please upload picture!",
      });
      return;
    }

    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart("Foam Board Panels Printing");
      if (token === undefined || token === "") {
        console.log("Error while getting token");
        formSubmission("Foam Board Panels Printing", "form_submission_error", {
          text: "Error while getting token",
        });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        sizes &&
          sizes?.forEach((size: any, sizeIndex: number) => {
            if (size.isSelected === true) {
              const name = getSizeLabel(size);
              const sizeKey = getFoamBoardAddOnPriceKey(size, getPresetSizesForPricing());

              // 🔹 Filter out files with failed status
              const validFiles = size.files.filter((file: any) => file.status !== 'failed');

              validFiles.forEach((file: any) => {
                const extension = file.name.split(".").pop();
                const filename = `${file.name
                  .split(".")
                  .slice(0, -1)
                  .join(".")}_${name}_${file?.print}(${file.count
                  }).${extension}`;
                filesMetaData.push({
                  filename,
                  url: file.url,
                  key: file.key,
                  count: file.count,
                  size: name,
                  dimension: file?.print,
                  thickness: file?.thickness,
                  thickness_price: file?.thicknessPrice,
                  display: resolveFoamBoardOptionSelection(
                    foamBoardDisplayOptions,
                    sizeKey,
                    file?.display,
                  ),
                  displayUnitPrice: getOptionUnitPrice(
                    foamBoardDisplayOptions,
                    sizeKey,
                    resolveFoamBoardOptionSelection(
                      foamBoardDisplayOptions,
                      sizeKey,
                      file?.display,
                    ),
                  ),
                  mounting: resolveFoamBoardOptionSelection(
                    foamBoardMountingOptions,
                    sizeKey,
                    file?.mounting,
                  ),
                  mountingUnitPrice: getOptionUnitPrice(
                    foamBoardMountingOptions,
                    sizeKey,
                    resolveFoamBoardOptionSelection(
                      foamBoardMountingOptions,
                      sizeKey,
                      file?.mounting,
                    ),
                  ),
                  lamination: resolveFoamBoardOptionSelection(
                    foamBoardLaminations,
                    sizeKey,
                    file?.lamination,
                  ),
                  laminationUnitPrice: getOptionUnitPrice(
                    foamBoardLaminations,
                    sizeKey,
                    resolveFoamBoardOptionSelection(
                      foamBoardLaminations,
                      sizeKey,
                      file?.lamination,
                    ),
                  ),
                });
              });

              const priceSummary: any = getThicknessPriceSummary(size);
              {
                Object.entries(priceSummary).map(
                  ([thickness, totalPrice]: any) => {
                    // Get the total count of photos for the specific thickness
                    const totalPhotos = size.files
                      .filter((file: any) => file.thickness == thickness)
                      .reduce((sum: number, file: any) => sum + file.count, 0);

                    // Get unit price for the thickness (assuming all files with the same thickness have the same unit price)
                    const unitPrice =
                      size.files.find(
                        (file: any) => file.thickness == thickness
                      )?.thicknessPrice || 0;
                    sizesMetaData.push({
                      size: name,
                      thickness: thickness,
                      count: totalPhotos,
                      price: parseFloat(totalPrice.toFixed(2)),
                      unitPrice,
                    });
                  }
                );
              }

              const pushAddonLines = (
                rows: typeof foamBoardDisplayOptions,
                fieldName: "display" | "mounting" | "lamination",
              ) => {
                getOptionBreakdownByType(
                  rows,
                  sizeKey,
                  validFiles,
                  fieldName,
                ).forEach((row) => {
                  sizesMetaData.push({
                    size: name,
                    option_name: row.type,
                    option_kind: fieldName,
                    count: row.count,
                    unitPrice: row.unitPrice,
                    price: row.total,
                    is_foam_board_addon: true,
                  });
                });
              };

              pushAddonLines(foamBoardDisplayOptions, "display");
              pushAddonLines(foamBoardMountingOptions, "mounting");
              pushAddonLines(foamBoardLaminations, "lamination");
            }
          });
        fileUploading("Foam Board Panels Printing", filesMetaData, "started");
        formData.append("order_type", "foam_board");
        formData.append("firstname", firstname);
        formData.append("lastname", lastname);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("area", area);
        formData.append("city", city);
        formData.append("comments", comments);
        formData.append("filesData", JSON.stringify(filesMetaData));
        formData.append("sizesData", JSON.stringify(sizesMetaData));
        formData.append("privacy", privacy);
        formData.append(
          "price",
          parseFloat(price + deliveryCharges).toFixed(2)
        );
        formData.append("token", token.id);
        if (sessionId) formData.append("session_id", sessionId);
        formData.append(
          "delivery_charges",
          String(getDeliveryCharges(foamBoardPrintingPrices, area, areas))
        );
        formData.append(
          "free_delivery",
          String(checkFreeDelivery(price, freeDeliveryThreshold))
        );

        try {
          const { data } = await axios({
            data: formData,
            method: "post",
            url:
              process.env.NEXT_PUBLIC_API_URL + "/api/createOrder",
            headers: {
              "Content-Type": "application/json",
            },
            onUploadProgress: (progressEvent: any) => {
              //console.log(progressEvent);
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setPercentageUploaded(progress);
            },
          });
          fileUploading(
            "Foam Board Panels Printing",
            filesMetaData,
            "completed"
          );
          const { order_id, customer_id } = data;

          axios
            .post(
              process.env.NEXT_PUBLIC_API_URL +
              "/api/stripe/pay",
              {
                order_id,
                customer_id,
                session_id: sessionId
              }
            )
            .then((response) => {
              if (response.data.status) {
                setShowLoading(false);
                Swal.fire({
                  title: "Order Placed!",
                  text: "Please check Your Email!",
                  icon: "success",
                  showLoaderOnConfirm: false,
                  showLoaderOnDeny: false,
                  loaderHtml: `<div></div>`,
                });
                const { object } = response?.data;
                pushOrderLayer("Foam Board Panels Printing", object);
                resetForm();
              } else {
                setShowLoading(false);
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text:
                    response?.data?.message ||
                    "Failed to collect your payment.",
                  showLoaderOnConfirm: false,
                  showLoaderOnDeny: false,
                  loaderHtml: `<div></div>`,
                });
                formSubmission(
                  "Foam Board Panels Printing",
                  "form_submission_error",
                  {
                    title: "Oops...",
                    text:
                      response?.data?.message ||
                      "Failed to collect your payment.",
                  }
                );
              }
            })
            .catch((err) => {
              setShowLoading(false);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text:
                  err?.response?.data?.message ||
                  "Failed to collect your payment.",
                showLoaderOnConfirm: false,
                showLoaderOnDeny: false,
                loaderHtml: `<div></div>`,
              });
              formSubmission(
                "Foam Board Panels Printing",
                "form_submission_error",
                {
                  title: "Oops...",
                  text:
                    err?.response?.data?.message ||
                    "Failed to collect your payment.",
                }
              );
            });
        } catch (error: any) {
          setShowLoading(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on care@ozelu.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
              }`,
            showLoaderOnConfirm: false,
            showLoaderOnDeny: false,
            loaderHtml: `<div></div>`,
          });
          formSubmission(
            "Foam Board Panels Printing",
            "form_submission_error",
            {
              title: "Oops...",
              text: `${error?.response?.data?.message ||
                `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on care@ozelu.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
                }`,
            }
          );
        }
      }
    });
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer("Foam Board Panels Printing", type, value);
    if (!areas) return;
    if (type === "city") {
      formRef.current.setFieldValue("area", "");
      //console.log(value)
      const filteredAreas = areas?.filter((area) => area?.city === value);
      const sortedAreas = sortArrayAlphabetically(filteredAreas);
      const options = sortedAreas?.map((area) => ({
        value: area?.name,
        label: area?.name,
      }));
      setAreaOptions(options);
    }
    formRef.current.setFieldValue(type, value);
    await Promise.resolve();
    calculatePrice();
  }

  function updateFilesThicknessPrice(index: any, thicknesses: any) {
    const { sizes } = getFormikValues();
    let newFiles = null;
    if (
      sizes &&
      sizes.length > 0 &&
      typeof sizes[index] !== "undefined" &&
      sizes[index]?.files &&
      sizes[index].files.length > 0
    ) {
      newFiles = sizes[index].files.map((file: any) => {
        // 🔹 Skip failed files (leave them unchanged)
        if (file.status === 'failed') return file;
        let fileThickness = file.thickness;
        let selectedThickness = thicknesses.filter(
          (item: any) => item.value == fileThickness
        )[0];
        if (!selectedThickness) return file;
        return Object.assign(file, {
          thickness: selectedThickness.value,
          thicknessPrice: selectedThickness.price,
        });
      });
    }
    if (!newFiles) return;
    formRef?.current.setFieldValue("sizes[" + index + "].files", newFiles);
  }

  function handleSizeChange(index: any, field: any, value: any) {
    const maxValues = getSizesMaxDimenstions(sizes);
    const { sizes: formSizes } = getFormikValues();
    const current = formSizes?.[index] || {};
    const numericValue = Number(value);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

    if (field === "width") {
      const otherHeight = Number(current.height) || 0;
      const maxAllowed = getFoamCustomSideMax(
        "width",
        otherHeight,
        maxValues.maxWidth,
        maxValues.maxHeight,
      );
      const nextWidth = safeValue > maxAllowed ? maxAllowed : safeValue;
      formRef?.current.setFieldValue("sizes[" + index + "].width", nextWidth);
      formRef?.current.setFieldValue(
        "sizes[" + index + "].width_in_inches",
        convertLength(nextWidth, "cm"),
      );
    } else {
      const otherWidth = Number(current.width) || 0;
      const maxAllowed = getFoamCustomSideMax(
        "height",
        otherWidth,
        maxValues.maxWidth,
        maxValues.maxHeight,
      );
      const nextHeight = safeValue > maxAllowed ? maxAllowed : safeValue;
      formRef?.current.setFieldValue("sizes[" + index + "].height", nextHeight);
      formRef?.current.setFieldValue(
        "sizes[" + index + "].height_in_inches",
        convertLength(nextHeight, "cm"),
      );
    }

    setTimeout(() => {
      const { sizes: updatedSizes } = getFormikValues();
      let size = updatedSizes[index];
      let closestSize = getClosestSize(updatedSizes, size.width, size.height);

      if (closestSize) {
        formRef?.current.setFieldValue(
          "sizes[" + index + "].price",
          closestSize?.price,
        );
        formRef?.current.setFieldValue(
          "sizes[" + index + "].thicknesses",
          closestSize?.thicknesses,
        );
        updateFilesThicknessPrice(index, closestSize.thicknesses);
      }
      setTimeout(() => {
        calculatePrice();
      }, 1000);
    }, 1000);
  }

  async function handlePrivacyChange(e: any) {
    formRef.current.handleChange(e?.target?.name, e.target?.value);
  }

  function calculateTotalPrice() {
    const { sizes } = getFormikValues();
    if (!Array.isArray(sizes)) return 0;
    return sizes.reduce((total: any, size: any, sizeIndex: number) => {
      if (size.isSelected !== true) return total;
      if (!size?.files?.length) return total;
      const sizeKey = getFoamBoardAddOnPriceKey(size, getPresetSizesForPricing());
      const validFiles = size.files.filter((file: any) => file.status !== 'failed');
      const sizeTotal = validFiles.reduce((sum: any, file: any) => {
        const count = parseInt(file.count) || 0;
        const thicknessUnit = parseFloat(file.thicknessPrice) || 0;
        const addOnUnit = getFoamBoardFileAddOnTotal(
          file,
          sizeKey,
          foamBoardDisplayOptions,
          foamBoardMountingOptions,
          foamBoardLaminations,
        );
        return sum + thicknessUnit * count + addOnUnit;
      }, 0);
      return total + sizeTotal;
    }, 0);
  }

  function getThicknessPriceSummary(size: any) {
    if (size.isSelected !== true) return {};
    if (!size?.files?.length) return {};
    // 🔹 Filter out failed files
    const validFiles = size.files.filter((file: any) => file.status !== 'failed');
    return validFiles.reduce((acc: any, file: any) => {
      const thickness = file.thickness; // Thickness as key
      const count = parseInt(file.count) || 0;
      const price = parseFloat(file.thicknessPrice) || 0;

      const totalPrice = price * count; // Calculate total price for this file

      // If thickness exists, add the price, otherwise, initialize it
      acc[thickness] = (acc[thickness] || 0) + totalPrice;
      return acc;
    }, {});
  }

  function renderSizePrice(size: any, sizeIndex: number) {
    const priceSummary: any = getThicknessPriceSummary(size);
    const validFiles = size.files?.filter((file: any) => file.status !== 'failed') || [];
    const sizeKey = getFoamBoardAddOnPriceKey(size, getPresetSizesForPricing());
    const sizeDims = `${size.width}cm X ${size.height}cm (${size.width_in_inches}'' X ${size.height_in_inches}'')`;

    const renderAddonLines = (
      rows: typeof foamBoardDisplayOptions,
      fieldName: "display" | "mounting" | "lamination",
    ) =>
      getOptionBreakdownByType(rows, sizeKey, validFiles, fieldName).map(
        (row) => (
          <div key={`${fieldName}-${row.type}`}>
            {sizeDims} - {row.type}: {row.count} x {row.unitPrice} AED ={" "}
            {row.total.toFixed(2)} AED
          </div>
        ),
      );

    return (
      <>
        {Object.entries(priceSummary).map(([thickness, totalPrice]: any) => {
          const totalPhotos = validFiles
            .filter((file: any) => file.thickness == thickness)
            .reduce((sum: number, file: any) => sum + file.count, 0);

          const unitPrice =
            validFiles.find((file: any) => file.thickness == thickness)
              ?.thicknessPrice || 0;
          return (
            <div key={thickness}>
              {sizeDims} - {thickness}mm Thickness Foam Board Panels:{" "}
              {totalPhotos} Foam Board Panel{totalPhotos === 1 ? "" : "s"} x{" "}
              {unitPrice} AED = {parseFloat(totalPrice.toFixed(2))} AED
            </div>
          );
        })}
        {renderAddonLines(foamBoardDisplayOptions, "display")}
        {renderAddonLines(foamBoardMountingOptions, "mounting")}
        {renderAddonLines(foamBoardLaminations, "lamination")}
      </>
    );
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(foamBoardPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles() {
    const { sizes } = getFormikValues();
    const files = (sizes || [])
      .filter((size: any) => size?.isSelected === true) // only selected sizes
      .flatMap((size: any) => Array.isArray(size.files) ? size.files : []);
    return files;
  }

  function renderFileUploadSummary() {
    const files = getAllFiles();
    return <FileUploadSummary files={files} />
  }

  function renderFileUploadProgress() {
    const files = getAllFiles();
    return <FileUploadProgress files={files} />
  }

  useEffect(() => {
    //console.log("SIzes", data?.sizes);
    setPrice(data?.min_price ? data?.min_price : 0);
    setSizes(data?.foam_board_sizes);
    if (data?.foam_board_sizes) {
      const firstSize = data?.foam_board_sizes[0];
      setThickness(firstSize?.thicknesses);
    }
  }, [data]);

  useEffect(() => {
    if (areas) {
      let allCities: any = [];
      let allAreas: any = [];
      areas?.forEach((area) => {
        if (!allCities?.includes(area?.city)) {
          allCities?.push(area?.city);
        }
      });
      let optionsTwo: any = allCities.sort().map((city: any, i: any) => {
        return { value: city, label: city };
      });

      const firstCity = optionsTwo[0];
      //console.log("all cities", optionsTwo, "First selected", firstCity);
      areas?.forEach((area) => {
        if (area?.city === firstCity?.value) {
          allAreas.push({ value: area?.name, label: area?.name });
        }
      });
      formRef.current.setFieldValue("city", firstCity?.value);
      const sortedAreas = sortArrayAlphabetically(allAreas);
      setAreaOptions(sortedAreas);
      setCityOptions(optionsTwo);
    }
  }, [areas]);

  //console.log("Data", data, areas,cityOptions);
  return (
    <div
      className="photo-printing-form--wrapper order-form--wrapper"
      id="orderForm"
    >
      {showLoading && <LoadingProgress loaded={percentageUploaded} />}
      <Formik
        innerRef={formRef}
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={ValidationSchema}
        validate={() => {
          calculatePrice();
          return undefined;
        }}
        onSubmit={(values, errors) => {
          //console.log(values)
          calculatePrice();
          onSubmit();
          // openButton.current.click()
        }}
      >
        {({
          values,
          errors,
          touched,
          isValid,
          handleSubmit,
          handleChange,
          setFieldValue,
          setFieldError,
          setFieldTouched,
          validateForm,
        }) => {
          return (
            <form
              className="order-form container mb-5"
              onSubmit={(event) => {
                event.preventDefault();
                validateForm().then((errors) => {
                  if (errors && Object.keys(errors).length !== 0) {
                    let errorMessage = "Please fill all fields!";

                    if (errors?.sizes && Array.isArray(errors.sizes)) {
                      const errorMessages = errors.sizes
                        ?.filter((item: any) => item && item.files)
                        .map((item: any) => item.files);
                      if (errorMessages.length > 0)
                        errorMessage = errorMessages[0];
                    }
                    Swal.fire({
                      icon: "error",
                      title: "Validation Error",
                      text: `${errorMessage}`,
                      showLoaderOnConfirm: false,
                      showLoaderOnDeny: false,
                      loaderHtml: `<div></div>`,
                    });
                    formSubmission(
                      "Foam Board Panels Printing",
                      "form_submission_error",
                      {
                        title: "Validation Error",
                        text: `${errors?.sizes
                          ? "Please check the size of the photos you have uploaded, each file should be less than a maximum of 10mb"
                          : "Please fill all fields!"
                          }`,
                        errors,
                      }
                    );
                    handleSubmit();
                  } else {
                    handleSubmit();
                  }
                });
              }}
            >
              <CheckoutActivityFormTracker orderType="FOAM_BOARD" />
              <div className="contactSection" id="photos">
                <h2 className="heading-h2 text-center my-4 mx-0">
                  Fill The Form Below To Place An Order
                </h2>
                <div className="formContainer">
                  <div className="formControll">
                    <label htmlFor="firstname">First Name</label>
                    <input
                      data-formControlName="firstname"
                      type="text"
                      value={values.firstname}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() =>
                        pushDatalyer("Foam Board Panels Printing", "First Name")
                      }
                      placeholder="Please Write Your First Name"
                      name="firstname"
                      id="firstname"
                    />
                    {errors.firstname && touched.firstname && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                            alt="error image"
                            loading="lazy"
                          />
                        </span>{" "}
                        Please enter your first name
                      </div>
                    )}
                  </div>

                  <div className="formControll">
                    <label htmlFor="lastname">Last Name</label>
                    <input
                      data-formControlName="lastname"
                      type="text"
                      value={values.lastname}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() =>
                        pushDatalyer("Foam Board Panels Printing", "Last Name")
                      }
                      placeholder="Please Write Your Last Name"
                      name="lastname"
                      id="lastname"
                    />
                    {errors.lastname && touched.lastname && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                            alt="error image"
                            loading="lazy"
                          />
                        </span>{" "}
                        Please enter your last name
                      </div>
                    )}
                  </div>

                  <div className="formControll">
                    <label htmlFor="email">Email</label>
                    <input
                      data-formControlName="email"
                      type="email"
                      id="email"
                      value={values.email}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() =>
                        pushDatalyer("Foam Board Panels Printing", "Email")
                      }
                      placeholder="Please Write Your Email"
                      name="email"
                    />
                    {errors.email && touched.email && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                            alt="error image"
                            loading="lazy"
                          />
                        </span>{" "}
                        Please enter your valid email address
                      </div>
                    )}
                  </div>

                  <div className="formControll">
                    <label htmlFor="pnumber">
                      Phone Number (Preferably With WhatsApp)
                    </label>
                    <input
                      data-formControlName="phone"
                      type="tel"
                      id="pnumber"
                      placeholder="Please Write Your Phone Number"
                      name="phone"
                      value={values.phone}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() =>
                        pushDatalyer(
                          "Foam Board Panels Printing",
                          "Phone Number"
                        )
                      }
                    />
                    {errors.phone && touched.phone && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                            alt="error image"
                            loading="lazy"
                          />
                        </span>{" "}
                        Please enter your phone number
                      </div>
                    )}
                  </div>
                  <div className="formControll">
                    <label htmlFor="city">City</label>
                    <SearchableSelect
                      value={values.city}
                      type="city"
                      onChangeHandler={setValueCalculatePrice}
                      options={cityOptions}
                    />
                    {errors.city && touched.city && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                            alt="error image"
                            loading="lazy"
                          />
                        </span>{" "}
                        Please select a city
                      </div>
                    )}
                  </div>
                  <div className="formControll">
                    <label htmlFor="area">Area</label>
                    <SearchableSelect
                      value={values.area}
                      type="area"
                      onChangeHandler={setValueCalculatePrice}
                      options={areaOptions}
                    />
                    {errors.area && touched.area && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                            alt="error image"
                            loading="lazy"
                          />
                        </span>{" "}
                        Please select your area
                      </div>
                    )}
                  </div>
                  <div className="formControll">
                    <label htmlFor="address">
                      Address (Please Don't Put Work/Office Address - Preferably
                      Home)
                    </label>
                    <input
                      data-formControlName="address"
                      type="text"
                      value={values.address}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() =>
                        pushDatalyer("Foam Board Panels Printing", "Address")
                      }
                      id="address"
                      name="address"
                      placeholder="Please Write Your Address"
                    />
                    {errors.address && touched.address && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                            alt="error image"
                            loading="lazy"
                          />
                        </span>{" "}
                        Please enter your address
                      </div>
                    )}
                  </div>
                  {/* New Privacy Field */}
                  <div className="formControll">
                    <label htmlFor="privacy">Privacy Preference</label>
                    <Field
                      as="select"
                      id="privacy"
                      name="privacy"
                      className="selectOptionsCustom new-custom-field-rf"
                      value={values.privacy}
                      onChange={(e: any) => {
                        handleChange(e);
                        pushDropdownLayer(
                          "Foam Board Panels Printing",
                          "Privacy Preference",
                          e.target?.value
                        );
                      }}
                      onFocus={() =>
                        pushDatalyer(
                          "Foam Board Panels Printing",
                          "Privacy Preference"
                        )
                      }
                    >
                      <option
                        value=""
                        label="Choose Your Privacy Preference"
                        selected
                        disabled
                      />
                      {privacyOptions?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                    {errors.privacy && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                            alt="error image"
                            loading="lazy"
                          />
                        </span>{" "}
                        Please Select Your Privacy Preference
                      </div>
                    )}
                  </div>
                </div>
                <br />
                <br />
                <div className="formControll">
                  <p className="font-secondary fw-medium single-label photo-print-sizes-heading mb-0 order-option-label">
                    Please Choose From The Sizes Below You Would Like to Print
                    Or Choose{" "}
                    <span className="photo-print-sizes-heading__end">
                      Custom Sizes
                      <InfoTooltip
                        className="photo-print-sizes-heading__info"
                        content="Select from Standard sizes below or create your own Custom Size(s)"
                      />
                    </span>
                  </p>
                </div>
                <div className="formControll photo-print-sizes-list">
                  <FieldArray
                    name="sizes"
                    render={(arrayHelpers) => {
                      return (
                        <>
                          {values.sizes && values.sizes.length > 0 && (
                            <>
                              <div className="checkbox-container">
                                <input
                                  checked={values.customSize}
                                  onChange={() => {
                                    onChangeCustomSize(!values.customSize);
                                    calculatePrice();
                                  }}
                                  type="checkbox"
                                  onFocus={() =>
                                    pushDatalyer(
                                      "Foam Board Panels Printing",
                                      "Custom Sizes"
                                    )
                                  }
                                  name={`customSize`}
                                />
                                <label
                                  className="margin-left-15"
                                  htmlFor="img-bg-1"
                                >
                                  Custom Sizes
                                </label>
                                <br />
                              </div>
                              {values.customSize && (
                                <div className="custom-sizes-container">
                                  {values?.sizes?.map(
                                    (size: any, index: any, array: any) => {
                                      if (!size.custom) return "";
                                      let thickness = size.thicknesses;
                                      return (
                                        <div key={index}>
                                          <div className="formContainer custom-sizes-form">
                                            <div className="formControll">
                                              <label
                                                htmlFor={`sizes[${index}].width`}
                                              >
                                                Width (cm)
                                              </label>
                                              <input
                                                className="input-hidden-arrows"
                                                data-formControlName="width"
                                                type="number"
                                                min={"0"}
                                                step={"0.01"}
                                                max={getMaxSize(sizes)}
                                                value={size.width === 0 ? "" : size.width}
                                                onChange={(e) => {
                                                  handleSizeChange(
                                                    index,
                                                    "width",
                                                    Number(
                                                      parseFloat(
                                                        e.target.value
                                                      ).toFixed(2)
                                                    )
                                                  );
                                                }}
                                                name={`sizes[${index}].width`}
                                                id={`sizes[${index}].width`}
                                              />
                                              {errors.sizes &&
                                                errors?.sizes[index] &&
                                                typeof errors.sizes[index] ==
                                                "object" &&
                                                errors.sizes[index]["width"] &&
                                                touched.sizes &&
                                                typeof touched.sizes ==
                                                "object" &&
                                                touched.sizes[index] &&
                                                typeof touched.sizes[index] ==
                                                "object" &&
                                                touched.sizes[index][
                                                "width"
                                                ] && (
                                                  <div className="inputError">
                                                    <div className="arrow-up"></div>
                                                    <span>
                                                      <img
                                                        className="errorImage"
                                                        src={
                                                          "/images/images/error.jpeg"
                                                        }
                                                        alt="error image"
                                                        loading="lazy"
                                                      />
                                                    </span>{" "}
                                                    Width is required
                                                  </div>
                                                )}
                                            </div>
                                            <div className="formControll">
                                              <label
                                                htmlFor={`sizes[${index}].height`}
                                              >
                                                Height (cm)
                                              </label>
                                              <input
                                                className="input-hidden-arrows"
                                                data-formControlName="height"
                                                type="number"
                                                min={"0"}
                                                max={getMaxSize(sizes)}
                                                step={"0.01"}
                                                value={size.height === 0 ? "" : size.height}
                                                onChange={(e) => {
                                                  handleSizeChange(
                                                    index,
                                                    "height",
                                                    Number(
                                                      parseFloat(
                                                        e.target.value
                                                      ).toFixed(2)
                                                    )
                                                  );
                                                }}
                                                name={`sizes[${index}].height`}
                                                id={`sizes[${index}].height`}
                                              />
                                              {errors.sizes &&
                                                errors?.sizes[index] &&
                                                typeof errors.sizes[index] ==
                                                "object" &&
                                                errors.sizes[index]["height"] &&
                                                touched.sizes &&
                                                typeof touched.sizes ==
                                                "object" &&
                                                touched.sizes[index] &&
                                                typeof touched.sizes[index] ==
                                                "object" &&
                                                touched.sizes[index][
                                                "height"
                                                ] && (
                                                  <div className="inputError">
                                                    <div className="arrow-up"></div>
                                                    <span>
                                                      <img
                                                        className="errorImage"
                                                        src={
                                                          "/images/images/error.jpeg"
                                                        }
                                                        alt="error image"
                                                        loading="lazy"
                                                      />
                                                    </span>{" "}
                                                    Height is required
                                                  </div>
                                                )}
                                            </div>
                                            {getCustomSizeLength() > 1 && (
                                              <div className="d-flex align-items-end justify-content-end">
                                                <div
                                                  className="remove-btn-wrapper"
                                                  onClick={() =>
                                                    arrayHelpers.remove(index)
                                                  }
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="#e58383"
                                                    height="32"
                                                    width="32"
                                                    viewBox="0 -960 960 960"
                                                  >
                                                    <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z" />
                                                  </svg>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          <br />
                                          <div className="checkbox-container">
                                            <input
                                              checked={size.isSelected}
                                              onChange={() => {
                                                setFieldValue(
                                                  `sizes[${index}].isSelected`,
                                                  !size.isSelected
                                                );
                                                calculatePrice();
                                              }}
                                              type="checkbox"
                                              name={`sizes[${index}].isSelected`}
                                            />
                                            <label
                                              className="margin-left-15"
                                              htmlFor="img-bg-1"
                                            >
                                              {size?.width}cmx{size?.height}
                                              cm (
                                              {convertLength(size.width, "cm")}
                                              ’’x
                                              {convertLength(size.height, "cm")}
                                              ’’ inches){" "}
                                              {size.name
                                                ? "- " + size.name + " Size "
                                                : " "}
                                              <FileUploadingStatus files={size.files} />
                                            </label>
                                            <br />
                                          </div>
                                          {size.isSelected && (
                                            <>
                                              <div className="custom-dropzone--container foam-board-upload-container">
                                                <ImageDropzone
                                                  orderType="FOAM_BOARD"
                                                  files={size.files}
                                                  setFiles={(files: any) => {
                                                    setFieldValue(
                                                      `sizes[${index}].files`,
                                                      files
                                                    );
                                                    setFieldTouched(
                                                      `sizes[${index}].files`,
                                                      true,
                                                      true
                                                    );
                                                    calculatePrice();
                                                  }}
                                                  showCounters={true}
                                                  showPrint={true}
                                                  showThickness={true}
                                                  thickness={thickness as any}
                                                  zoom={true}
                                                  {...getFoamBoardDropzoneProps(size, index)}
                                                />
                                                <UploadInfoLabel
                                                  supportedTypes={IMAGE_PRINT_TYPES}
                                                />
                                                <ErrorMessage
                                                  name={`sizes[${index}].files`}
                                                >
                                                  {(msg) => (
                                                    <div className="inputError">
                                                      <div className="arrow-up"></div>
                                                      <span>
                                                        <img
                                                          className="errorImage"
                                                          src={
                                                            "/images/images/error.jpeg"
                                                          }
                                                          alt="error image"
                                                          loading="lazy"
                                                        />
                                                      </span>{" "}
                                                      {msg}
                                                    </div>
                                                  )}
                                                </ErrorMessage>
                                              </div>
                                              <br />
                                            </>
                                          )}
                                          {index === array.length - 1 && (
                                            <div className="add-size-btn d-flex">
                                              <div
                                                className="btn-wrapper d-flex align-items-center justify-content-center"
                                                onClick={() =>
                                                  arrayHelpers.push(
                                                    getNewCustomSize()
                                                  )
                                                }
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  height="24"
                                                  width="24"
                                                  viewBox="0 -960 960 960"
                                                  fill="#32325d"
                                                >
                                                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                                                </svg>
                                                Add Another Custom Size
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                              {values?.sizes?.map((size: any, index: any) => {
                                if (size.custom) return "";
                                let thickness = size.thicknesses;
                                return (
                                  <div key={index}>
                                    <div className="checkbox-container">
                                      <input
                                        checked={size.isSelected}
                                        onChange={() => {
                                          setFieldValue(
                                            `sizes[${index}].isSelected`,
                                            !size.isSelected
                                          );
                                          calculatePrice();
                                        }}
                                        type="checkbox"
                                        onFocus={() =>
                                          pushDatalyer(
                                            "Foam Board Panels Printing",
                                            `${size.width}cmx${size.height}cm (
                                      ${size.width_in_inches}’’x
                                      ${size.height_in_inches}’’ inches)
                                      ${size.name
                                              ? "- " + size.name + " Size"
                                              : ""
                                            }`
                                          )
                                        }
                                        name={`sizes[${index}].isSelected`}
                                      />
                                      <label
                                        className="margin-left-15"
                                        htmlFor="img-bg-1"
                                      >
                                        <span style={{ fontWeight: 500 }}>
                                          {size.width}cmx{size.height}cm (
                                          {size.width_in_inches}’’x
                                          {size.height_in_inches}’’ inches){" "}
                                        </span>
                                        <span>
                                          {size.name
                                            ? "- " + size.name + " Size "
                                            : " "}
                                        </span>
                                        <FileUploadingStatus files={size.files} />
                                      </label>
                                      <br />
                                    </div>
                                    {size.isSelected && (
                                      <>
                                        <div className="custom-dropzone--container foam-board-upload-container">
                                          <ImageDropzone
                                            orderType="FOAM_BOARD"
                                            files={size.files}
                                            setFiles={(files: any) => {
                                              setFieldValue(
                                                `sizes[${index}].files`,
                                                files
                                              );
                                              setFieldTouched(
                                                `sizes[${index}].files`,
                                                true,
                                                true
                                              );
                                              calculatePrice();
                                            }}
                                            showCounters={true}
                                            showPrint={true}
                                            showThickness={true}
                                            thickness={thickness as any}
                                            zoom={true}
                                            {...getFoamBoardDropzoneProps(size, index)}
                                          />
                                          <UploadInfoLabel
                                            supportedTypes={IMAGE_PRINT_TYPES}
                                          />

                                          <ErrorMessage
                                            name={`sizes[${index}].files`}
                                          >
                                            {(msg) => (
                                              <div className="inputError">
                                                <div className="arrow-up"></div>
                                                <span>
                                                  <img
                                                    className="errorImage"
                                                    src={
                                                      "/images/images/error.jpeg"
                                                    }
                                                    alt="error image"
                                                    loading="lazy"
                                                  />
                                                </span>{" "}
                                                {getIn(errors, `sizes[${index}].files`)}
                                              </div>
                                            )}
                                          </ErrorMessage>
                                        </div>
                                        <br />
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </>
                      );
                    }}
                  />
                </div>
                <br />
                <div className="formControll">
                  <div className="formControll any-comments">
                    <label htmlFor="people">Any Comments</label>
                    <textarea
                      data-formControlName="comments"
                      typeof="textarea"
                      value={values.comments}
                      onFocus={() =>
                        pushDatalyer(
                          "Foam Board Panels Printing",
                          "Any Comments"
                        )
                      }
                      onChange={handleChange}
                      id="comments"
                      name="comments"
                    />
                  </div>
                  <label htmlFor="people">Price</label>
                  <input
                    readOnly
                    data-formControlName="price"
                    value={Number(price) + Number(deliveryCharges)}
                    type="number"
                    id="people"
                    name="people"
                  />
                  <div className="order-summary">
                    {values?.sizes?.map((size: any, index: any) => {
                      if (size.isSelected !== true) return "";
                      return (
                        <React.Fragment key={index}>
                          {renderSizePrice(size, index)}
                        </React.Fragment>
                      );
                    })}
                    {renderDeliveryCharges()}
                    <OrderTotalPrice
                      total={Number(price) + Number(deliveryCharges)}
                    />
                  </div>
                </div>
                {renderFileUploadSummary()}
              </div>

              <div id="form-container" className="formControll payment-form">
                {/* <div id="element-container"></div>
        <div id="error-handler" role="alert">{{errorElement.textContent}}</div>
        <div id="success" style=" display: none;;position: relative;float: left;">
            Success! Your token is <span id="token"></span>
        </div> */}
                <Checkout />
                {renderFileUploadProgress()}
                <div className="submit-button">
                  <button type="submit" id="tap-btn">
                    Submit
                  </button>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default FbpOrderForm;
