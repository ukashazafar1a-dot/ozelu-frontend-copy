"use client";
import React, { useRef, useState, useEffect } from "react";
import { Field, Formik, FieldArray, ErrorMessage } from "formik";
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
  convertLength,
  getClosestSize,
  getSizesMaxDimenstions,
  getMaxSize,
  generateUniqueKey,
  checkFreeDelivery,
  getDeliveryCharges,
  handleizeId,
  getValidFiles,
  hasValidFiles,
} from "@/helpers/generals";
import {
  pushDatalyer,
  cityAreaLayer,
  pushDropdownLayer,
  stripeStart,
  fileUploading,
  formSubmission,
  pushOrderLayer,
} from "@/datalayers/CP";
import { DeliveryArea, PageData } from "@/libs/types";
import { sortArrayAlphabetically } from "@/libs/utils";
import TypeCard from "./TypeCard";
import { RenderErrorMessage } from "@/components/RenderErrorMessage";
import InfoTooltip from "@/components/InfoTooltip";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadProgress from "@/components/FileUploadProgress";

/**
 * Max allowed for one custom side when the other side is already set.
 * Uses the largest preset sheet and allows rotation (same idea as getClosestSize).
 */
function getCanvasCustomSideMax(
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

type props = {
  data: PageData;
  areas: DeliveryArea[] | null;
};

const defaultSize = {
  id: generateUniqueKey(),
  isSelected: true,
  width: 0,
  height: 0,
  type: "",
  printExtension: "printExactSize",
  thickness: "",
  design: "",
  frame: "",
  framingType: "",
  files: [],
};

const CanvasOrderForm = ({ data, areas }: props) => {
  const { tryCreateToken, canvasPrintingPrices, resetStripeElements,sessionId } = useApp();
  const formRef = useRef<any>();
  /** Avoids validate → setState → re-render → validate infinite loops (tab freeze / "Page Unresponsive"). */
  const lastPriceTotalsRef = useRef<{
    order: number;
    delivery: number;
  } | null>(null);
  const lastPricingSnapshotRef = useRef<string>("");
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
  const [prices, setPrices] = useState<any>([]);
  const [framePrices, setFramePrices] = useState<any>([]);
  const [sizes, setSizes] = useState<any>([]);
  const [types, setTypes] = useState<any>([]);
  const [designs, setDesigns] = useState<any>([]);
  const [thicknesses, setThicknesses] = useState<any>([]);
  const [frames, setFrames] = useState<any>([]);
  const [framingTypes, setFramingTypes] = useState<any[]>([]);

  const initialValues = {
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
  };

  const resetForm = function () {
    formRef.current.resetForm();
    calculatePrice();
    resetStripeElements();
  };

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    if (!formikValues) return {};
    return formikValues;
  };

  function getSizeQuantity(size: any) {
    try {
      if (!size || !size?.files) return 0;
      const validFiles = getValidFiles(size.files);
      let copies = validFiles.map((item: any) => parseInt(item.count));
      let totalQuantity = _.sum(copies);
      return totalQuantity;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  /**
   * Single source of truth for subtotal + delivery. Uses the Formik snapshot passed in
   * (from validate / callbacks) so totals match the visible line items — avoids stale
   * getFormikValues() inside setTimeout racing behind the rendered breakdown.
   */
  function applyPriceTotals(sizesIn: any[] | undefined, areaIn: any) {
    const sizesList = Array.isArray(sizesIn) ? sizesIn : [];
    let newOrderValue = 0;
    sizesList.forEach((size: any) => {
      if (size?.isSelected === false) return;
      const unit = Number(getClosestSizePrice(size)) || 0;
      const frameUnit = Number(getClosestSizeFramePrice(size)) || 0;
      const qty = getSizeQuantity(size);
      newOrderValue = parseFloat(
        (newOrderValue + qty * unit + qty * frameUnit).toFixed(2)
      );
    });

    const minP = Number(data?.min_price) || 0;
    if (newOrderValue < minP) {
      newOrderValue = minP;
    }

    const newDeliveryCharges = checkFreeDelivery(
      newOrderValue,
      freeDeliveryThreshold
    )
      ? 0
      : getDeliveryCharges(canvasPrintingPrices, areaIn, areas);

    const prev = lastPriceTotalsRef.current;
    if (
      prev !== null &&
      Math.abs(prev.order - newOrderValue) < 0.005 &&
      Math.abs(prev.delivery - newDeliveryCharges) < 0.005
    ) {
      return;
    }
    lastPriceTotalsRef.current = {
      order: newOrderValue,
      delivery: newDeliveryCharges,
    };
    setOrderValue(newOrderValue);
    setPrice(newOrderValue);
    setDeliveryCharges(newDeliveryCharges);
  }

  function calculatePriceFromValues(formValues: { sizes?: any[]; area?: any }) {
    if (!formValues) return;
    applyPriceTotals(formValues.sizes, formValues.area);
  }

  function calculatePrice() {
    const v = getFormikValues();
    applyPriceTotals(v?.sizes, v?.area);
  }

  function onSubmit() {
    if (!data?.isActive) {
      //console.log(data)
      showCustomPopup(data?.alert_message);
      return;
    }
    formSubmission("Canvas Printing", "form_submission_attempt");
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
      formSubmission("Canvas Printing", "form_submission_error", {
        title: "Validation Error",
        text: "Please upload picture!",
      });
      return;
    }

    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart("Canvas Printing");
      if (token === undefined || token === "") {
        console.log("Error while getting token");
        formSubmission("Canvas Printing", "form_submission_error", {
          error: "Error while getting token",
        });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        sizes &&
          sizes?.forEach((size: any, index: any) => {
            const quantity = getSizeQuantity(size);
            const selectedType = types.find((t: any) => t._id === size?.type);
            const selectedThickness = thicknesses.find(
              (t: any) => t._id === size?.thickness
            );
            const selectedFrame = frames.find(
              (f: any) => f._id === size?.frame
            );
            const selectedDesign = designs.find(
              (d: any) => d._id === size?.design
            );
            const selectedFraming = framingTypes.find(
              (f: any) => f._id === size?.framingType
            );

            const name = `${size.width}cmX${size.height}cm (${convertLength(
              size.width,
              "cm"
            )}inchesx${convertLength(size.height, "cm")}inches)`;
            const id = handleizeId({
              index,
              size: name,
              type: selectedType?.name,
              thickness: selectedThickness?.value,
              frame: selectedFrame?.name,
              design: selectedDesign?.name,
            });

            const validFiles = getValidFiles(size.files);

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
                id,
                count: file.count,
                size: name,
                dimension: file?.print,
              });
            });

            sizesMetaData.push({
              id,
              size: name,
              type: selectedType?.name ? selectedType.name : null,
              thickness: selectedThickness?.value
                ? selectedThickness.value
                : null,
              frame: selectedFrame?.name ? selectedFrame.name : null,
              design: selectedDesign?.name ? selectedDesign.name : null,
              framingType: selectedFraming?.name
                ? selectedFraming.name
                : null,
              printExtension: size?.printExtension ? size.printExtension : null,
              quantity,
              price: getClosestSizePrice(size),
              framePrice: size.frame ? getClosestSizeFramePrice(size) : 0,
            });
          });
        // Recompute the final charge amount from the just-built sizesMetaData
        // (unit price + frame price per size × quantity) instead of reading the
        // `price` / `deliveryCharges` React state. The state values can lag a frame /
        // type / thickness selection by one microtask (Formik validate → snapshot →
        // queueMicrotask → setPrice) and on slow phones / cached bundles this race
        // caused the customer to be charged the canvas-only subtotal while the UI
        // and the saved order details already showed the frame. The numbers below
        // are the exact same per-line values we are also POSTing in sizesData, so
        // the Stripe amount can never diverge from what the customer sees.
        const submitSubtotalRaw = sizesMetaData.reduce(
          (acc: number, s: any) => {
            const qty = Number(s?.quantity) || 0;
            const unit = Number(s?.price) || 0;
            const frameUnit = Number(s?.framePrice) || 0;
            return acc + qty * unit + qty * frameUnit;
          },
          0
        );
        const submitMinPrice = Number(data?.min_price) || 0;
        const submitSubtotal = parseFloat(
          Math.max(submitSubtotalRaw, submitMinPrice).toFixed(2)
        );
        const submitIsFreeDelivery = checkFreeDelivery(
          submitSubtotal,
          freeDeliveryThreshold
        );
        const submitAreaDeliveryRaw =
          Number(getDeliveryCharges(canvasPrintingPrices, area, areas)) || 0;
        const submitEffectiveDelivery = submitIsFreeDelivery
          ? 0
          : submitAreaDeliveryRaw;
        const submitTotal = parseFloat(
          (submitSubtotal + submitEffectiveDelivery).toFixed(2)
        );

        fileUploading("Canvas Printing", filesMetaData, "started");
        formData.append("order_type","canvas_print");
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
        formData.append("price", submitTotal.toFixed(2));
        console.log("Price", submitTotal, "(state price was", price, ")");
        formData.append("token", token.id);
        if (sessionId) formData.append("session_id", sessionId);
        formData.append(
          "delivery_charges",
          String(submitAreaDeliveryRaw)
        );
        formData.append(
          "free_delivery",
          String(submitIsFreeDelivery)
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
          fileUploading("Canvas Printing", filesMetaData, "completed");
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
                //console.log(object)
                pushOrderLayer("Canvas Printing",object);
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
                formSubmission("Canvas Printing", "form_submission_error", {
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
              formSubmission("Canvas Printing", "form_submission_error", {
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
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on contact@example.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
            }`,
            showLoaderOnConfirm: false,
            showLoaderOnDeny: false,
            loaderHtml: `<div></div>`,
          });
          formSubmission("Canvas Printing", "form_submission_error", {
            title: "Oops...",
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on contact@example.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
            }`,
          });
        }
      }
    });
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer("Canvas Printing", type, value);
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
    queueMicrotask(() => calculatePrice());
  }

  function handleSizeChange(index: any, field: any, value: any) {
    const maxValues = getSizesMaxDimenstions(sizes);
    const { sizes: formSizes } = getFormikValues();
    const current = formSizes?.[index] || {};
    const numericValue = Number(value);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

    if (field === "width") {
      const otherHeight = Number(current.height) || 0;
      const maxAllowed = getCanvasCustomSideMax(
        "width",
        otherHeight,
        maxValues.maxWidth,
        maxValues.maxHeight,
      );
      const nextWidth = safeValue > maxAllowed ? maxAllowed : safeValue;
      formRef?.current.setFieldValue("sizes[" + index + "].width", nextWidth);
    } else {
      const otherWidth = Number(current.width) || 0;
      const maxAllowed = getCanvasCustomSideMax(
        "height",
        otherWidth,
        maxValues.maxWidth,
        maxValues.maxHeight,
      );
      const nextHeight = safeValue > maxAllowed ? maxAllowed : safeValue;
      formRef?.current.setFieldValue("sizes[" + index + "].height", nextHeight);
    }

    setTimeout(() => {
      const { sizes: updatedSizes } = getFormikValues();
      let size = updatedSizes[index];
      let closestSize = getClosestSize(updatedSizes, size.width, size.height);
      if (closestSize) {
        formRef?.current.setFieldValue(
          "sizes[" + index + "].price",
          closestSize.price
        );
        formRef?.current.setFieldValue(
          "sizes[" + index + "].discounts",
          closestSize.discounts
        );
      }
      setTimeout(() => {
        calculatePrice();
      }, 1000);
    }, 1000);
  }

  async function handlePrivacyChange(e: any) {
    formRef.current.handleChange(e?.target?.name, e.target?.value);
  }

  function checkTypeThickness(id: any) {
    if (!types) return false;
    const selectedType = types.find((t: any) => t._id === id);
    if (!selectedType) return false;
    if (selectedType.hasThickness) return true;
  }

  function checkTypeFrame(id: any) {
    if (!types) return false;
    const selectedType = types.find((t: any) => t._id === id);
    if (!selectedType) return false;
    if (selectedType.hasFrame) return true;
  }

  function checkTypeEdge(id: any,printExtension: any) {
    if (!types) return false;
    const selectedType = types.find((t: any) => t._id === id);
    if (!selectedType) return false;
    if (selectedType.name === "Rolled Canvas" && printExtension === 'printExactSize') return false;
    return true;
  }

  function handleTypeChange(value: any, type: any, index: any) {
    formRef.current.setFieldValue(`sizes[${index}].type`, value);
    formRef.current.setFieldValue(`sizes[${index}].design`, "");
    if (!isFramedStretchedCanvas(value)) {
      formRef.current.setFieldValue(`sizes[${index}].framingType`, "");
    }
    if (!type.hasFrame)
      formRef.current.setFieldValue(`sizes[${index}].frame`, null);
    if (!type.hasThickness){
      formRef.current.setFieldValue(`sizes[${index}].thickness`, null);
      formRef.current.setFieldValue(`sizes[${index}].printExtension`, 'printExactSize');
    }else{
      formRef.current.setFieldValue(`sizes[${index}].printExtension`, null);
    }
  }

  function getClosestSizePrice(size: any) {
    const closestSize = getClosestSize(sizes, size.width, size.height);
    if (!closestSize) return 0;
    const price = prices.find(
      (p: any) =>
        p.size._id === closestSize._id &&
        (p.type?._id === size.type ||
          (p.type === null && size.type === null)) &&
        (p.thickness?._id === size.thickness ||
          (p.thickness === null && size.thickness === null))
    );
    if (!price) return 0;
    return price.price;
  }

  function getCanvasType(type: any) {
    if (!type) return "";
    const item = types?.find((t: any) => t._id === type);
    if (!item) return "";
    return String(item.name).replace(/strechted/gi, "Stretched");
  }

  function isFramedStretchedCanvas(typeId: any) {
    if (!typeId) return false;
    const t = types?.find((x: any) => x._id === typeId);
    if (!t?.name) return false;
    const n = String(t.name)
      .replace(/strechted/gi, "stretched")
      .trim()
      .toLowerCase();
    return n === "framed stretched canvas";
  }

  function getPricingSnapshotKey(formValues: { sizes?: any[]; area?: any }) {
    const sizesList = Array.isArray(formValues?.sizes) ? formValues.sizes : [];
    const compact = sizesList.map((s: any) => ({
      isSelected: s?.isSelected !== false,
      width: Number(s?.width) || 0,
      height: Number(s?.height) || 0,
      type: s?.type || "",
      thickness: s?.thickness || "",
      frame: s?.frame || "",
      count: getSizeQuantity(s),
    }));
    return JSON.stringify({
      area: formValues?.area || "",
      sizes: compact,
    });
  }

  /** Price breakdown only; uses same rules as thickness UI. */
  function getCanvasThicknessPriceLabel(size: any) {
    if (!checkTypeThickness(size?.type) || !size?.thickness) return "";
    const t = thicknesses.find((th: any) => th._id === size.thickness);
    if (!t || t.value === undefined || t.value === null || t.value === "")
      return "";
    return `${t.value}cm `;
  }

  /** Price breakdown only; uses same rules as edge-design UI. */
  function getCanvasDesignPriceLabel(size: any) {
    if (!checkTypeEdge(size?.type, size?.printExtension) || !size?.design)
      return "";
    const typeName = String(getCanvasType(size?.type) || "")
      .trim()
      .toLowerCase();
    const d = designs.find((x: any) => x._id === size.design);
    if (!d?.name) return "";
    const rawDesignName = String(d.name).trim();
    if (!rawDesignName) return "";
    const normalizedDesign = rawDesignName.toLowerCase();
    const isStretchedType = typeName.includes("stretched canvas");
    if (!isStretchedType) return ` ${rawDesignName}`;
    if (normalizedDesign.startsWith("with ") && normalizedDesign.endsWith(" edges")) {
      return ` ${rawDesignName}`;
    }
    if (normalizedDesign.endsWith(" edges")) return ` With ${rawDesignName}`;
    return ` With ${rawDesignName} Edges`;
  }

  function getCanvasFrame(frame: any) {
    if (!frame) return "";
    const item = frames?.find((f: any) => f._id === frame);
    if (!item) return "";
    return item.name;
  }

  function getCanvasFramingTypeLabel(size: any) {
    if (!isFramedStretchedCanvas(size?.type) || !size?.framingType) return "";
    const f = framingTypes.find((x: any) => x._id === size.framingType);
    if (!f?.name) return "";
    return `, ${f.name}`;
  }

  function getClosestSizeFramePrice(size: any) {
    const closestSize = getClosestSize(sizes, size.width, size.height);
    if (!closestSize) return 0;
    const price = framePrices.find(
      (p: any) =>
        p.size._id === closestSize._id &&
        (p.type?._id === size.type ||
          (p.type === null && size.type === null)) &&
        (p.frame?._id === size.frame ||
          (p.frame === null && size.frame === null)) &&
        (p.thickness?._id === size.thickness ||
          (p.thickness === null && size.thickness === null))
    );
    if (!price) return 0;
    return price.price;
  }

  function renderSizePrice(size: any) {
    const price = getClosestSizePrice(size);
    const quantity = getSizeQuantity(size);
    return price * quantity + " AED";
  }

  function renderSizeFramePrice(size: any) {
    const price = getClosestSizeFramePrice(size);
    const quantity = getSizeQuantity(size);
    return price * quantity + " AED";
  }

  function renderNormalPrice(size: any) {
    return (
      <p>
        {" "}
        {size.width}cm X {size.height}cm ({convertLength(size.width, "cm")}’’ X{" "}
        {convertLength(size.height, "cm")}’’) {getCanvasThicknessPriceLabel(size)}
        {getCanvasType(size?.type)}
        {getCanvasDesignPriceLabel(size)}:{" "}
        {getSizeQuantity(size)} Canvas(es) x {getClosestSizePrice(size)} AED ={" "}
        {renderSizePrice(size)}
      </p>
    );
  }

  function renderFramePrice(size: any) {
    if (!size.frame) return "";
    return (
      <p>
        {" "}
        {size.width}cm X {size.height}cm ({convertLength(size.width, "cm")}’’ X{" "}
        {convertLength(size.height, "cm")}’’) {getCanvasFrame(size?.frame)}
        {" Frame"}
        {getCanvasFramingTypeLabel(size)}: {getSizeQuantity(size)} Frame(s) x{" "}
        {getClosestSizeFramePrice(size)} AED = {renderSizeFramePrice(size)}
      </p>
    );
  }

  function handleFrameChange(index: any, value: any) {
    if (formRef.current)
      formRef.current.setFieldValue(`sizes[${index}].frame`, value);
  }

  function handleThicknessChange(index: any, value: any) {
    if (formRef.current) {
      formRef.current.setFieldValue(`sizes[${index}].thickness`, value);
      formRef.current.setFieldValue(`sizes[${index}].frame`, "");
      formRef.current.setFieldValue(`sizes[${index}].framingType`, "");
    }
  }

  function checkFrameWithThickness(frame: any, thickness: any) {
    const item = framePrices.find(
      (f: any) => f.frame._id === frame && f.thickness._id === thickness
    );
    if (item) return true;
    return false;
  }

  function renderRelevantFrame(index: any, frame: any, size: any) {
    if (!checkFrameWithThickness(frame._id, size.thickness)) return "";
    return (
      <TypeCard
        key={frame._id}
        title={frame.name}
        value={frame._id}
        handleOnClick={(value: any) => handleFrameChange(index, value)}
        selected={frame._id === size.frame}
        image={frame?.image?.src}
      />
    );
  }

  function addCanvasPrint(arrayHelpers: any) {
    arrayHelpers.push({ ...defaultSize, id: generateUniqueKey() });
    // const length = arrayHelpers.form.values.sizes.length;
    // formRef.current.setFieldValue(
    //   `sizes[${length}].finishing`,
    //   data.business_cards_finishing_types[0].value
    // );
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(canvasPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles(){
    const { sizes } = getFormikValues();
    const files = (sizes || [])
        .flatMap((size:any) => Array.isArray(size.files) ? size.files : []);
    return files;
  }

  function renderFileUploadSummary(){
    const files = getAllFiles();
    return <FileUploadSummary files={files}/>
  }

  function renderFileUploadProgress(){
    const files = getAllFiles();
    return <FileUploadProgress files={files}/>
  }

  useEffect(() => {
    if (!areas) return;
    const sortedAreas = sortArrayAlphabetically(areas);
    let options: any = sortedAreas?.map((area: any) => {
      return { value: area.name, label: area.name };
    });
    setAreaOptions(options);
  }, [areas]);

  useEffect(() => {
    // Load catalog from CMS only — do not set `price` here. Resetting to min_price on
    // every `data` reference change (live refetch/revalidate) desynced the Price field
    // from Formik-driven line items.
    if (data?.prices) setPrices(data.prices);
    if (data?.frame_prices) setFramePrices(data.frame_prices);
    if (data?.sizes) setSizes(data.sizes);
    if (data?.print_types) setTypes(data.print_types);
    if (data?.thicknesses) setThicknesses(data.thicknesses);
    if (data?.edge_designs) setDesigns(data.edge_designs);
    if (data?.frames) setFrames(data.frames);
    setFramingTypes(
      Array.isArray(data?.framing_types) ? data.framing_types : []
    );
    if (data?.free_delivery_threshold != null) {
      setFreeDeliveryThreshold(data.free_delivery_threshold);
    }
  }, [data]);

  useEffect(() => {
    lastPriceTotalsRef.current = null;
    queueMicrotask(() => {
      if (formRef.current?.values) {
        calculatePrice();
      }
    });
  }, [
    prices,
    framePrices,
    sizes,
    types,
    thicknesses,
    frames,
    data?.min_price,
    freeDeliveryThreshold,
    canvasPrintingPrices,
    areas,
  ]);

  useEffect(() => {
    if (!areas) return;
    let allCities: any = [];
    let allAreas: any = [];
    areas?.forEach((area: any) => {
      if (!allCities?.includes(area?.city)) {
        allCities?.push(area?.city);
      }
    });
    let optionsTwo: any = allCities.sort().map((city: any, i: any) => {
      return { value: city, label: city };
    });

    const firstCity = optionsTwo[0];
    areas.forEach((area: any) => {
      if (area?.city === firstCity?.value) {
        allAreas.push({ value: area?.name, label: area?.name });
      }
    });
    formRef.current.setFieldValue("city", firstCity?.value);
    const sortedAreas = sortArrayAlphabetically(allAreas);
    setAreaOptions(sortedAreas);
    setCityOptions(optionsTwo);
  }, []);

  const ValidationSchema = Yup.object().shape({
    firstname: Yup.string().required("Required"),
    lastname: Yup.string().required("Required"),
    phone: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    area: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email address").required("Required"),
    sizes: Yup.array().of(
      Yup.object().shape({
        // files: Yup.array().test(
        //   "fileSize",
        //   "Please check the size of the photos you have uploaded, each file should be less than a maximum of 10mb",
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
        width: Yup.number().min(1, "Width must be greater than 0"),
        height: Yup.number().min(1, "Height must be greater than 0"),
        type: Yup.string().required("Type is required!"),
        frame: Yup.string().when("type", {
          is: (type: string) => {
            const selectedType = types.find((t: any) => t._id === type);
            return selectedType?.hasFrame;
          },
          then: (schema) => schema.required("Frame is required!"),
          otherwise: (schema) => schema.notRequired(),
        }),
        thickness: Yup.string().when("type", {
          is: (type: string) => {
            const selectedType = types.find((t: any) => t._id === type);
            return selectedType?.hasThickness;
          },
          then: (schema) => schema.required("Thickness is required!"),
          otherwise: (schema) => schema.notRequired(),
        }),
        framingType: Yup.string().test(
          "framing-required",
          "Front Framing Style is required!",
          function (value) {
            const { type, thickness } = this.parent;
            if (!framingTypes?.length) return true;
            if (!isFramedStretchedCanvas(type)) return true;
            if (!thickness || !checkTypeFrame(type)) return true;
            return Boolean(value);
          }
        ),
      })
    ),
  });

  // console.log("Data", data);

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
          const snapshot = getPricingSnapshotKey(values);
          if (snapshot !== lastPricingSnapshotRef.current) {
            lastPricingSnapshotRef.current = snapshot;
            queueMicrotask(() => {
              calculatePriceFromValues(values);
            });
          }
          return {};
        }}
        enableReinitialize={true}
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
          // console.log(errors,values);
          return (
            <form
              className="order-form container mb-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <CheckoutActivityFormTracker orderType="CANVAS_PRINT" />
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
                        pushDatalyer("Canvas Printing", "First Name")
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
                        pushDatalyer("Canvas Printing", "Last Name")
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
                      onFocus={() => pushDatalyer("Canvas Printing", "Email")}
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
                        pushDatalyer("Canvas Printing", "Phone Number")
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
                      onFocus={() => pushDatalyer("Canvas Printing", "Address")}
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
                          "Canvas Printing",
                          "Privacy Preference",
                          e.target?.value
                        );
                      }}
                      onFocus={() =>
                        pushDatalyer("Canvas Printing", "Privacy Preference")
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
                <div className="formControll">
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
                                        <div className="formControll mt-2 mb-2">
                                          <label className="font-secondary single-label mb-0 order-option-label">
                                            Size{" "}
                                          </label>
                                        </div>
                                        {values.sizes.length > 1 ? (
                                          <>
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
                                        ) : (
                                          <div></div>
                                        )}
                                      </div>
                                      <div className="formContainer">
                                        <div className="formControll">
                                          <label
                                            htmlFor="width"
                                            className="order-option-label"
                                          >
                                            Width (cm)
                                          </label>
                                          <input
                                            className="input-hidden-arrows"
                                            data-formControlName="width"
                                            type="number"
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
                                            min={"0"}
                                            max={getMaxSize(sizes)}
                                            step={"0.01"}
                                            placeholder="Width (cm)"
                                            name={`sizes[${index}].width`}
                                            id={`sizes[${index}].width`}
                                            value={size.width === 0 ? "" : size.width}
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
                                            placeholder="Height (cm)"
                                          />
                                          <RenderErrorMessage
                                            errors={errors}
                                            touches={touched}
                                            name={`sizes[${index}].height`}
                                          />
                                        </div>
                                      </div>
                                      <div className="formControll mb-2" style={{marginTop: '20px'}}>
                                        <label className="font-secondary single-label order-option-label">
                                          Canvas Printing Type
                                        </label>
                                      </div>
                                      <div className="formControll">
                                        <div className="type-cards-flex d-flex smart_scroll align-items-start justify-content-start gap-2 pb-2">
                                          {types.length > 0 &&
                                            types.map((type: any) => (
                                              <TypeCard
                                                key={type._id}
                                                title={type.name}
                                                value={type._id}
                                                handleOnClick={(value: any) =>
                                                  handleTypeChange(
                                                    value,
                                                    type,
                                                    index
                                                  )
                                                }
                                                selected={
                                                  type._id === size.type
                                                }
                                                image={type?.image?.src}
                                              />
                                            ))}
                                        </div>
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].type`}
                                        />
                                      </div>
                                      {size.type && !checkTypeThickness(size.type)  && (
                                        <div className="formControll">
                                          <label
                                            htmlFor="printExtension"
                                            className="order-option-label"
                                          >
                                              Print Extension
                                          </label>
                                          <div>
                                            <input
                                              data-formControlName="printExactSize"
                                              type="radio"
                                              style={{marginRight:'1rem'}}
                                              id="printExactSize"
                                              name={`sizes[${index}].printExtension`}
                                              value={'printExactSize'}
                                              checked={size.printExtension === 'printExactSize'}
                                              onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue(`sizes[${index}].design`,"");
                                              }}
                                              onFocus={() =>
                                                pushDatalyer("Canvas Printing", "Print Extension")
                                              }
                                            />
                                            <label htmlFor="printExactSize">
                                              Print Exact Size Selected
                                            </label>
                                            <InfoTooltip content="Choose if you will NOT stretch it"/>
                                          </div>
                                          <div>
                                            <input
                                              data-formControlName="5cmExtra"
                                              type="radio"
                                              style={{marginRight:'1rem'}}
                                              id="5cmExtra"
                                              name={`sizes[${index}].printExtension`}
                                              value={'5cmExtra'}
                                              checked={size.printExtension === '5cmExtra'}
                                              onChange={(e) => {
                                                handleChange(e);
                                              }}
                                              onFocus={() =>
                                                pushDatalyer("Canvas Printing", "Print Extension")
                                              }
                                            />
                                            <label htmlFor="5cmExtra">
                                              Keep 5cm Extra for Stretching
                                            </label>
                                            <InfoTooltip content="Choose if you will stretch on a stretcher bar"/>
                                          </div>
                                        </div>
                                      )}
                                      {/* Render Thickness if type has thickness */}
                                      {checkTypeThickness(size.type) && (
                                        <>
                                          <div className="formControll">
                                            <label className="font-secondary single-label order-option-label">
                                              Canvas Thickness
                                            </label>
                                          </div>
                                          <div className="formControll">
                                            <div className="type-cards-flex d-flex smart_scroll align-items-start justify-content-start gap-2 pb-2">
                                              {thicknesses.length > 0 &&
                                                thicknesses.map(
                                                  (thickness: any) => (
                                                    <TypeCard
                                                      key={thickness._id}
                                                      title={
                                                        thickness.value +
                                                        "cm Deep"
                                                      }
                                                      value={thickness._id}
                                                      handleOnClick={(
                                                        value: any
                                                      ) =>
                                                        handleThicknessChange(
                                                          index,
                                                          value
                                                        )
                                                      }
                                                      selected={
                                                        thickness._id ===
                                                        size.thickness
                                                      }
                                                      image={
                                                        thickness?.image?.src
                                                      }
                                                    />
                                                  )
                                                )}
                                            </div>
                                            <RenderErrorMessage
                                              errors={errors}
                                              touches={touched}
                                              name={`sizes[${index}].thickness`}
                                            />
                                          </div>
                                        </>
                                      )}
                                      {checkTypeEdge(size.type,size.printExtension) && (
                                        <>
                                          <div className="formControll">
                                            <label className="font-secondary single-label order-option-label">
                                              Canvas Edge Design
                                            </label>
                                          </div>
                                          <div className="formControll">
                                            <div className="type-cards-flex d-flex smart_scroll align-items-start justify-content-start gap-2 pb-2">
                                              {designs.length > 0 &&
                                                designs.map((design: any) => (
                                                  <TypeCard
                                                    key={design._id}
                                                    title={design.name}
                                                    value={design._id}
                                                    handleOnClick={(
                                                      value: any
                                                    ) =>
                                                      setFieldValue(
                                                        `sizes[${index}].design`,
                                                        value
                                                      )
                                                    }
                                                    selected={
                                                      design._id === size.design
                                                    }
                                                    image={design?.image?.src}
                                                  />
                                                ))}
                                            </div>
                                            <RenderErrorMessage
                                              errors={errors}
                                              touches={touched}
                                              name={`sizes[${index}].design`}
                                            />
                                          </div>
                                        </>
                                      )}
                                      {/* Render Frames if type has frame */}

                                      {size.thickness &&
                                        checkTypeFrame(size.type) && (
                                          <>
                                            <div className="formControll">
                                              <label className="font-secondary single-label order-option-label">
                                                Front Frame
                                              </label>
                                            </div>
                                            <div className="formControll">
                                              <div className="type-cards-flex d-flex smart_scroll align-items-start justify-content-start gap-2 pb-2">
                                                {frames.length > 0 &&
                                                  frames.map((frame: any) => {
                                                    return renderRelevantFrame(
                                                      index,
                                                      frame,
                                                      size
                                                    );
                                                  })}
                                              </div>
                                              <RenderErrorMessage
                                                errors={errors}
                                                touches={touched}
                                                name={`sizes[${index}].frame`}
                                              />
                                            </div>
                                          </>
                                        )}
                                      {size.thickness &&
                                        checkTypeFrame(size.type) &&
                                        isFramedStretchedCanvas(
                                          size.type
                                        ) && (
                                          <>
                                            <div className="formControll">
                                              <label className="font-secondary single-label order-option-label">
                                                Front Framing Style
                                              </label>
                                            </div>
                                            <div className="formControll">
                                              {framingTypes.length > 0 ? (
                                                <div className="type-cards-flex d-flex smart_scroll align-items-start justify-content-start gap-2 pb-2">
                                                  {framingTypes.map(
                                                    (ft: any) => (
                                                      <TypeCard
                                                        key={ft._id}
                                                        title={ft.name}
                                                        value={ft._id}
                                                        handleOnClick={(
                                                          v: any
                                                        ) =>
                                                          setFieldValue(
                                                            `sizes[${index}].framingType`,
                                                            v
                                                          )
                                                        }
                                                        selected={
                                                          ft._id ===
                                                          size.framingType
                                                        }
                                                        image={ft?.image?.src}
                                                      />
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="small text-muted mb-2">
                                                  No front framing styles are configured yet.
                                                  Add them in admin canvas settings.
                                                </p>
                                              )}
                                              <RenderErrorMessage
                                                errors={errors}
                                                touches={touched}
                                                name={`sizes[${index}].framingType`}
                                              />
                                            </div>
                                          </>
                                        )}
                                      <div className="formControll custom-dropzone--container">
                                        <label style={{margin:0}}>
                                          <FileUploadingStatus files={size.files}/>
                                        </label>
                                        <ImageDropzone
                                          orderType="CANVAS_PRINT"
                                          files={size.files}
                                          showCounters={true}
                                          showPrint={true}
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
                                            queueMicrotask(() =>
                                              calculatePrice()
                                            );
                                          }}
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
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </>
                          )}
                          <div className="formControll mt-3">
                            <button
                              className="btn--primary-new "
                              type="button"
                              style={{
                                width: "fit-content",
                              }}
                              onClick={() => addCanvasPrint(arrayHelpers)}
                            >
                              Add Another Canvas Print
                            </button>
                          </div>
                        </>
                      );
                    }}
                  />
                </div>

                <div className="formControll">
                  <div className="formControll any-comments mt-2">
                    <label htmlFor="people">Any Comments</label>
                    <textarea
                      data-formControlName="comments"
                      typeof="textarea"
                      value={values.comments}
                      onFocus={() =>
                        pushDatalyer("Canvas Printing", "Any Comments")
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
                    value={
                      (Number(price) || 0) + (Number(deliveryCharges) || 0)
                    }
                    type="number"
                    id="people"
                    name="people"
                  />
                  <div className="order-summary">
                    {values?.sizes?.map((size: any, index: any) => {
                      if (size?.isSelected === false) return null;
                      return (
                        <div key={index}>
                          {renderNormalPrice(size)}
                          {renderFramePrice(size)}
                        </div>
                      );
                    })}
                    {renderDeliveryCharges()}
                    <OrderTotalPrice
                      total={
                        (Number(price) || 0) + (Number(deliveryCharges) || 0)
                      }
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

export default CanvasOrderForm;
