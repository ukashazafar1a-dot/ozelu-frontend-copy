"use client";
import React, { useRef, useState, useEffect } from "react";
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
import showCustomPopup from "@/components/NoSwal";
import { privacyOptions } from "@/utils";
import {
  checkFreeDelivery,
  generateUniqueKey,
  getDeliveryCharges,
  getValidFiles,
  hasValidFiles,
} from "@/helpers/generals";
import { DeliveryArea, PageData } from "@/libs/types";
import { RenderErrorMessage } from "@/components/RenderErrorMessage";
import {
  cityAreaLayer,
  fileUploading,
  formSubmission,
  pushDatalyer,
  pushDropdownLayer,
  pushOrderLayer,
  stripeStart,
} from "@/datalayers/CP";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadProgress from "@/components/FileUploadProgress";

const defaultSize = {
  id: generateUniqueKey(),
  isSelected: true,
  type: null,
  shape: null,
  width: 0,
  height: 0,
  diameter: 0,
  finishing: null,
  files: [],
};

type props = {
  data: PageData;
  areas: DeliveryArea[] | null;
};

const SppOrderForm = ({ data, areas }: props) => {
  const { tryCreateToken, stickersPrintingPrices, resetStripeElements, sessionId } = useApp();
  const formRef = useRef<any>();
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
  const [prices, setPrices] = useState<any>([]);
  const [a4SheetSize, setA4SheetSize] = useState<any>({
    width: 0,
    height: 0,
  });
  const [types, setTypes] = useState<any>([]);
  const [shapes, setShapes] = useState<any>([]);
  const [finishings, setFinishings] = useState<any>([]);

  const [initialValues, setInitialValues] = useState({
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
    sizes: [{ ...defaultSize }],
  });

  const resetForm = function () {
    formRef.current.resetForm();
    calculatePrice();
    resetStripeElements();
  };

  const isShapeCircle = function (shape: any) {
    if (!shape) return false;
    if (
      shape.toLowerCase().includes("round") ||
      shape.toLowerCase().includes("circle")
    )
      return true;
  };

  const ValidationSchema = Yup.object().shape({
    firstname: Yup.string().required("Please enter your first name"),
    lastname: Yup.string().required("Please enter your last name"),
    phone: Yup.string().required("Please enter your phone number"),
    address: Yup.string().required("Please enter your address"),
    area: Yup.string().required("Please select your area"),
    city: Yup.string().required("Please select a city"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Please enter your valid email address"),
    privacy: Yup.string().nullable().notRequired(),
    sizes: Yup.array().of(
      Yup.object().shape({
        files: Yup.array().required("Files are required"),
        // files: Yup.array().test(
        //   "fileSize",
        //   "File size must be less than 10MB",
        //   function (files: any, { parent }) {
        //     if (!files || files.length === 0) {
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
        // ),
        type: Yup.string().required("Sticker Type is required"),
        shape: Yup.string().required("Sticker Shape is required"),
        finishing: Yup.string().required("Finishing Type is required"),
        diameter: Yup.number().when("shape", {
          is: (shape: string) => isShapeCircle(shape),
          then: (schema) =>
            schema
              .required("Diameter is required")
              .min(1, "Diameter must be greater than 0")
              .max(
                Math.min(a4SheetSize.width, a4SheetSize.height),
                `Diameter must be less than or equal to ${Math.min(
                  a4SheetSize.width,
                  a4SheetSize.height
                )}mm`
              ),
          otherwise: (schema) => schema.notRequired(),
        }),

        width: Yup.number().when("shape", {
          is: (shape: string) => !isShapeCircle(shape),
          then: (schema) =>
            schema
              .required("Width is required")
              .min(1, "Width must be greater than 0")
              .max(
                a4SheetSize.width,
                `Width must be less than or equal to ${a4SheetSize.width}mm`
              ),
          otherwise: (schema) => schema.notRequired(),
        }),

        height: Yup.number().when("shape", {
          is: (shape: string) => !isShapeCircle(shape),
          then: (schema) =>
            schema
              .required("Height is required")
              .min(1, "Height must be greater than 0")
              .max(
                a4SheetSize.height,
                `Height must be less than or equal to ${a4SheetSize.height}mm`
              ),
          otherwise: (schema) => schema.notRequired(),
        }),
      })
    ),
  });

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    if (!formikValues) return {};
    return formikValues;
  };

  function getRectanglesPerSheet(stickerWidth: number, stickerHeight: number) {
    let fitByWidth = Math.floor(a4SheetSize.width / stickerWidth);
    let fitByHeight = Math.floor(a4SheetSize.height / stickerHeight);
    return fitByWidth * fitByHeight;
  }

  function getCirclesPerSheet(diameter: number) {
    let fitByWidth = Math.floor(a4SheetSize.width / diameter);
    let fitByHeight = Math.floor(a4SheetSize.height / diameter);
    return fitByWidth * fitByHeight; // Approximate without hexagonal packing
  }

  function calculateA4Sheets(size: any, totalStickers: number) {
    let totalSheets = 0;

    let { diameter, width, height, shape } = size; // Sticker dimensions
    if (!shape) return 0;
    let isCircle = isShapeCircle(shape);
    if (isCircle) {
      if (!diameter) return 0;
    } else {
      if (!width || !height) return 0;
    }

    let stickersPerSheet = isCircle
      ? getCirclesPerSheet(diameter)
      : getRectanglesPerSheet(width, height);

    totalSheets += Math.ceil(totalStickers / stickersPerSheet);

    return totalSheets;
  }

  function getSizeQuantity(size: any) {
    try {
      if (!size || !size?.files) return { totalStickers: 0, totalSheets: 0 };
      const validFiles = getValidFiles(size.files);
      let copies = validFiles?.map((item: any) => parseInt(item.count));
      let totalQuantity = _.sum(copies);
      let totalSheets = calculateA4Sheets(size, totalQuantity);
      return { totalStickers: totalQuantity, totalSheets };
    } catch (error) {
      console.error(error);
      return { totalStickers: 0, totalSheets: 0 };
    }
  }

  function getSizePriceAndDiscounts(data: any[], type: string, shape: string) {
    // Find the type object
    const typeObj = data.find((item) => item.type === type);
    if (!typeObj) return { price: 0, discounts: [] };

    // Find the shape object inside the selected type
    const shapeObj = typeObj.shapes.find((s: any) => s.value === shape);
    if (!shapeObj) return { price: 0, discounts: [] };

    // Return the discounts array
    const discounts = shapeObj.discounts || [];
    const price = shapeObj.price || 0;
    return { discounts, price };
  }

  function getSizeDiscountedPrice(size: any) {
    const { price, discounts } = getSizePriceAndDiscounts(
      prices,
      size.type,
      size.shape
    );
    if (price == 0) return { compare_at_price: 0, price: null };
    try {
      if (!size || !prices || prices.length == 0)
        return { compare_at_price: 0, price: null }; // Ensure product is valid
      const { totalStickers, totalSheets } = getSizeQuantity(size);
      if (totalSheets === 0) return { compare_at_price: 0, price: null };
      let applicableDiscount: any = null;

      discounts?.forEach((discount: any) => {
        if (matchesRange(discount.range, totalSheets)) {
          if (
            !applicableDiscount ||
            discount.percentage > applicableDiscount.percentage
          ) {
            applicableDiscount = discount;
          }
        }
      });

      if (applicableDiscount) {
        const discountedPrice =
          price - price * (applicableDiscount.percentage / 100);
        return {
          compare_at_price: price,
          price: parseFloat(discountedPrice.toFixed(2)),
        };
      }

      // Return normal price if no discount applies
      return { compare_at_price: price, price: null };
    } catch (error) {
      console.error(error);
      return { compare_at_price: 0, price: null };
    }
  }

  function getFinishingPrice(size: any) {
    const { finishing } = size;
    if (!finishing) return 0;
    let type = finishings.find((item: any) => item.value == finishing);
    if (!type || !type?.price) return 0;
    return type.price;
  }

  function matchesRange(range: any, quantity: any) {
    if (/^>=\d+$/.test(range)) {
      return quantity >= parseInt(range.slice(2));
    } else if (/^<=\d+$/.test(range)) {
      return quantity <= parseInt(range.slice(2));
    } else if (/^\d+-\d+$/.test(range)) {
      let [min, max] = range.split("-").map(Number);
      return quantity >= min && quantity <= max;
    } else if (/^>\d+$/.test(range)) {
      return quantity > parseInt(range.slice(1));
    } else if (/^<\d+$/.test(range)) {
      return quantity < parseInt(range.slice(1));
    } else if (/^\d+$/.test(range)) {
      return quantity === parseInt(range);
    }
    return false; // If the format doesn't match
  }

  function calculatePrice() {
    setTimeout(() => {
      setPrice(0);
      setOrderValue(0);
      let newOrderValue = 0;
      let newDeliveryCharges = 0;
      const values = getFormikValues();
      if (!values) return;
      const { sizes, area } = values;

      sizes.forEach((size: any) => {
        // Skip only when explicitly deselected (undefined/true = include; matches breakdown)
        if (size.isSelected === false) return;
        let { price, compare_at_price } = getSizeDiscountedPrice(size);
        let { totalSheets } = getSizeQuantity(size);
        let finishingPrice = getFinishingPrice(size);
        let value =
          newOrderValue +
          totalSheets * (price ? price : compare_at_price) +
          totalSheets * finishingPrice;
        value = parseFloat(value.toFixed(2));
        newOrderValue = value;
      });

      if (newOrderValue < data?.min_price) {
        newOrderValue = data?.min_price ? data?.min_price : 0;
      }
      setOrderValue(newOrderValue);
      setPrice(newOrderValue);

      if (checkFreeDelivery(newOrderValue, freeDeliveryThreshold)) {
        newDeliveryCharges = 0;
      } else {
        newDeliveryCharges = getDeliveryCharges(
          stickersPrintingPrices,
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
    formSubmission("Stickers Printing", "form_submission_attempt");
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
      formSubmission("Stickers Printing", "form_submission_error", {
        title: "Validation Error",
        text: "Please upload picture!",
      });
      return;
    }

    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart("Stickers Printing");
      if (token === undefined || token === "") {
        console.log("Error while getting token");
        formSubmission("Stickers Printing", "form_submission_error", {
          text: "Error while getting token",
        });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        sizes &&
          sizes?.forEach((size: any) => {

            const validFiles = getValidFiles(size.files);
            const name = isShapeCircle(size.shape)
              ? `${size.diameter}mm (${size.diameter / 10}cm)`
              : `${size.width}mmX${size.height}mm (${size.width / 10}cmx${size.height / 10
              }cm)`;
            validFiles.forEach((file: any) => {
              const extension = file.name.split(".").pop();
              const filename = `${file.name
                .split(".")
                .slice(0, -1)
                .join(".")}_${name}_${file?.print}(${file.count}).${extension}`;
              filesMetaData.push({
                filename,
                url: file.url,
                key: file.key,
                count: file.count,
                size: name,
                dimension: file?.print,
              });
            });
            const { totalSheets, totalStickers } = getSizeQuantity(size);
            const { price, compare_at_price } = getSizeDiscountedPrice(size);
            let totalPrice = totalSheets * (price ? price : compare_at_price);
            sizesMetaData.push({
              size: name,
              type: size.type,
              shape: size.shape,
              finishing: size.finishing,
              finishingPrice: getFinishingPrice(size),
              totalStickers,
              totalSheets,
              unitPrice: price ? price : compare_at_price,
              price: totalPrice,
              compare_at_price: price ? compare_at_price : 0,
            });
          });
        fileUploading("Stickers Printing", filesMetaData, "started");
        formData.append("order_type", "sticker_print");
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
          String(getDeliveryCharges(stickersPrintingPrices, area, areas))
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
              process.env.NEXT_PUBLIC_API_URL +
              "/api/createOrder",
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
          fileUploading("Stickers Printing", filesMetaData, "completed");
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
                pushOrderLayer("Stickers Printing", object);
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
                formSubmission("Stickers Printing", "form_submission_error", {
                  title: "Oops...",
                  text:
                    response?.data?.message ||
                    "Failed to collect your payment.",
                });
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
              formSubmission("Stickers Printing", "form_submission_error", {
                title: "Oops...",
                text:
                  err?.response?.data?.message ||
                  "Failed to collect your payment.",
              });
            });
        } catch (error: any) {
          setShowLoading(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on contact@example.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
              }`,
            showLoaderOnConfirm: false,
            showLoaderOnDeny: false,
            loaderHtml: `<div></div>`,
          });
          formSubmission("Stickers Printing", "form_submission_error", {
            title: "Oops...",
            text: `${error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on contact@example.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
              }`,
          });
        }
      }
    });
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer("Stickers Printing", type, value);
    if (type === "city") {
      formRef.current.setFieldValue("area", "");
      //console.log(value)
      const filteredAreas = areas?.filter((area: any) => area?.city === value);
      const sortedAreas = filteredAreas?.sort((a: any, b: any) => {
        if (a?.name < b?.name) {
          return -1;
        }
        if (a?.name > b?.name) {
          return 1;
        }
        return 0;
      });
      const options = sortedAreas?.map((area: any) => ({
        value: area?.name,
        label: area?.name,
      }));
      setAreaOptions(options);
    }
    formRef.current.setFieldValue(type, value);
    await Promise.resolve();
    calculatePrice();
  }

  function renderSizePrice(size: any) {
    const { price, compare_at_price } = getSizeDiscountedPrice(size);
    const { totalStickers, totalSheets } = getSizeQuantity(size);
    //console.log(size)
    let sizeLabel = isShapeCircle(size?.shape) ? (
      <>
        Ø {size.diameter} mm (Ø {size.diameter / 10} cm)
      </>
    ) : (
      <>
        {size.width}mm X {size.height}mm (
        {parseFloat((size.width / 10).toFixed(2))}cm X{" "}
        {parseFloat((size.height / 10).toFixed(2))}cm)
      </>
    );
    return (
      <>
        {sizeLabel} {size?.type} - {size?.shape}: {totalSheets} Sheets (
        {totalStickers} Stickers) x {price ? price : compare_at_price} AED ={" "}
        {price ? (
          <>
            <span
              className="text-muted"
              style={{ textDecoration: "line-through" }}
            >
              {compare_at_price * totalSheets}
              {" AED"}
            </span>{" "}
            {parseFloat(price.toFixed(2)) * totalSheets}
            {" AED"}
          </>
        ) : (
          compare_at_price * totalSheets + " AED"
        )}
      </>
    );
  }

  function renderSizeFinishingPrice(size: any) {
    const finishingPrice = getFinishingPrice(size);
    if (finishingPrice == 0) return "";
    const { totalStickers, totalSheets } = getSizeQuantity(size);
    //console.log(size);
    let sizeLabel = isShapeCircle(size?.shape) ? (
      <>
        Ø {size.diameter} mm (Ø {size.diameter / 10} cm)
      </>
    ) : (
      <>
        {size.width}mm X {size.height}mm (
        {parseFloat((size.width / 10).toFixed(2))}cm X{" "}
        {parseFloat((size.height / 10).toFixed(2))}cm)
      </>
    );
    return (
      <>
        {sizeLabel} {size?.finishing}: {totalSheets} Sheets ({totalStickers}{" "}
        Stickers) x {finishingPrice} AED = {finishingPrice * totalSheets}
        {" AED"}
      </>
    );
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(stickersPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles() {
    const { sizes } = getFormikValues();
    const files = (sizes || [])
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
    const sortedAreas = areas?.sort((a: any, b: any) => {
      if (a?.name < b?.name) {
        return -1;
      }
      if (a?.name > b?.name) {
        return 1;
      }
      return 0;
    });
    let options: any = sortedAreas?.map((area: any) => {
      return { value: area.name, label: area.name };
    });
    setAreaOptions(options);
  }, [areas]);

  useEffect(() => {
    //console.log("SIzes", data?.sizes);
    setPrice(data?.min_price ? data?.min_price : 0);
    if (data?.stickers_prices && data.stickers_prices.length > 0) {
      setPrices(data.stickers_prices);
      let types = data.stickers_prices.map((price) => price.type);
      setTypes(types);
      if (
        data.stickers_prices[0].shapes &&
        data.stickers_prices[0].shapes.length > 0
      ) {
        let shapes = data.stickers_prices[0].shapes.map((shape) => shape.value);
        setShapes(shapes);
      }
    }
    if (
      data?.stickers_a4_sheet_size &&
      data.stickers_a4_sheet_size?.width &&
      data.stickers_a4_sheet_size?.height
    ) {
      setA4SheetSize({
        width: data.stickers_a4_sheet_size.width,
        height: data.stickers_a4_sheet_size.height,
      });
    }
    if (
      data?.stickers_finishing_types &&
      data.stickers_finishing_types.length > 0
    ) {
      setFinishings(data.stickers_finishing_types);
      formRef.current.setFieldValue(
        "sizes[0].finishing",
        data.stickers_finishing_types[0].value
      );
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
      //console.log(firstCity)
      areas.forEach((area) => {
        if (area?.city === firstCity?.value) {
          allAreas.push({ value: area?.name, label: area?.name });
        }
      });
      formRef.current.setFieldValue("city", firstCity?.value);
      const sortedAreas = allAreas?.sort((a: any, b: any) => {
        if (a?.name < b?.name) {
          return -1;
        }
        if (a?.name > b?.name) {
          return 1;
        }
        return 0;
      });
      //console.log(">>>>",sortedAreas,optionsTwo)
      setAreaOptions(sortedAreas);
      setCityOptions(optionsTwo);
    }
  }, []);

  //console.log("Data", data);

  return (
    <div
      className="photo-printing-form--wrapper order-form--wrapper"
      id="orderForm"
    >
      {showLoading && <LoadingProgress loaded={percentageUploaded} />}
      <Formik
        innerRef={formRef}
        initialValues={initialValues}
        validationSchema={ValidationSchema}
        validate={(values) => {
          calculatePrice();
        }}
        onSubmit={(values, errors) => {
          //console.log(values)
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
                    let isFilesError = false;
                    values.sizes.forEach((size: any, index: any) => {
                      if (getIn(errors, `sizes[${index}].files`)) {
                        isFilesError = true;
                      }
                    });
                    Swal.fire({
                      icon: "error",
                      title: "Validation Error",
                      text: `Please fill all fields!`,
                      showLoaderOnConfirm: false,
                      showLoaderOnDeny: false,
                      loaderHtml: `<div></div>`,
                    });
                    formSubmission(
                      "Stickers Printing",
                      "form_submission_error",
                      {
                        title: "Validation Error",
                        text: `Please fill all fields!`,
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
              <CheckoutActivityFormTracker orderType="STICKER_PRINT" />
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
                        pushDatalyer("Stickers Printing", "First Name")
                      }
                      placeholder="Please Write Your First Name"
                      name="firstname"
                      id="firstname"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`firstname`}
                    />
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
                        pushDatalyer("Stickers Printing", "Last Name")
                      }
                      placeholder="Please Write Your Last Name"
                      name="lastname"
                      id="lastname"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`lastname`}
                    />
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
                      onFocus={() => pushDatalyer("Stickers Printing", "Email")}
                      placeholder="Please Write Your Email"
                      name="email"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`email`}
                    />
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
                        pushDatalyer("Stickers Printing", "Phone Number")
                      }
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`phone`}
                    />
                  </div>
                  <div className="formControll">
                    <label htmlFor="city">City</label>
                    <SearchableSelect
                      value={values.city}
                      type="city"
                      onChangeHandler={setValueCalculatePrice}
                      options={cityOptions}
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`city`}
                    />
                  </div>
                  <div className="formControll">
                    <label htmlFor="area">Area</label>
                    <SearchableSelect
                      value={values.area}
                      type="area"
                      onChangeHandler={setValueCalculatePrice}
                      options={areaOptions}
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`area`}
                    />
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
                        pushDatalyer("Stickers Printing", "Address")
                      }
                      id="address"
                      name="address"
                      placeholder="Please Write Your Address"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`address`}
                    />
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
                          "Stickers Printing",
                          "Privacy Preference",
                          e.target?.value
                        );
                      }}
                      onFocus={() =>
                        pushDatalyer("Stickers Printing", "Privacy Preference")
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
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`privacy`}
                    />
                  </div>
                </div>

                {/* Here started the new sticker printing form  */}

                <div className="formControll mt-2">
                  <FieldArray
                    name="sizes"
                    render={(arrayHelpers) => {
                      return (
                        <>
                          {values.sizes && values.sizes.length > 0 && (
                            <>
                              {values.sizes.map(
                                (size: any, index: any, array: any) => {
                                  return (
                                    <div
                                      className="custom-sizes-container"
                                      key={size.id}
                                    >
                                      {/* add this css for grid  custom-sizes-form */}
                                      <div className="formContainer">
                                        {values.sizes.length > 1 && (
                                          <>
                                            <div></div>
                                            <div className="d-flex w-full align-items-end justify-content-end">
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
                                          </>
                                        )}
                                        <div className="formControll">
                                          <label
                                            htmlFor="stickerType"
                                            className="order-option-label"
                                          >
                                            Sticker Type
                                          </label>
                                          <Field
                                            as="select"
                                            id="stickerType"
                                            name={`sizes[${index}].type`}
                                            className="selectOptionsCustom new-custom-field-rf"
                                          >
                                            <option
                                              value=""
                                              label="Choose Your Sticker Type"
                                              selected
                                              disabled
                                            />
                                            {types.length > 0 &&
                                              types.map((type: any) => (
                                                <option key={type} value={type}>
                                                  {type}
                                                </option>
                                              ))}
                                          </Field>
                                          <RenderErrorMessage
                                            errors={errors}
                                            touches={touched}
                                            name={`sizes[${index}].type`}
                                          />
                                        </div>
                                        <div className="formControll">
                                          <label
                                            htmlFor="stickerShape"
                                            className="order-option-label"
                                          >
                                            Sticker Shape
                                          </label>
                                          <Field
                                            as="select"
                                            id="stickerShape"
                                            name={`sizes[${index}].shape`}
                                            className="selectOptionsCustom new-custom-field-rf"
                                          >
                                            <option
                                              value=""
                                              label="Choose Your Sticker Type"
                                              selected
                                              disabled
                                            />
                                            {shapes.length > 0 &&
                                              shapes.map((shape: any) => (
                                                <option
                                                  key={shape}
                                                  value={shape}
                                                >
                                                  {shape}
                                                </option>
                                              ))}
                                          </Field>
                                          <RenderErrorMessage
                                            errors={errors}
                                            touches={touched}
                                            name={`sizes[${index}].shape`}
                                          />
                                        </div>
                                      </div>
                                      <div className="formControll mt-3 mb-1">
                                        <label
                                          className="single-label p-0 m-0 order-option-label"
                                          style={{ fontSize: "1.2rem" }}
                                        >
                                          Size
                                        </label>
                                      </div>
                                      <div className="formContainer">
                                        {isShapeCircle(size?.shape) ? (
                                          <div className="formControll">
                                            <label
                                              htmlFor="width"
                                              className="order-option-label"
                                            >
                                              Diameter (mm)
                                            </label>
                                            <Field
                                              type="number"
                                              min={"0"}
                                              max={Math.min(
                                                a4SheetSize.width,
                                                a4SheetSize.height
                                              )}
                                              step={"0.01"}
                                              id="diameter"
                                              name={`sizes[${index}].diameter`}
                                              value={size.diameter === 0 ? "" : size.diameter}
                                              className="selectOptionsCustom new-custom-field-rf input-hidden-arrows"
                                            />
                                            <RenderErrorMessage
                                              errors={errors}
                                              touches={touched}
                                              name={`sizes[${index}].diameter`}
                                            />
                                          </div>
                                        ) : (
                                          <>
                                            <div className="formControll">
                                              <label
                                                htmlFor="width"
                                                className="order-option-label"
                                              >
                                                Width (mm)
                                              </label>
                                              <Field
                                                type="number"
                                                min={"0"}
                                                max={a4SheetSize.width}
                                                step={"0.01"}
                                                id="width"
                                                name={`sizes[${index}].width`}
                                              value={size.width === 0 ? "" : size.width}
                                                className="selectOptionsCustom new-custom-field-rf input-hidden-arrows"
                                              />
                                              <RenderErrorMessage
                                                errors={errors}
                                                touches={touched}
                                                name={`sizes[${index}].width`}
                                              />
                                            </div>
                                            <div className="formControll">
                                              <label
                                                htmlFor="height"
                                                className="order-option-label"
                                              >
                                                Height (mm)
                                              </label>
                                              <Field
                                                type="number"
                                                min={"0"}
                                                max={a4SheetSize.height}
                                                step={"0.01"}
                                                id="height"
                                                name={`sizes[${index}].height`}
                                              value={size.height === 0 ? "" : size.height}
                                                className="selectOptionsCustom new-custom-field-rf input-hidden-arrows"
                                              />
                                              <RenderErrorMessage
                                                errors={errors}
                                                touches={touched}
                                                name={`sizes[${index}].height`}
                                              />
                                            </div>
                                          </>
                                        )}
                                      </div>
                                      <div className="formContainer">
                                        <div className="formControll">
                                          <label
                                            htmlFor="finishingType"
                                            className="order-option-label"
                                          >
                                            Finishing Type - Optional
                                          </label>
                                          <Field
                                            as="select"
                                            id="finishingType"
                                            name={`sizes[${index}].finishing`}
                                            className="selectOptionsCustom new-custom-field-rf"
                                          >
                                            <option
                                              value=""
                                              label="Choose Your Finishing Type"
                                              selected
                                              disabled
                                            />
                                            {finishings.length > 0 &&
                                              finishings.map(
                                                (finishing: any) => (
                                                  <option
                                                    key={finishing.value}
                                                    value={finishing.value}
                                                  >
                                                    {finishing.value}
                                                  </option>
                                                )
                                              )}
                                          </Field>
                                          <RenderErrorMessage
                                            errors={errors}
                                            touches={touched}
                                            name={`sizes[${index}].finishing`}
                                          />
                                        </div>
                                      </div>
                                      <div className="custom-dropzone--container formControll upload-zone-after-fields">
                                        <label style={{ margin: 0 }}>
                                          <FileUploadingStatus files={size.files} />
                                        </label>
                                        <ImageDropzone
                                          orderType="STICKER_PRINT"
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
                                          zoom={true}
                                        />
                                        <UploadInfoLabel
                                          supportedTypes={IMAGE_PRINT_TYPES}
                                        />

                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].files`}
                                        />
                                        <ErrorMessage name={`files`}>
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
                                              Per file size should not exceed
                                              10MB, please use an online tool to
                                              compress the photos greater than
                                              10MB and re-upload
                                            </div>
                                          )}
                                        </ErrorMessage>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </>
                          )}
                          <div className="formControll mt-3 mb-1">
                            <button
                              className="btn--primary-new "
                              type="button"
                              style={{
                                width: "fit-content",
                              }}
                              onClick={() =>
                                arrayHelpers.push({
                                  ...defaultSize,
                                  id: generateUniqueKey(),
                                })
                              }
                            >
                              Add Another Sticker Print
                            </button>
                          </div>
                        </>
                      );
                    }}
                  />
                </div>

                {/* Here ended the sticker printing form fields */}

                <div className="formControll mt-1">
                  <div className="formControll any-comments">
                    <label htmlFor="people">Any Comments</label>
                    <textarea
                      data-formControlName="comments"
                      typeof="textarea"
                      value={values.comments}
                      onFocus={() =>
                        pushDatalyer("Stickers Printing", "Any Comments")
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
                    value={price + deliveryCharges}
                    type="number"
                    id="people"
                    name="people"
                  />
                  <div className="order-summary">
                    {values?.sizes?.map((size: any, index: any) => {
                      return (
                        <div key={index}>
                          <p>{renderSizePrice(size)}</p>
                          <p>{renderSizeFinishingPrice(size)}</p>
                        </div>
                      );
                    })}
                    {renderDeliveryCharges()}
                    <OrderTotalPrice total={price + deliveryCharges} />
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

export default SppOrderForm;
