"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Field, Formik, FieldArray, ErrorMessage } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import ImageDropzone from "../../../components/Dropzones/ImageDropzone";
import Checkout from "../../../components/Checkout";
import SearchableSelect from "../../../components/SearchableSelect";
import useApp from "../../../store/useApp";
import _ from "lodash";
import "./PhotoPrintingForm.css";
import * as Yup from "yup";
import LoadingProgress from "../../../components/LoadingProgress";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import showCustomPopup from "@/components/NoSwal";
import * as Sentry from "@sentry/nextjs";
import { privacyOptions } from "@/utils";
import {
  convertLength,
  getClosestSize,
  getSizesMaxDimenstions,
  getAreaSet,
  getMaxSize,
  checkFreeDelivery,
  getDeliveryCharges,
} from "@/helpers/generals";
import { RenderErrorMessage } from "@/components/RenderErrorMessage";
import { SentryCustomError } from "@/libs/utils";
import FileUploadProgress from "@/components/FileUploadProgress";
import { cityAreaLayer, fileUploading, formSubmission, pushDatalyer, pushDropdownLayer, pushOrderLayer, stripeStart } from "@/datalayers/CP";
import {
  buildLaminationSelectOptions,
  getLaminationBreakdownByType,
  getLaminationTotalForFiles,
  getPhotoSizePriceKey,
  getLaminationUnitPrice,
  hasConfiguredPhotoLaminations,
} from "@/libs/photoPrintingPricing";
import {
  getPolaroidDiscountedPrice,
  getPolaroidLaminationKey,
  getPolaroidOrderSizeLabel,
  getPolaroidQuantity,
} from "@/libs/polaroidPrinting";
import PolaroidStylesSection from "./PolaroidStylesSection";
import PhotoFramesSection, {
  type PhotoFrameSelections,
} from "./PhotoFramesSection";
import { frameSizeFitsMax } from "@/libs/photoFramePricing";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import InfoTooltip from "@/components/InfoTooltip";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import DeliveryChargesLine from "@/components/DeliveryChargesLine";
import { IMAGE_PRINT_TYPES } from "@/constants/uploadSupportedTypes";

/**
 * Max allowed for one custom side when the other side is already set.
 * Uses the largest preset sheet and allows rotation (same idea as getClosestSize).
 */
function getPhotoCustomSideMax(
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

const PhotoPrintingForm = ({ data, areas, sections }: any) => {

  const minPrice = data?.min_price === undefined ? 0 : data?.min_price;

  const { tryCreateToken, photoPrintingPrices, resetStripeElements, sessionId } = useApp();
  const formRef = useRef<any>();
  const [showLoading, setShowLoading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [price, setPrice] = useState<any>(minPrice);
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [orderValue, setOrderValue] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<any>(data?.free_delivery_threshold ? data?.free_delivery_threshold : 0);
  const [sizes, setSizes] = useState<any>([]);
  const [paperTypes, setPaperTypes] = useState<any>([]);
  const [photoFrameSelections, setPhotoFrameSelections] =
    useState<PhotoFrameSelections>([]);
  const photoFrameSelectionsRef = useRef<PhotoFrameSelections>([]);
  const photoLaminations = useMemo(
    () => (Array.isArray(data?.photo_laminations) ? data.photo_laminations : []),
    [data],
  );
  const photoFramesEnabled = Boolean(data?.photo_frames_enabled);
  const photoFrames = Array.isArray(data?.photo_frames) ? data.photo_frames : [];
  const photoFrameMatBoards = Array.isArray(data?.photo_frame_mat_boards)
    ? data.photo_frame_mat_boards
    : [];
  const photoFramePrices = Array.isArray(data?.photo_frame_prices)
    ? data.photo_frame_prices
    : [];

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    if (!formikValues) return {}
    return formikValues;
  };

  // console.log(data, areas, photoPrintingPrices )

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
    sizes: data?.sizes?.map((size: any) => {
      return { ...size, isSelected: false, files: [], custom: false };
    }),
    polaroidEnabled: false,
    polaroidStyles: (data?.photo_polaroid_styles || []).map((style: any) => ({
      ...style,
      files: [],
      uiOpen: false,
    })),
  };

  const resetForm = function () {
    formRef.current.resetForm();
    photoFrameSelectionsRef.current = [];
    setPhotoFrameSelections([]);
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
      discounts: closestSize.discounts
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
          discounts: closestSize.discounts
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
        //   "File size must be less than 10MB",
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
        // ),
        width: Yup.number()
          .when(["custom", "isSelected"], {
            is: (custom: boolean, isSelected: boolean) => custom === true && isSelected === true,
            then: (schema) => schema
              .min(1, "Width must be greater than 0")
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

        height: Yup.number()
          .when(["custom", "isSelected"], {
            is: (custom: boolean, isSelected: boolean) => custom === true && isSelected === true,
            then: (schema) => schema
              .min(1, "Height must be greater than 0")
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

  function getSizeQuantity(size: any) {
    try {
      if (!size || !size?.files) return 0;

      // Filter out failed files first
      const validFiles = size?.files?.filter((item: any) => item.status !== 'failed');

      const copies = validFiles.map((item: any) => parseInt(item.count) || 0);

      let totalQuantity = _.sum(copies);
      return totalQuantity;
    } catch (error) {
      console.error(error)
      return 0;
    }
  }

  function getSizeDiscountedPrice(size: any) {
    try {
      if (!size || !size.price) return { compare_at_price: 0, price: null }; // Ensure product is valid
      const quantity = getSizeQuantity(size)
      if (quantity === 0) return { compare_at_price: 0, price: null };
      let applicableDiscount: any = null;

      size.discounts?.forEach((discount: any) => {
        if (matchesRange(discount.range, quantity)) {
          if (!applicableDiscount || discount.percentage > applicableDiscount.percentage) {
            applicableDiscount = discount;
          }
        }
      });

      if (applicableDiscount) {
        const discountedPrice = size.price - (size.price * (applicableDiscount.percentage / 100));
        return { compare_at_price: size.price, price: parseFloat((discountedPrice).toFixed(2)) }
      }

      // Return normal price if no discount applies
      return { compare_at_price: size.price, price: null }
    } catch (error) {
      console.error(error);
      return { compare_at_price: 0, price: null };
    }
  }

  function matchesRange(range: any, quantity: any) {
    if (/^>=\d+$/.test(range)) {
      return quantity >= parseInt(range.slice(2));
    } else if (/^<=\d+$/.test(range)) {
      return quantity <= parseInt(range.slice(2));
    } else if (/^\d+-\d+$/.test(range)) {
      let [min, max] = range.split('-').map(Number);
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

  /**
   * Print subtotal + lamination (no min-price floor).
   * Min price is applied later on print + optional frame together.
   */
  function getChargedPrintSubtotal(
    sizes: any[],
    polaroidStyles: any[] = [],
    includePolaroid = false,
  ) {
    let printTotal = 0;
    sizes.forEach((size: any, si: number) => {
      if (size.isSelected) {
        const quantity = getSizeQuantity(size);
        if (quantity > 0) {
          const { price, compare_at_price } = getSizeDiscountedPrice(size);
          printTotal += quantity * (price ? price : compare_at_price);
        }
      }
    });
    if (includePolaroid) {
      (polaroidStyles || []).forEach((style: any) => {
        const quantity = getPolaroidQuantity(style);
        if (quantity > 0) {
          const { price, compare_at_price } = getPolaroidDiscountedPrice(style);
          printTotal += quantity * (price ?? compare_at_price);
        }
      });
    }
    printTotal = parseFloat(printTotal.toFixed(2));
    let laminationExtra = 0;
    sizes.forEach((size: any, si: number) => {
      if (size.isSelected && getSizeQuantity(size) > 0) {
        const sk = getPhotoSizePriceKey(size, si);
        laminationExtra += getLaminationTotalForFiles(
          photoLaminations,
          sk,
          size.files,
        );
      }
    });
    if (includePolaroid) {
      (polaroidStyles || []).forEach((style: any, pi: number) => {
        if (getPolaroidQuantity(style) > 0) {
          const sk = getPolaroidLaminationKey(style, pi);
          laminationExtra += getLaminationTotalForFiles(
            photoLaminations,
            sk,
            style.files,
          );
        }
      });
    }
    laminationExtra = parseFloat(laminationExtra.toFixed(2));
    return parseFloat((printTotal + laminationExtra).toFixed(2));
  }

  /** Min order floor applies to the full merchandise total (prints + frame), not prints alone. */
  function applyMinOrderFloor(amount: number) {
    const floor = Number(minPrice) || 0;
    const value = Number(amount) || 0;
    if (floor > 0 && value < floor) return floor;
    return parseFloat(value.toFixed(2));
  }

  function calculatePrice() {
    setTimeout(() => {
      setPrice(0);
      setOrderValue(0);
      let newDeliveryCharges = 0;
      const { sizes, polaroidStyles = [], polaroidEnabled, area = null } =
        getFormikValues();

      console.log("Sizes", sizes)
      let newOrderValue = getChargedPrintSubtotal(
        sizes,
        polaroidStyles,
        Boolean(polaroidEnabled),
      );
      const frameSels = photoFrameSelectionsRef.current || [];
      const frameLine = frameSels.reduce((sum, sel) => {
        if (sel?.unit_price == null) return sum;
        return sum + (Number(sel.line_total) || 0);
      }, 0);
      if (frameLine > 0) {
        newOrderValue = parseFloat((newOrderValue + frameLine).toFixed(2));
      }
      newOrderValue = applyMinOrderFloor(newOrderValue);
      setOrderValue(newOrderValue);
      setPrice(newOrderValue);

      if (checkFreeDelivery(newOrderValue, freeDeliveryThreshold)) {
        newDeliveryCharges = 0;
      } else {
        newDeliveryCharges = getDeliveryCharges(photoPrintingPrices, area, areas)
      }

      setDeliveryCharges(newDeliveryCharges)
    }, 100);
  }

  function handlePhotoFrameChange(next: PhotoFrameSelections) {
    photoFrameSelectionsRef.current = next;
    setPhotoFrameSelections(next);
    calculatePrice();
  }

  function onSubmit() {
    if (!data?.isActive) {
      //console.log(data)
      showCustomPopup(data?.alert_message);
      return;
    }
    formSubmission("Photos Printing", "form_submission_attempt");
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
      polaroidStyles = [],
      polaroidEnabled,
    } = getFormikValues();

    let haveFiles = false;
    sizes &&
      sizes?.forEach((size: any) => {
        if (size.isSelected && size.files.length > 0) haveFiles = true;
      });
    if (polaroidEnabled) {
      polaroidStyles?.forEach((style: any) => {
        if (style.files?.length > 0) haveFiles = true;
      });
    }
    if (!haveFiles) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please upload picture!",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
      formSubmission("Photos Printing", "form_submission_error", {
        title: "Validation Error",
        text: "Please upload picture!",
      });
      return;
    }

    const frameSels = photoFrameSelectionsRef.current || [];
    for (const frameSel of frameSels) {
      const frameMeta = photoFrames.find(
        (f: any) => String(f._id) === String(frameSel.frame_id),
      );
      const maxW = Number(frameMeta?.max_width) || 100;
      const maxH = Number(frameMeta?.max_height) || 140;
      const frameLabel = frameSel.frame_name || "photo frame";
      if (
        !Number.isFinite(frameSel.width) ||
        !Number.isFinite(frameSel.height) ||
        frameSel.width <= 0 ||
        frameSel.height <= 0
      ) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: `Please enter a valid size for ${frameLabel}.`,
          showLoaderOnConfirm: false,
          showLoaderOnDeny: false,
          loaderHtml: `<div></div>`,
        });
        return;
      }
      // Match custom-size UI + backend: allow rotation against frame max sheet.
      if (!frameSizeFitsMax(frameSel.width, frameSel.height, maxW, maxH)) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: `${frameLabel} max size is ${maxW} x ${maxH} cm.`,
          showLoaderOnConfirm: false,
          showLoaderOnDeny: false,
          loaderHtml: `<div></div>`,
        });
        return;
      }
      if (frameSel.unit_price == null || frameSel.quantity <= 0) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: `No photo frame price for ${frameLabel} (selected size and mat). Change selection or clear that frame.`,
          showLoaderOnConfirm: false,
          showLoaderOnDeny: false,
          loaderHtml: `<div></div>`,
        });
        return;
      }
    }

    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart("Photos Printing", "stripe_start");
      if (token === undefined || token === "") {
        console.log("Error while getting token");
        formSubmission("Photos Printing", "form_submission_error", { text: "Error while getting token" });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        let metaData: any = [];
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        sizes &&
          sizes?.forEach((size: any, si: number) => {
            if (size.isSelected) {
              const name = `${size.width}cmX${size.height}cm (${size.width_in_inches}"x${size.height_in_inches}" inches)`;
              const sizeKey = getPhotoSizePriceKey(size, si);

              // 🔹 Filter out files with failed status
              const validFiles = size.files.filter((file: any) => file.status !== 'failed');
              validFiles.forEach((file: any) => {
                const extension = file.name.split(".").pop();
                const lamPart =
                  file?.lamination && String(file.lamination).trim()
                    ? `_${String(file.lamination).replace(/\s+/g, "_").slice(0, 48)}`
                    : "";
                const filename = `${file.name
                  .split(".")
                  .slice(0, -1)
                  .join(".")}_${name}${file?.paperType ? '_' + file.paperType : ''}${lamPart}_${file?.print}(${file.count
                  }).${extension}`;
                const lamUnit = getLaminationUnitPrice(photoLaminations, sizeKey, file?.lamination);
                filesMetaData.push({
                  filename,
                  key: file.key,
                  url: file.url,
                  count: file.count,
                  size: name,
                  dimension: file?.print,
                  paperType: file?.paperType,
                  lamination: file?.lamination || "",
                  laminationUnitPrice: lamUnit,
                });
              });

              let { price, compare_at_price } = getSizeDiscountedPrice(size)
              let quantity = getSizeQuantity(size);
              let printTotal = quantity * (price ? price : compare_at_price);
              printTotal = parseFloat(printTotal.toFixed(2))
              const laminationTotal = parseFloat(
                getLaminationTotalForFiles(photoLaminations, sizeKey, validFiles).toFixed(2),
              );
              const totalPrice = parseFloat((printTotal + laminationTotal).toFixed(2));

              sizesMetaData.push({
                size: name,
                count: quantity,
                unitPrice:
                  quantity > 0 ? parseFloat((totalPrice / quantity).toFixed(2)) : 0,
                price: totalPrice,
                compare_at_price: price ? compare_at_price * quantity : 0,
                lamination_total: laminationTotal,
              });
            }
          });

        if (polaroidEnabled) {
          polaroidStyles?.forEach((style: any, pi: number) => {
          const name = getPolaroidOrderSizeLabel(style);
          const sizeKey = getPolaroidLaminationKey(style, pi);
          const validFiles = (style.files || []).filter(
            (file: any) => file.status !== "failed",
          );
          validFiles.forEach((file: any) => {
            const extension = file.name.split(".").pop();
            const lamPart =
              file?.lamination && String(file.lamination).trim()
                ? `_${String(file.lamination).replace(/\s+/g, "_").slice(0, 48)}`
                : "";
            const filename = `${file.name
              .split(".")
              .slice(0, -1)
              .join(".")}_${name}${file?.paperType ? "_" + file.paperType : ""}${lamPart}_${file?.print}(${file.count}).${extension}`;
            const lamUnit = getLaminationUnitPrice(
              photoLaminations,
              sizeKey,
              file?.lamination,
            );
            filesMetaData.push({
              filename,
              key: file.key,
              url: file.url,
              count: file.count,
              size: name,
              dimension: file?.print,
              paperType: file?.paperType,
              lamination: file?.lamination || "",
              laminationUnitPrice: lamUnit,
              caption: file?.caption ? String(file.caption).slice(0, 50) : "",
            });
          });

          const quantity = getPolaroidQuantity(style);
          if (quantity > 0) {
            const { price, compare_at_price } = getPolaroidDiscountedPrice(style);
            const unitCharged = price ?? compare_at_price;
            let printTotal = quantity * unitCharged;
            printTotal = parseFloat(printTotal.toFixed(2));
            const laminationTotal = parseFloat(
              getLaminationTotalForFiles(
                photoLaminations,
                sizeKey,
                validFiles,
              ).toFixed(2),
            );
            const totalPrice = parseFloat(
              (printTotal + laminationTotal).toFixed(2),
            );
            sizesMetaData.push({
              size: name,
              count: quantity,
              unitPrice:
                quantity > 0
                  ? parseFloat((totalPrice / quantity).toFixed(2))
                  : 0,
              price: totalPrice,
              compare_at_price: price ? compare_at_price * quantity : 0,
              lamination_total: laminationTotal,
            });
          }
          });
        }

        fileUploading("Photos Printing", filesMetaData, "started");
        formData.append("order_type", "photo_print");
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
        const chargedSubtotal = getChargedPrintSubtotal(
          sizes,
          polaroidStyles,
          Boolean(polaroidEnabled),
        );
        const submitFramesRaw = (photoFrameSelectionsRef.current || []).filter(
          (f) => f?.unit_price != null && Number(f.quantity) > 0,
        );
        // One line per frame card (defensive; UI already upserts by frame_id)
        const submitFrames = Array.from(
          new Map(
            submitFramesRaw.map((f) => [String(f.frame_id), f]),
          ).values(),
        );
        const frameLine = submitFrames.reduce(
          (sum, sel) => sum + (Number(sel.line_total) || 0),
          0,
        );
        const chargedWithFrame = applyMinOrderFloor(
          parseFloat((chargedSubtotal + frameLine).toFixed(2)),
        );
        const freeDel = checkFreeDelivery(
          chargedWithFrame,
          freeDeliveryThreshold,
        );
        const deliveryForSubmit = freeDel
          ? 0
          : getDeliveryCharges(photoPrintingPrices, area, areas);
        formData.append(
          "price",
          (chargedWithFrame + deliveryForSubmit).toFixed(2),
        );
        formData.append("token", token.id);
        if (sessionId) formData.append("session_id", sessionId);
        formData.append("delivery_charges", String(getDeliveryCharges(photoPrintingPrices, area, areas)));
        formData.append("free_delivery", String(freeDel))
        if (submitFrames.length > 0) {
          formData.append("photo_frames", JSON.stringify(submitFrames));
          // Dual-write first frame for older readers
          formData.append("photo_frame", JSON.stringify(submitFrames[0]));
        }

        try {
          const { data } = await axios({
            data: formData,
            method: "post",
            url: process.env.NEXT_PUBLIC_API_URL + "/api/createOrder",
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

          fileUploading("Photos Printing", filesMetaData, "completed");
          const { order_id, customer_id } = data;
          axios
            .post(process.env.NEXT_PUBLIC_API_URL + "/api/stripe/pay", {
              order_id,
              customer_id,
              session_id: sessionId
            })
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
                pushOrderLayer("Photos Printing", object);
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
                formSubmission("Photos Printing", "form_submission_error", {
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
              formSubmission("Photos Printing", "form_submission_error", {
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
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on care@ozelu.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
              }`,
            showLoaderOnConfirm: false,
            showLoaderOnDeny: false,
            loaderHtml: `<div></div>`,
          });
          formSubmission("Photos Printing", "form_submission_error", {
            title: "Oops...",
            text: `${error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on care@ozelu.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
              }`,
          });
        }
      }
    });
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer("Photos Printing",type, value);
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

  function handleSizeChange(index: any, field: any, value: any) {
    const maxValues = getSizesMaxDimenstions(sizes);
    const { sizes: formSizes } = getFormikValues();
    const current = formSizes?.[index] || {};
    const numericValue = Number(value);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

    if (field === "width") {
      const otherHeight = Number(current.height) || 0;
      const maxAllowed = getPhotoCustomSideMax(
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
      const maxAllowed = getPhotoCustomSideMax(
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
          closestSize.price,
        );
        formRef?.current.setFieldValue(
          "sizes[" + index + "].discounts",
          closestSize.discounts,
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

  function renderSizePrice(size: any) {
    const { price, compare_at_price } = getSizeDiscountedPrice(size)
    const quantity = getSizeQuantity(size)
    if (price) {
      return (<>
        <span className="text-muted" style={{ textDecoration: 'line-through' }}>
          {parseFloat((compare_at_price * quantity).toFixed(2))}{" AED"}
        </span>{" "}
        {parseFloat((price * quantity).toFixed(2))}{" AED"}
      </>)
    } else {
      return parseFloat((compare_at_price * quantity).toFixed(2)) + " AED";
    }
  }

  function renderPolaroidPrice(style: any) {
    const { price, compare_at_price } = getPolaroidDiscountedPrice(style);
    const quantity = getPolaroidQuantity(style);
    if (price) {
      return (
        <>
          <span className="text-muted" style={{ textDecoration: "line-through" }}>
            {parseFloat((compare_at_price * quantity).toFixed(2))} AED
          </span>{" "}
          {parseFloat((price * quantity).toFixed(2))} AED
        </>
      );
    }
    return `${parseFloat((compare_at_price * quantity).toFixed(2))} AED`;
  }

  function getAllFiles() {
    const { sizes, polaroidStyles = [], polaroidEnabled } = getFormikValues();

    const sizeFiles = (sizes || [])
      .filter((size: any) => size?.isSelected)
      .flatMap((size: any) => (Array.isArray(size.files) ? size.files : []));
    const polaroidFiles = polaroidEnabled
      ? (polaroidStyles || []).flatMap((style: any) =>
          Array.isArray(style.files) ? style.files : [],
        )
      : [];
    return [...sizeFiles, ...polaroidFiles];
  }

  function renderFileUploadSummary() {
    // const files = sizes.flatMap((size:any) => size.files);
    const files = getAllFiles();
    return <FileUploadSummary files={files} />
  }

  function renderFilesUploadProgress() {
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
    setPrice(minPrice)
    setSizes(data?.sizes);
    if (data?.paper_types) setPaperTypes(data?.paper_types)
  }, [data]);

  useEffect(() => {
    let allCities: any = [],
      allAreas: any = [];
    areas?.forEach((area: any) => {
      if (!allCities?.includes(area?.city)) {
        allCities?.push(area?.city);
      }
    });
    let optionsTwo: any = allCities.sort().map((city: any, i: any) => {
      return { value: city, label: city };
    });

    const firstCity = optionsTwo[0];
    //console.log(firstCity)
    areas.forEach((area: any) => {
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
    setAreaOptions(sortedAreas);
    setCityOptions(optionsTwo);
  }, []);


  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(photoPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }
  //console.log(price)

  return (
    <div className="photo-printing-form--wrapper">
      {showLoading && <LoadingProgress loaded={percentageUploaded} />}
      <Formik
        innerRef={formRef}
        initialValues={initialValues}
        validationSchema={ValidationSchema}
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
          // console.log(values,errors);
          return (
            <form
              className="order-form container"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
                validateForm().then((errors) => {
                  // console.log("Errors",errors)
                  if (errors && Object.keys(errors).length !== 0) {
                    throw new SentryCustomError('Photos Printing missing fields', errors);
                  }
                }).catch((err) => {
                  console.log("Errors", errors)
                  Swal.fire({
                    icon: "error",
                    title: "Validation Error",
                    text: "Please fill all fields!",
                    showLoaderOnConfirm: false,
                    showLoaderOnDeny: false,
                    loaderHtml: `<div></div>`,
                  });
                  formSubmission("Photos Printing", "form_submission_error", {
                    title: "Validation Error",
                    text: "Please fill all fields!",
                    errors,
                  });
                  // Sentry.captureException(err,{
                  //   extra: {
                  //     validationErrors: errors
                  //   }
                  // })
                });
              }}
            >
              <CheckoutActivityFormTracker orderType="PHOTO_PRINT" />
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
                      onFocus={() => pushDatalyer("Photos Printing", "First Name")}
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
                      onFocus={() => pushDatalyer("Photos Printing", "Last Name")}
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
                      onFocus={() => pushDatalyer("Photos Printing", "Email")}
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
                      onFocus={() => pushDatalyer("Photos Printing", "Phone Number")}
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
                      onFocus={() => pushDatalyer("Photos Printing", "Address")}
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
                        pushDropdownLayer("Photos Printing", "Privacy Preference", e.target?.value);
                      }}
                      onFocus={() => pushDatalyer("Photos Printing", "Privacy Preference")}
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
                  <p className="font-secondary fw-medium single-label photo-print-sizes-heading mb-0">
                    Choose Print Sizes, Custom Sizes or Polaroid{" "}
                    <span className="photo-print-sizes-heading__end">
                      Prints
                      <InfoTooltip
                        className="photo-print-sizes-heading__info"
                        content="Select from Standard Edge-to-Edge prints, create your own Custom Size(s) or choose Polaroid Style prints"
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
                                  onFocus={() => pushDatalyer("Photos Printing", "Custom Sizes")}
                                  name={`customSize`}
                                />
                                <label
                                  className="margin-left-15"
                                  htmlFor="img-bg-1"
                                >Custom Sizes</label>
                                <br />
                              </div>
                              {values.customSize && (
                                <div className="custom-sizes-container">
                                  {values?.sizes?.map(
                                    (size: any, index: any, array: any) => {
                                      if (!size.custom) return "";
                                      return (
                                        <div key={index}>
                                          <div className="formContainer custom-sizes-form">
                                            <div className="formControll">
                                              <label htmlFor={`sizes[${index}].width`}>
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
                                                    Number(parseFloat(e.target.value).toFixed(2))
                                                  );
                                                }}
                                                name={`sizes[${index}].width`}
                                                id={`sizes[${index}].width`}
                                              />
                                              <RenderErrorMessage
                                                errors={errors}
                                                touches={touched}
                                                name={`sizes[${index}].width`} />
                                            </div>

                                            <div className="formControll">
                                              <label htmlFor={`sizes[${index}].height`}>
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
                                                    Number(parseFloat(e.target.value).toFixed(2))
                                                  );
                                                }}
                                                name={`sizes[${index}].height`}
                                                id={`sizes[${index}].height`}
                                              />
                                              <RenderErrorMessage
                                                errors={errors}
                                                touches={touched}
                                                name={`sizes[${index}].height`} />
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
                                                const newIsSelected = !size.isSelected;
                                                // ✅ Update isSelected state
                                                setFieldValue(
                                                  `sizes[${index}].isSelected`,
                                                  newIsSelected
                                                );
                                                // ✅ Use longer timeout to ensure Formik state is updated before price calculation
                                                setTimeout(() => {
                                                  calculatePrice();
                                                }, 200);
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
                                              {convertLength(size.width, "cm")}’’x
                                              {convertLength(size.height, "cm")}’’
                                              inches){" "}
                                              {size.name
                                                ? "- " + size.name + " Size "
                                                : " "}
                                              <FileUploadingStatus files={size.files} />
                                            </label>
                                            <br />
                                          </div>
                                          {size.isSelected && (
                                            <>
                                              <div className="custom-dropzone--container">
                                                <ImageDropzone
                                                  orderType="PHOTO_PRINT"
                                                  files={size.files}
                                                  setFiles={(updater: any) => {
                                                    setFieldValue(
                                                      `sizes[${index}].files`,
                                                      typeof updater === 'function'
                                                        ? updater(size.files) // handle functional form
                                                        : updater
                                                    )
                                                    setFieldTouched(
                                                      `sizes[${index}].files`,
                                                      true,
                                                      true
                                                    );
                                                    calculatePrice();
                                                  }}
                                                  showCounters={true}
                                                  showPrint={true}
                                                  showPaper={true}
                                                  paperTypes={paperTypes}
                                                  showPhotoLamination={true}
                                                  laminationOptions={buildLaminationSelectOptions(
                                                    photoLaminations,
                                                    getPhotoSizePriceKey(size, index),
                                                  )}
                                                  zoom={true}
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
                                                      Per file size should not exceed 10MB, please use an online tool to compress the photos greater than 10MB and re-upload
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
                                return (
                                  <div key={index}>
                                    <div className="checkbox-container">
                                      <input
                                        checked={size.isSelected}
                                        onChange={() => {
                                          const newIsSelected = !size.isSelected;
                                          // ✅ Update isSelected state
                                          setFieldValue(
                                            `sizes[${index}].isSelected`,
                                            newIsSelected
                                          );
                                          // ✅ Use longer timeout to ensure Formik state is updated before price calculation
                                          setTimeout(() => {
                                            calculatePrice();
                                          }, 200);
                                        }}
                                        type="checkbox"
                                        onFocus={() =>
                                          pushDatalyer("Photos Printing",`${size.width}cmx${size.height
                                            }cm (
                                      ${size.width_in_inches}’’x
                                      ${size.height_in_inches}’’ inches)
                                      ${size.name
                                              ? "- " + size.name + " Size"
                                              : ""
                                            }`)
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
                                        <div className="custom-dropzone--container">
                                          <ImageDropzone
                                            orderType="PHOTO_PRINT"
                                            files={size.files}
                                            setFiles={(updater: any) => {
                                              setFieldValue(
                                                `sizes[${index}].files`,
                                                typeof updater === 'function'
                                                  ? updater(size.files) // handle functional form
                                                  : updater
                                              )
                                              setFieldTouched(
                                                `sizes[${index}].files`,
                                                true,
                                                true
                                              );
                                              calculatePrice();
                                            }}
                                            showCounters={true}
                                            showPrint={true}
                                            showPaper={true}
                                            paperTypes={paperTypes}
                                            showPhotoLamination={true}
                                            laminationOptions={buildLaminationSelectOptions(
                                              photoLaminations,
                                              getPhotoSizePriceKey(size, index),
                                            )}
                                            zoom={true}
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
                                                Per file size should not exceed 10MB, please use an online tool to compress the photos greater than 10MB and re-upload
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
                      )
                    }}
                  />
                </div>
                <PolaroidStylesSection
                  polaroidEnabled={Boolean(values.polaroidEnabled)}
                  polaroidStyles={values.polaroidStyles || []}
                  paperTypes={paperTypes}
                  photoLaminations={photoLaminations}
                  setFieldValue={setFieldValue}
                  setFieldTouched={setFieldTouched}
                  calculatePrice={calculatePrice}
                />
                {photoFramesEnabled ? (
                  <PhotoFramesSection
                    frames={photoFrames}
                    matBoards={photoFrameMatBoards}
                    prices={photoFramePrices}
                    selections={photoFrameSelections}
                    onChange={handlePhotoFrameChange}
                  />
                ) : null}
                <div className="formControll photo-print-comments-block">
                  <div className="formControll any-comments">
                    <label htmlFor="people">Any Comments</label>
                    <textarea
                      data-formControlName="comments"
                      typeof="textarea"
                      value={values.comments}
                      onFocus={() => pushDatalyer("Photos Printing", "Any Comments")}
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
                      if (!size.isSelected) return "";
                      const sizeKey = getPhotoSizePriceKey(size, index);
                      const laminationRows = getLaminationBreakdownByType(
                        photoLaminations,
                        sizeKey,
                        size.files,
                      );
                      return (
                        <React.Fragment key={index}>
                          <p>
                          {" "}
                          {size.width}cm X {size.height}cm (
                          {size.width_in_inches}’’ X {size.height_in_inches}’’)
                          Photos:{" "}
                          {getSizeQuantity(size)}{" "}
                          Photos x {size.price} AED ={" "}
                          {/* {_.sum(
                            size?.files?.map((item: any) =>
                              parseInt(item.count)
                            )
                          ) * size.price}{" "} */}
                          {renderSizePrice(size)}
                          </p>
                          {hasConfiguredPhotoLaminations(photoLaminations) &&
                            getSizeQuantity(size) > 0 &&
                            laminationRows.map((row, li) => (
                              <p key={`${index}-lam-${li}`}>
                                {row.type} = {row.total.toFixed(2)} AED
                              </p>
                            ))}
                        </React.Fragment>
                      );
                    })}
                    {values.polaroidEnabled &&
                      values?.polaroidStyles?.map((style: any, pi: number) => {
                      const qty = getPolaroidQuantity(style);
                      if (qty <= 0) return null;
                      const sizeKey = getPolaroidLaminationKey(style, pi);
                      const laminationRows = getLaminationBreakdownByType(
                        photoLaminations,
                        sizeKey,
                        style.files,
                      );
                      const { price: polUnitDisc, compare_at_price: polBase } =
                        getPolaroidDiscountedPrice(style);
                      const polUnit = (polUnitDisc ?? polBase).toFixed(2);
                      const polaroidLabel = getPolaroidOrderSizeLabel(style);
                      return (
                        <React.Fragment key={`pol-${pi}`}>
                          <p>
                            {polaroidLabel} Photos: {qty} Photos x {polUnit} AED ={" "}
                            {renderPolaroidPrice(style)}
                          </p>
                          {laminationRows.map((row, li) => (
                            <p key={`pol-${pi}-lam-${li}`}>
                              {row.type} = {row.total.toFixed(2)} AED
                            </p>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    {photoFrameSelections
                      .filter(
                        (sel) =>
                          sel?.unit_price != null && Number(sel.quantity) > 0,
                      )
                      .map((sel) => (
                        <p key={sel.frame_id}>
                          {sel.frame_name} ({sel.mat_board}) {sel.width}×
                          {sel.height} cm: {sel.quantity}{" "}
                          {sel.quantity === 1 ? "Frame" : "Frames"} x{" "}
                          {sel.unit_price} AED = {sel.line_total.toFixed(2)} AED
                          {sel.adds_one_delivery_day
                            ? " (+1 Day to Deliver)"
                            : ""}
                        </p>
                      ))}
                    {renderDeliveryCharges()}
                    <OrderTotalPrice total={price + deliveryCharges} />
                  </div>
                  {renderFileUploadSummary()}
                </div>
              </div>

              <div id="form-container" className="formControll payment-form">
                {/* <div id="element-container"></div>
        <div id="error-handler" role="alert">{{errorElement.textContent}}</div>
        <div id="success" style=" display: none;;position: relative;float: left;">
            Success! Your token is <span id="token"></span>
        </div> */}
                <Checkout />
                {renderFilesUploadProgress()}
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

export default PhotoPrintingForm;
