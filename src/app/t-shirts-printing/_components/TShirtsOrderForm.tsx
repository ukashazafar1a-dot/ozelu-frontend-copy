"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Field, Formik, FieldArray } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import DeliveryChargesLine from "@/components/DeliveryChargesLine";
import TShirtFileUploadRow, {
  createDefaultPlacementRow,
} from "./TShirtFileUploadRow";
import TShirtVariantCard from "./TShirtVariantCard";
import Checkout from "../../../components/Checkout";
import SearchableSelect from "../../../components/SearchableSelect";
import useApp from "../../../store/useApp";
import * as Yup from "yup";
import LoadingProgress from "../../../components/LoadingProgress";
import showCustomPopup from "@/components/NoSwal";
import { privacyOptions } from "@/utils";
import {
  checkFreeDelivery,
  generateUniqueKey,
  getDeliveryCharges,
  getTShirtLinePrintPrice,
  getTShirtUnitPrice,
  getPlacementUnitPrice,
  calculateTShirtExtraPlacementTotal,
  getTShirtPlacementFeeLines,
  getTShirtBlockTotalQuantity,
  getValidFiles,
  getColorsForShirtType,
  getSizesForShirtTypeAndColor,
  getTrackedStockQuantity,
  isShirtTypeActive,
} from "@/helpers/generals";
import { DeliveryArea, PageData } from "@/libs/types";
import { sortArrayAlphabetically } from "@/libs/utils";

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
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadProgress from "@/components/FileUploadProgress";

type PlacementFeeLine = {
  placement: string;
  price: number;
  included?: boolean;
  unitPrice?: number;
};

function buildValidationSchema(typeCatalog: any[], fallbackSizes: any[]) {
  return Yup.object().shape({
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
        print_type: Yup.string().required("Printing Method is required"),
        shirt_type: Yup.string().required("Shirt Type is required"),
        variants: Yup.array()
          .test(
            "at-least-one-order-variant",
            "Select at least one shirt size and quantity",
            function (variants) {
              if (!this.parent?.shirt_type) return true;
              return (variants || []).some((variant: any) => {
                const qty = Number(variant?.quantity);
                return (
                  !!variant?.shirt_size &&
                  Number.isFinite(qty) &&
                  Number.isInteger(qty) &&
                  qty >= 1
                );
              });
            }
          )
          .of(
            Yup.object().shape({
              shirt_size: Yup.string().when("quantity", {
                is: (qty: string) => Number(qty) >= 1,
                then: (schema) => schema.required("Shirt Size is required"),
                otherwise: (schema) => schema.nullable().notRequired(),
              }),
              quantity: Yup.string()
                .nullable()
                .notRequired()
                .test(
                  "valid-quantity",
                  "Enter a whole number of 0 or more",
                  (value) => {
                    if (value === undefined || value === null || value === "") {
                      return true;
                    }
                    const qty = Number(value);
                    return (
                      Number.isFinite(qty) && Number.isInteger(qty) && qty >= 0
                    );
                  }
                )
                .test(
                  "within-stock",
                  "Quantity exceeds available stock",
                  function (value) {
                    const qty = Number(value);
                    if (
                      !Number.isFinite(qty) ||
                      !Number.isInteger(qty) ||
                      qty < 1
                    ) {
                      return true;
                    }
                    const shirtSize = this.parent?.shirt_size;
                    const shirtColor = this.parent?.shirt_color || "";
                    if (!shirtSize) return true;

                    // Yup 1.x `from`: walk ancestors for the shirt block (has shirt_type)
                    let shirtType = "";
                    const from = this.from || [];
                    for (let i = 0; i < from.length; i += 1) {
                      const ancestor = from[i]?.value;
                      if (
                        ancestor &&
                        typeof ancestor === "object" &&
                        typeof ancestor.shirt_type === "string" &&
                        ancestor.shirt_type
                      ) {
                        shirtType = ancestor.shirt_type;
                        break;
                      }
                    }
                    if (!shirtType) return true;

                    const options = getSizesForShirtTypeAndColor(
                      typeCatalog,
                      shirtType,
                      shirtColor,
                      fallbackSizes
                    );
                    const opt = options.find((s: any) => s.value === shirtSize);
                    if (opt && (opt.outOfStock === true || opt.available === false)) {
                      return this.createError({
                        message: `${shirtSize} is out of stock for ${shirtColor || "this color"}.`,
                      });
                    }
                    const stock = getTrackedStockQuantity(opt);
                    if (stock == null) return true;
                    if (qty <= stock) return true;
                    return this.createError({
                      message: `Maximum available quantity is ${stock} for ${shirtColor || "this color"}, Size ${shirtSize}.`,
                    });
                  }
                ),
              shirt_color: Yup.string().nullable().notRequired(),
            })
          ),
        placements: Yup.array().of(
          Yup.object().shape({
            placement: Yup.string().nullable().notRequired(),
            files: Yup.array().of(
              Yup.mixed().test(
                "uploaded-file-placement",
                "Choose placement for uploaded file",
                function (file: any) {
                  if (file == null || typeof file !== "object") return true;
                  const uploaded =
                    !!file.key || file.status === "uploaded" || !!file.url;
                  if (!uploaded) return true;
                  const parentPlacement = this.parent?.placement;
                  return !!(file.placement || file.field || parentPlacement);
                }
              )
            ),
          })
        ),
      })
    ),
  });
}

const FORM_NAME = "T-Shirts Printing" as const;

type props = {
  data: PageData;
  areas: DeliveryArea[] | null;
};

function createDefaultVariant(shirtColor = "") {
  return {
    id: generateUniqueKey(),
    shirt_color: shirtColor,
    shirt_size: "",
    quantity: "0",
  };
}

function createDefaultBlock() {
  return {
    id: generateUniqueKey(),
    print_type: "",
    shirt_type: "",
    variants: [createDefaultVariant()],
    placements: [createDefaultPlacementRow()],
  };
}

function createDefaultBlockWithDefaults({
  colors = [],
  placementList = [],
  shirtPrices = [],
  typeCatalog = [],
}: {
  colors?: any[];
  placementList?: any[];
  shirtPrices?: any[];
  typeCatalog?: any[];
} = {}) {
  const block = createDefaultBlock();

  if (placementList.length && block.placements[0]) {
    block.placements[0] = {
      ...block.placements[0],
      placement: placementList[0].value,
    };
  }

  const printTypes = Array.from(
    new Set((shirtPrices || []).map((r: any) => r.print_type).filter(Boolean))
  );
  const printType = printTypes[0] || "";
  block.print_type = printType;

  if (printType) {
    const shirtTypes = Array.from(
      new Set(
        (shirtPrices || [])
          .filter((r: any) => r.print_type === printType)
          .map((r: any) => r.value)
          .filter(Boolean)
      )
    ).filter((shirtType) => isShirtTypeActive(typeCatalog, shirtType));
    const shirtType = shirtTypes[0] || "";
    block.shirt_type = shirtType;

    if (shirtType) {
      const colorOptions = getColorsForShirtType(
        typeCatalog,
        shirtType,
        colors
      );
      if (colorOptions.length) {
        block.variants = colorOptions.map((color: any) =>
          createDefaultVariant(color.value)
        );
      }
    }
  }

  return block;
}

// Empty strings (not null) keep `<select>` placeholders visible after reset.
const defaultValues = {
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
  sizes: [createDefaultBlock()],
};

function buildInitialFormValues(pageData?: PageData | null) {
  return {
    ...defaultValues,
    sizes: [
      createDefaultBlockWithDefaults({
        colors: pageData?.t_shirts_colors || [],
        placementList: pageData?.t_shirts_print_placements || [],
        shirtPrices: pageData?.t_shirts_prices || [],
        typeCatalog: pageData?.t_shirts_type_catalog || [],
      }),
    ],
  };
}

function resolveUploadFileName(file: any) {
  if (file?.name) return file.name;
  if (file?.filename) return file.filename;
  const fromKey = typeof file?.key === "string" ? file.key.split("/").pop() : "";
  if (fromKey) return fromKey;
  return "t-shirt-upload";
}

function getReadyUploadFiles(files: any) {
  return getValidFiles(files).filter(
    (file: any) =>
      file?.status === "uploaded" && file?.url && file?.key && resolveUploadFileName(file)
  );
}

function hasUploadsInProgress(sizes: any[]) {
  return (sizes || []).some((block) =>
    (block?.placements || []).some((row: any) =>
      (row?.files || []).some((file: any) => file?.status === "uploading")
    )
  );
}


const parseConfiguredNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const TShirtsOrderForm = ({ data, areas }: props) => {
  const { tryCreateToken, tShirtsPrintingPrices, resetStripeElements, sessionId } = useApp();
  const formRef = useRef<any>();
  const [showLoading, setShowLoading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [price, setPrice] = useState<any>(
    parseConfiguredNumber(data?.min_price)
  );
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [orderValue, setOrderValue] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<any>(
    parseConfiguredNumber(data?.free_delivery_threshold)
  );
  const [shirtPrices, setShirtPrices] = useState<any>([]);
  const [shirtColors, setShirtColors] = useState<any>([]);
  const [placements, setPlacements] = useState<any>([]);
  const [shirtSizes, setShirtSizes] = useState<any>([]);
  const [typeCatalog, setTypeCatalog] = useState<any[]>([]);

  const validationSchema = useMemo(
    () => buildValidationSchema(typeCatalog, shirtSizes),
    [typeCatalog, shirtSizes]
  );

  const [initialValues, setInitialValues] = useState<any>(() =>
    buildInitialFormValues(data)
  );

  const resetForm = function () {
    // ImageDropzone keeps internal `localFiles` that ignore parent prop changes
    // after mount. A fresh `size.id` remounts the row (upload slots + dropzones).
    formRef.current.resetForm({
      values: buildInitialFormValues({
        ...data,
        t_shirts_colors: shirtColors,
        t_shirts_print_placements: placements,
        t_shirts_prices: shirtPrices,
        t_shirts_type_catalog: typeCatalog,
      }),
    });
    setPercentageUploaded(0);
    calculatePrice();
    resetStripeElements();
  };

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    if (!formikValues) return {};
    return formikValues;
  };

  function getPrintTypes() {
    return Array.from(
      new Set(shirtPrices.map((r: any) => r.print_type).filter(Boolean))
    );
  }

  function getShirtTypesForPrintType(printType: string) {
    return Array.from(
      new Set(
        shirtPrices
          .filter((r: any) => r.print_type === printType)
          .map((r: any) => r.value)
      )
    ).filter((shirtType) => isShirtTypeActive(typeCatalog, shirtType));
  }

  function getBlockColorOptions(block: any) {
    if (!block?.shirt_type) return [];
    return getColorsForShirtType(typeCatalog, block.shirt_type, shirtColors);
  }

  function getVariantSizeOptions(block: any, variant: any) {
    if (!block?.shirt_type) return [];
    return getSizesForShirtTypeAndColor(
      typeCatalog,
      block.shirt_type,
      variant?.shirt_color || "",
      shirtSizes
    );
  }

  function buildVariantsForShirtType(shirtType: string) {
    if (!shirtType) return [createDefaultVariant()];
    const colors = getColorsForShirtType(typeCatalog, shirtType, shirtColors);
    if (!colors.length) {
      return [createDefaultVariant()];
    }
    return colors.map((color: any) => ({
      id: generateUniqueKey(),
      shirt_color: color.value,
      shirt_size: "",
      quantity: "0",
    }));
  }

  function parseDisplayQuantity(value: unknown) {
    const qty = Number(value);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 0) {
      return 0;
    }
    return qty;
  }

  function calculateBlockPrice(block: any) {
    if (!block?.shirt_type || !block?.print_type) return 0;

    let total = 0;

    (block.variants || []).forEach((variant: any) => {
      const qty = parseQuantity(variant?.quantity);
      if (!variant?.shirt_size || qty < 1) return;
      total += getTShirtLinePrintPrice(
        shirtPrices,
        block.print_type,
        block.shirt_type,
        qty
      );
    });

    total += calculateTShirtExtraPlacementTotal(
      placements,
      block.placements,
      block.variants
    );

    return parseFloat(total.toFixed(2));
  }

  function getBlockPlacementFees(block: any): PlacementFeeLine[] {
    return getTShirtPlacementFeeLines(
      placements,
      block?.placements,
      block?.variants
    );
  }

  function calculateSingleLinePrice(line: any) {
    return calculateBlockPrice(line);
  }

  function parseQuantity(value: unknown) {
    const qty = Number(value);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
      return 0;
    }
    return qty;
  }

  function calculateTotalPrice(sizes: any) {
    let totalPrice = 0;
    (sizes || []).forEach((size: any) => {
      if (size.hasOwnProperty("isSelected") && !size.isSelected) return;
      totalPrice += calculateSingleLinePrice(size);
    });
    return totalPrice;
  }

  function calculatePrice() {
    setTimeout(() => {
      setPrice(0);
      setOrderValue(0);
      let newOrderValue = 0;
      let newDeliveryCharges = 0;
      const { sizes, area } = getFormikValues();

      let value = newOrderValue + calculateTotalPrice(sizes);
      value = parseFloat(value.toFixed(2));
      newOrderValue = value;

      const minPrice = parseConfiguredNumber(data?.min_price);
      if (minPrice > 0 && newOrderValue < minPrice) {
        newOrderValue = minPrice;
      }
      setOrderValue(newOrderValue);
      setPrice(newOrderValue);

      if (checkFreeDelivery(newOrderValue, freeDeliveryThreshold)) {
        newDeliveryCharges = 0;
      } else {
        newDeliveryCharges = getDeliveryCharges(
          tShirtsPrintingPrices,
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
    formSubmission(FORM_NAME, "form_submission_error");
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

    if (hasUploadsInProgress(sizes)) {
      Swal.fire({
        icon: "error",
        title: "Upload in progress",
        text: "Please wait until all files finish uploading before placing your order.",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
      return;
    }

    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart(FORM_NAME);
      if (token === undefined || token === "") {
        console.log("Error while getting token");
        formSubmission(FORM_NAME, "form_submission_error", {
          text: "Error while getting token",
        });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        try {
        sizes &&
          sizes?.forEach((block: any, blockIndex: number) => {
            if (!block?.shirt_type || !block?.print_type) return;

            const validVariants = (block.variants || []).filter(
              (variant: any) =>
                variant?.shirt_size && parseQuantity(variant?.quantity) > 0
            );
            if (!validVariants.length) return;

            const blockPlacementTotal = calculateTShirtExtraPlacementTotal(
              placements,
              block.placements,
              validVariants
            );

            validVariants.forEach((variant: any, variantIndex: number) => {
              const lineKey = `${block.id}_${blockIndex}_${variant.id}`;

              (block.placements || []).forEach((row: any) => {
                const validFiles = getReadyUploadFiles(row.files);
                validFiles.forEach((file: any) => {
                  const originalName = resolveUploadFileName(file);
                  const parts = originalName.split(".");
                  const extension = parts.length > 1 ? parts.pop() : "jpg";
                  const baseName =
                    parts.length > 0 ? parts.join(".") : originalName;
                  const filename = `${baseName}_${block.shirt_type}.${extension}`;
                  filesMetaData.push({
                    filename,
                    url: file.url,
                    key: file.key,
                    size: lineKey,
                    field: row.placement || file.field || null,
                    placement: row.placement || file.placement,
                    placement_price:
                      file.placement_price ??
                      getPlacementUnitPrice(
                        placements,
                        row.placement,
                        getTShirtBlockTotalQuantity(validVariants)
                      ),
                  });
                });
              });

              const printPrice = getTShirtLinePrintPrice(
                shirtPrices,
                block.print_type,
                block.shirt_type,
                variant.quantity
              );
              const placementCharge =
                variantIndex === 0 ? blockPlacementTotal : 0;
              const placementFeeLines =
                variantIndex === 0
                  ? getTShirtPlacementFeeLines(
                      placements,
                      block.placements,
                      validVariants
                    )
                  : undefined;
              sizesMetaData.push({
                size: lineKey,
                shirt_type: block.shirt_type,
                shirt_size: variant.shirt_size,
                print_type: block.print_type,
                shirt_color: variant.shirt_color || "",
                quantity: parseQuantity(variant.quantity),
                print_price: printPrice,
                placement_charges: parseFloat(placementCharge.toFixed(2)),
                placement_fee_lines: placementFeeLines,
                price: parseFloat((printPrice + placementCharge).toFixed(2)),
              });
            });
          });
        fileUploading(FORM_NAME, filesMetaData, "started");

        formData.append("order_type", "t_shirt_print");
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
          String(getDeliveryCharges(tShirtsPrintingPrices, area, areas))
        );
        formData.append(
          "free_delivery",
          String(checkFreeDelivery(price, freeDeliveryThreshold))
        );

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

          fileUploading(FORM_NAME, filesMetaData, "completed");
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
                pushOrderLayer(FORM_NAME, object);
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
                  FORM_NAME,
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
                FORM_NAME,
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
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on care@ozelu.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
            }`,
            showLoaderOnConfirm: false,
            showLoaderOnDeny: false,
            loaderHtml: `<div></div>`,
          });
          formSubmission(FORM_NAME, "form_submission_error", {
            title: "Oops...",
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on care@ozelu.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
            }`,
          });
        }
      }
    }).catch(() => {
      setShowLoading(false);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while placing your order. Please try again.",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
    });
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer(FORM_NAME, type, value);
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

  async function handlePrivacyChange(e: any) {
    formRef.current.handleChange(e?.target?.name, e.target?.value);
  }

  function addTShirtLine(arrayHelpers: any) {
    arrayHelpers.push(
      createDefaultBlockWithDefaults({
        colors: shirtColors,
        placementList: placements,
        shirtPrices,
        typeCatalog,
      })
    );
  }

  function formatVariantDetails(block: any, variant: any) {
    const parts: string[] = [];
    if (block.print_type) parts.push(block.print_type);
    if (block.shirt_type) parts.push(block.shirt_type);
    if (variant.shirt_color) parts.push(variant.shirt_color);
    if (variant.shirt_size) parts.push(`Size ${variant.shirt_size}`);
    return parts.join(" - ");
  }

  function getRenderableBlocks(sizes: any[]) {
    return (sizes || []).filter((block) => {
      if (block?.hasOwnProperty("isSelected") && !block.isSelected) return false;
      if (!block?.shirt_type || !block?.print_type) return false;
      return (block.variants || []).some(
        (variant: any) =>
          !!variant?.shirt_size && parseQuantity(variant?.quantity) > 0
      );
    });
  }

  function renderPrices(sizes: any[]) {
    const blocks = getRenderableBlocks(sizes);
    if (!blocks.length) {
      return "";
    }

    const showBlockIndex = blocks.length > 1;

    return blocks.map((block, blockIndex) => {
      const variants = (block.variants || []).filter(
        (variant: any) =>
          !!variant?.shirt_size && parseQuantity(variant?.quantity) > 0
      );
      const placementFees = getBlockPlacementFees(block);

      return (
        <div key={block.id || blockIndex} className={blockIndex > 0 ? "mt-2" : undefined}>
          {variants.map((variant: any, variantIndex: number) => {
            const quantity = parseQuantity(variant.quantity);
            const printPrice = getTShirtLinePrintPrice(
              shirtPrices,
              block.print_type,
              block.shirt_type,
              quantity
            );
            const printUnitPrice = getTShirtUnitPrice(
              shirtPrices,
              block.print_type,
              block.shirt_type,
              quantity
            );
            const details = formatVariantDetails(block, variant);

            return (
              <div key={variant.id || variantIndex}>
                {details && (
                  <p className="mb-0">
                    {showBlockIndex ? `T-Shirt ${blockIndex + 1}: ` : ""}
                    {details}
                  </p>
                )}
                <p className="mb-0">
                  Print: {quantity} × {printUnitPrice} = {printPrice} AED
                </p>
              </div>
            );
          })}
          {placementFees.map((fee) => (
            <p key={fee.placement} className="mb-0">
              {fee.placement}:{" "}
              {fee.included ? "Included" : `${fee.price} AED`}
            </p>
          ))}
        </div>
      );
    });
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(tShirtsPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles(){
    const { sizes } = getFormikValues();
    const files = (sizes || []).flatMap((block: any) =>
      (block?.placements || []).flatMap((row: any) =>
        Array.isArray(row?.files) ? row.files : []
      )
    );
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
    const minPrice = parseConfiguredNumber(data?.min_price);
    setPrice(minPrice);
    setFreeDeliveryThreshold(parseConfiguredNumber(data?.free_delivery_threshold));
    const prices = data?.t_shirts_prices || [];
    if (prices.length > 0) {
      setShirtPrices(prices);
    }
    const colors = data?.t_shirts_colors || [];
    setShirtColors(colors);
    const placementList = data?.t_shirts_print_placements || [];
    setPlacements(placementList);
    setShirtSizes(data?.t_shirts_sizes || []);
    const catalog = data?.t_shirts_type_catalog || [];
    setTypeCatalog(catalog);

    if (formRef.current?.values?.sizes) {
      const currentSizes = formRef.current.values.sizes;
      let shouldUpdate = false;
      const nextSizes = currentSizes.map((block: any) => {
        let nextBlock = { ...block };

        if (placementList.length) {
          const nextPlacements = (block.placements || []).map(
            (row: any, rowIndex: number) => {
              if (!row.placement && rowIndex === 0) {
                shouldUpdate = true;
                return { ...row, placement: placementList[0].value };
              }
              return row;
            }
          );
          nextBlock = { ...nextBlock, placements: nextPlacements };
        }

        // Preselect first Printing Method + Shirt Type so variants show on load.
        if (!nextBlock.print_type || !nextBlock.shirt_type) {
          const defaults = createDefaultBlockWithDefaults({
            colors,
            placementList,
            shirtPrices: prices,
            typeCatalog: catalog,
          });
          if (!nextBlock.print_type && defaults.print_type) {
            shouldUpdate = true;
            nextBlock.print_type = defaults.print_type;
          }
          if (!nextBlock.shirt_type && defaults.shirt_type) {
            shouldUpdate = true;
            nextBlock.shirt_type = defaults.shirt_type;
            nextBlock.variants = defaults.variants;
          }
        }

        return nextBlock;
      });
      if (shouldUpdate) {
        formRef.current.setFieldValue("sizes", nextSizes);
      }
    }

    calculatePrice();
  }, [data]);

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
    //console.log(firstCity)
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
        validationSchema={validationSchema}
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
          //console.log("values>>", values);
          return (
            <form
              className="order-form container mb-5"
              onSubmit={(event) => {
                event.preventDefault();
                validateForm().then((errors) => {
                  if (errors && Object.keys(errors).length !== 0) {
                    Swal.fire({
                      icon: "error",
                      title: "Validation Error",
                      text: `Please fill all fields!`,
                      showLoaderOnConfirm: false,
                      showLoaderOnDeny: false,
                      loaderHtml: `<div></div>`,
                    });
                    formSubmission(
                      FORM_NAME,
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
              <CheckoutActivityFormTracker orderType="T_SHIRT_PRINT" />
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
                        pushDatalyer(FORM_NAME, "First Name")
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
                        pushDatalyer(FORM_NAME, "Last Name")
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
                      onFocus={() =>
                        pushDatalyer(FORM_NAME, "Email")
                      }
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
                        pushDatalyer(FORM_NAME, "Phone Number")
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
                      className="selectOptionsCustom new-custom-field-rf w-100"
                      value={values.address}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() =>
                        pushDatalyer(FORM_NAME, "Address")
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
                          FORM_NAME,
                          "Privacy Preference",
                          e.target?.value
                        );
                      }}
                      onFocus={() =>
                        pushDatalyer(
                          FORM_NAME,
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
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`privacy`}
                    />
                  </div>
                </div>

                <div className="formControll mt-3">
                  <FieldArray
                    name="sizes"
                    render={(arrayHelpers) => {
                      return (
                        <>
                          {values.sizes && values.sizes.length > 0 && (
                            <>
                              {values.sizes.map(
                                (block: any, index: any) => {
                                  return (
                                    <div
                                      className="custom-sizes-container t-shirt-block"
                                      key={block.id}
                                    >
                                      {values.sizes.length > 1 && (
                                        <div className="formContainer">
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
                                        </div>
                                      )}

                                      <div className="formContainer t-shirt-block__top-selects">
                                        <div className="formControll">
                                          <label className="order-option-label">
                                            Printing Method
                                          </label>
                                          <SearchableSelect
                                            value={block.print_type}
                                            type="print_type"
                                            placeholder="Choose Your Printing Method"
                                            options={getPrintTypes().map((t) => ({
                                              value: t,
                                              label: t,
                                            }))}
                                            onChangeHandler={async (
                                              _: string,
                                              value: string
                                            ) => {
                                              await setFieldValue(
                                                `sizes[${index}].print_type`,
                                                value
                                              );
                                              await setFieldValue(
                                                `sizes[${index}].shirt_type`,
                                                ""
                                              );
                                              await setFieldValue(
                                                `sizes[${index}].variants`,
                                                [createDefaultVariant()]
                                              );
                                              calculatePrice();
                                            }}
                                          />
                                          <RenderErrorMessage
                                            errors={errors}
                                            touches={touched}
                                            name={`sizes[${index}].print_type`}
                                          />
                                        </div>
                                        <div className="formControll">
                                          <label className="order-option-label">
                                            Shirt Type
                                          </label>
                                          <SearchableSelect
                                            value={block.shirt_type}
                                            type="shirt_type"
                                            placeholder="Choose Your Shirt Type"
                                            noOptionsMessage={() =>
                                              block.print_type
                                                ? "No shirt types found"
                                                : "Select printing method first"
                                            }
                                            options={getShirtTypesForPrintType(
                                              block.print_type
                                            ).map((t) => ({
                                              value: t,
                                              label: t,
                                            }))}
                                            onChangeHandler={async (
                                              _: string,
                                              value: string
                                            ) => {
                                              await setFieldValue(
                                                `sizes[${index}].shirt_type`,
                                                value
                                              );
                                              await setFieldValue(
                                                `sizes[${index}].variants`,
                                                buildVariantsForShirtType(value)
                                              );
                                              calculatePrice();
                                            }}
                                          />
                                          <RenderErrorMessage
                                            errors={errors}
                                            touches={touched}
                                            name={`sizes[${index}].shirt_type`}
                                          />
                                        </div>
                                      </div>

                                      <div className="formControll t-shirt-variants-section">
                                        <label className="order-option-label">
                                          Shirt Variants (Shirt Color, Size &amp;
                                          Quantity)
                                        </label>
                                        {!block.shirt_type ? (
                                          <p className="text-muted small mb-0">
                                            Select a shirt type to see all available colors.
                                          </p>
                                        ) : (
                                          <>
                                            <div className="t-shirt-variants-grid smart_scroll">
                                              {(block.variants || []).map(
                                                (variant: any, vIndex: number) => {
                                                  const blockColors =
                                                    getBlockColorOptions(block);
                                                  const colorEntry = blockColors.find(
                                                    (color: any) =>
                                                      color.value === variant.shirt_color
                                                  );
                                                  const variantSizes =
                                                    getVariantSizeOptions(block, variant);
                                                  const qty = parseDisplayQuantity(
                                                    variant.quantity
                                                  );
                                                  const priceQty = qty > 0 ? qty : 1;
                                                  const unitPrice =
                                                    block.print_type && block.shirt_type
                                                      ? getTShirtUnitPrice(
                                                          shirtPrices,
                                                          block.print_type,
                                                          block.shirt_type,
                                                          priceQty
                                                        )
                                                      : 0;
                                                  const lineTotal =
                                                    block.print_type &&
                                                    block.shirt_type &&
                                                    qty > 0
                                                      ? getTShirtLinePrintPrice(
                                                          shirtPrices,
                                                          block.print_type,
                                                          block.shirt_type,
                                                          qty
                                                        )
                                                      : 0;

                                                  return (
                                                    <div
                                                      key={variant.id || vIndex}
                                                      className="t-shirt-variant-card-wrap"
                                                    >
                                                      <TShirtVariantCard
                                                        colorImage={colorEntry?.image}
                                                        sizeOptions={variantSizes}
                                                        shirtColor={
                                                          variant.shirt_color || ""
                                                        }
                                                        shirtSize={
                                                          variant.shirt_size || ""
                                                        }
                                                        quantity={qty}
                                                        unitPrice={unitPrice}
                                                        lineTotal={lineTotal}
                                                        onSizeChange={(value) => {
                                                          setFieldValue(
                                                            `sizes[${index}].variants[${vIndex}].shirt_size`,
                                                            value
                                                          );
                                                          calculatePrice();
                                                        }}
                                                        onQuantityChange={(value) => {
                                                          setFieldValue(
                                                            `sizes[${index}].variants[${vIndex}].quantity`,
                                                            String(value)
                                                          );
                                                          calculatePrice();
                                                        }}
                                                      />
                                                      {qty > 0 && (
                                                        <>
                                                          <RenderErrorMessage
                                                            errors={errors}
                                                            touches={touched}
                                                            name={`sizes[${index}].variants[${vIndex}].shirt_size`}
                                                          />
                                                          <RenderErrorMessage
                                                            errors={errors}
                                                            touches={touched}
                                                            name={`sizes[${index}].variants[${vIndex}].quantity`}
                                                          />
                                                        </>
                                                      )}
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                            <RenderErrorMessage
                                              errors={errors}
                                              touches={touched}
                                              name={`sizes[${index}].variants`}
                                            />
                                          </>
                                        )}
                                      </div>

                                      <div className="t-shirts-placement-section">
                                        <TShirtFileUploadRow
                                          rows={block.placements || []}
                                          placements={placements}
                                          blockTotalQty={getTShirtBlockTotalQuantity(
                                            block.variants
                                          )}
                                          setRows={(rows: any) => {
                                            setFieldValue(
                                              `sizes[${index}].placements`,
                                              rows
                                            );
                                            setFieldTouched(
                                              `sizes[${index}].placements`,
                                              true,
                                              true
                                            );
                                            calculatePrice();
                                          }}
                                          onPriceChange={calculatePrice}
                                        />
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
                              onClick={() => addTShirtLine(arrayHelpers)}
                            >
                              Add Another T-Shirt
                            </button>
                          </div>
                        </>
                      );
                    }}
                  />
                </div>

                <div className="formControll greeting-card-comments-block">
                  <div className="formControll any-comments">
                    <label htmlFor="people">Any Comments</label>
                    <textarea
                      data-formControlName="comments"
                      typeof="textarea"
                      value={values.comments}
                      onFocus={() =>
                        pushDatalyer(FORM_NAME, "Any Comments")
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
                    {renderPrices(values?.sizes)}
                    <p className="mt-2 mb-0">Sub Total: {price} AED</p>
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

export default TShirtsOrderForm;
