"use client";
import React, { useRef, useState, useEffect } from "react";
import { Field, Formik, FieldArray } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
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
  getDeliveryCharges,
  convertLength,
  getValidFiles,
} from "@/helpers/generals";
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
import FileDropzone from "@/components/Dropzones/FileDropzone";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import DeliveryChargesLine from "@/components/DeliveryChargesLine";
import { DOCUMENT_FILE_TYPES } from "@/constants/uploadSupportedTypes";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadProgress from "@/components/FileUploadProgress";
import {
  buildLaminationSelectOptions,
  getCertificateLaminationBreakdownForSize,
  getCertificateLaminationTotalForFiles,
  getCertificateSizePriceKey,
  getLaminationUnitPrice,
  hasConfiguredCertificateLaminations,
} from "@/libs/certificatePrintingPricing";

const CppOrderForm = ({ data, areas }: any) => {
  const minPrice = data?.min_price === undefined ? 0 : data?.min_price;
  const certificateLaminations = Array.isArray(data?.certificate_laminations)
    ? data.certificate_laminations
    : [];
  const showCertificateLamination = hasConfiguredCertificateLaminations(
    certificateLaminations,
  );

  const { tryCreateToken, certificatesPrintingPrices, resetStripeElements,sessionId } = useApp();
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
  const [prices, setPrices] = useState<any>(null);
  const [types, setTypes] = useState<any>([]);
  const [finishings, setFinishings] = useState<any>([]);

  // console.log(data, areas, certificatesPrintingPrices);

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
    sizes: data?.certificates_prices?.map((size: any) => {
      return { ...size, isSelected: false, files: [], custom: false };
    }),
  });

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

  function calculateTotalFinishingPrice(finishings: any, sizesList: any) {
    let totalFinishingPrice = 0;

    sizesList.forEach((size: any) => {
      if (!size.isSelected) return;
      // 🔹 Filter out failed files
      const validFiles = getValidFiles(size.files);
      validFiles.forEach((file: any) => {
        const finishingPricing = finishings.find(
          (f: any) => f.value === file.finishing
        );
        if (finishingPricing) {
          totalFinishingPrice += parseFloat(finishingPricing.price) || 0;
        }
      });
    });

    return totalFinishingPrice;
  }

  function calculateTotalLaminationPrice(
    laminations: any[],
    sizesList: any[],
  ) {
    if (!laminations?.length) return 0;
    let total = 0;
    sizesList.forEach((size: any, index: number) => {
      if (!size.isSelected) return;
      const sizeKey = getCertificateSizePriceKey(size, index);
      total += getCertificateLaminationTotalForFiles(
        laminations,
        sizeKey,
        size.files,
      );
    });
    return total;
  }

  function calculateTotalPrice(prices: any, sizesList: any) {
    let totalPrice = 0;

    sizesList.forEach((size: any) => {
      if (!size.isSelected) return;
      const sizePricing = prices.find((p: any) => p._id === size._id);
      if (!sizePricing || !size?.files?.length) return;

      // Filter out failed files
      const validFiles = getValidFiles(size.files);

      // Group files by type and sum their quantities
      const typeQuantities: Record<string, number> = {};

      validFiles.forEach((file: any) => {
        const count = parseInt(file.count) || 0;
        const pages = parseInt(file.pages) || 1;
        typeQuantities[file.simpleType] =
          (typeQuantities[file.simpleType] || 0) + count * pages;
      });

      // Calculate price based on total quantity per type
      for (const [type, totalQuantity] of Object.entries(typeQuantities)) {
        const typePricing = sizePricing.types.find(
          (t: any) => t.value === type
        );
        if (!typePricing) continue;

        let applicableDiscount = typePricing.price;

        // Find applicable discount based on total quantity range
        for (const discount of typePricing.discounts) {
          if (matchesRange(discount.range, totalQuantity)) {
            applicableDiscount = discount.price;
            break;
          }
        }

        totalPrice += applicableDiscount * totalQuantity;
      }
    });

    return totalPrice;
  }

  function calculatePriceForSize(prices: any, size: any) {
    if (!size.isSelected) return [];

    const sizePricing = prices.find((p: any) => p._id === size._id);
    if (!sizePricing) return [];

    // Filter out failed files
    const validFiles = getValidFiles(size.files);

    let typeMap: any = {};

    validFiles.forEach((file: any) => {
      if (!typeMap[file.simpleType]) {
        typeMap[file.simpleType] = { type: file.simpleType, quantity: 0 };
      }
      typeMap[file.simpleType].quantity += file.count * (file?.pages ? file.pages : 1);
    });

    for (const type in typeMap) {
      const typePricing = sizePricing.types.find((t: any) => t.value === type);
      if (!typePricing) continue;

      let applicableDiscount = typePricing.price;
      for (const discount of typePricing.discounts) {
        if (matchesRange(discount.range, typeMap[type].quantity)) {
          applicableDiscount = discount.price;
          break;
        }
      }

      typeMap[type].price = applicableDiscount;
    }

    return Object.values(typeMap);
  }

  function calculatePriceForFinishing(finishings: any, size: any): any {
    if (!size.isSelected) return [];

    const validFiles = getValidFiles(size.files);

    let finishingMap: any = {};

    validFiles.forEach((file: any) => {
      if (!finishingMap[file.finishing]) {
        finishingMap[file.finishing] = {
          finishing: file.finishing,
          quantity: 0,
        };
      }
      finishingMap[file.finishing].quantity += 1; // Each file counts as 1 regardless of its count
    });

    for (const finishing in finishingMap) {
      const finishingPricing = finishings.find(
        (f: any) => f.value === finishing
      );
      if (!finishingPricing) continue;

      finishingMap[finishing].price = finishingPricing.price;
    }

    return Object.values(finishingMap);
  }

  function checkFilesLoadings(sizes:any){
    let isLoading = false;
    if(sizes && sizes?.length){
      sizes.forEach((size:any)=>{
        if(size && size?.files && size?.files?.length && size?.isSelected){
          size.files.forEach((file:any)=>{
            if(file?.loading) isLoading = true;
          })
        }
      })
    }

    return isLoading;
  }

  function calculatePrice() {
    setTimeout(() => {
      setPrice(0);
      setOrderValue(0);
      let newOrderValue = 0;
      let newDeliveryCharges = 0;
      const { sizes, area } = getFormikValues();

      let value =
        newOrderValue +
        calculateTotalPrice(prices, sizes) +
        calculateTotalFinishingPrice(finishings, sizes) +
        calculateTotalLaminationPrice(certificateLaminations, sizes);
      value = parseFloat(value.toFixed(2));
      newOrderValue = value;

      if (newOrderValue < data?.min_price) {
        newOrderValue = data?.min_price;
      }
      setOrderValue(newOrderValue);
      setPrice(newOrderValue);

      if (checkFreeDelivery(newOrderValue, freeDeliveryThreshold)) {
        newDeliveryCharges = 0;
      } else {
        newDeliveryCharges = getDeliveryCharges(
          certificatesPrintingPrices,
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
    formSubmission("Certificates Printing", "form_submission_attempt");
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

    let haveFiles = false;
    sizes &&
      sizes?.forEach((size: any) => {
        if (size.isSelected && size.files.length > 0) haveFiles = true;
      });
    if (!haveFiles) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please upload picture!",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
      formSubmission("Certificates Printing", "form_submission_error", {
        title: "Validation Error",
        text: "Please upload picture!",
      });
      return;
    }

    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart("Certificates Printing");
      if (token === undefined || token === "") {
        console.log("Error while getting token");
        formSubmission("Certificates Printing", "form_submission_error", {
          text: "Error while getting token",
        });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        sizes &&
          sizes?.forEach((size: any, sizeIndex: number) => {
            if (!size.isSelected) return;
            const validFiles = getValidFiles(size.files);
            const sizeKey = getCertificateSizePriceKey(size, sizeIndex);
            const name = `${size.width}cmX${size.height}cm (${convertLength(
              size.width,
              "cm"
            )}"x${convertLength(size.height, "cm")}" inches)`;
            validFiles.forEach((file: any) => {
              const extension = file.name.split(".").pop();
              const lamPart =
                file?.lamination && String(file.lamination).trim()
                  ? `_${String(file.lamination).replace(/\s+/g, "_").slice(0, 48)}`
                  : "";
              const filename = `${file.name
                .split(".")
                .slice(0, -1)
                .join(".")}_${name}${lamPart}_${file?.print}(${file.count}).${extension}`;
              const lamUnit = getLaminationUnitPrice(
                certificateLaminations,
                sizeKey,
                file?.lamination,
              );
              filesMetaData.push({
                filename,
                url: file.url,
                key: file.key,
                count: file.count,
                pages: file?.pages,
                totalPages: file?.totalPages,
                range: file?.range,
                rangeValue: file?.rangeValue,
                size: name,
                type: file?.simpleType,
                finishing: file?.finishing,
                lamination: file?.lamination || "",
                laminationUnitPrice: lamUnit,
                dimension: file?.print,
              });
            });

            let sizePrices: any = [];
            let finishingPrices: any = [];
            let laminationPrices: any = [];

            const sizeItems: any = calculatePriceForSize(prices, size);
            sizeItems.forEach((sizePrice: any) => {
              if (!sizePrice.price || sizePrice.quantity === 0) return;
              sizePrices.push({
                type: sizePrice.type,
                count: sizePrice.quantity,
                unitPrice: sizePrice.price,
                price: sizePrice.price * sizePrice.quantity,
              });
            });

            const finishingItems: any = calculatePriceForFinishing(
              finishings,
              size
            );
            finishingItems.forEach((finishingPrice: any) => {
              if (!finishingPrice.price || finishingPrice.quantity === 0)
                return;
              finishingPrices.push({
                finishing: finishingPrice.finishing,
                count: finishingPrice.quantity,
                unitPrice: finishingPrice.price,
                price: finishingPrice.price * finishingPrice.quantity,
              });
            });

            const laminationItems = getCertificateLaminationBreakdownForSize(
              certificateLaminations,
              sizeKey,
              size.files,
            );
            laminationItems.forEach((lamRow: any) => {
              if (!lamRow.total || lamRow.quantity === 0) return;
              laminationPrices.push({
                lamination: lamRow.type,
                count: lamRow.quantity,
                unitPrice: lamRow.unitPrice,
                price: lamRow.total,
              });
            });

            sizesMetaData.push({
              size: name,
              sizePrices,
              finishingPrices,
              laminationPrices,
            });
          });
        fileUploading("Certificates Printing", filesMetaData, "started");
        formData.append("order_type","certificate_print");
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
          String(getDeliveryCharges(certificatesPrintingPrices, area, areas))
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
          fileUploading("Certificates Printing", filesMetaData, "completed");
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
                pushOrderLayer("Certificates Printing", object);
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
                  "Certificates Printing",
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
              formSubmission("Certificates Printing", "form_submission_error", {
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
          formSubmission("Certificates Printing", "form_submission_error", {
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
    cityAreaLayer("Certificates Printing", type, value);
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

  function renderSizePrices(size: any, index: any) {
    const sizePrices = calculatePriceForSize(prices, size);
    return sizePrices.map((sizePrice: any, innerIndex: any) => {
      if (!sizePrice.price || sizePrice.quantity === 0) return "";
      return (
        <p key={index + "" + innerIndex}>
          {" "}
          {size.width}cm X {size.height}cm ({size.name}) - {sizePrice.type}:{" "}
          {sizePrice.quantity} Certificates x {sizePrice.price} AED ={" "}
          {sizePrice.price * sizePrice.quantity} AED
        </p>
      );
    });
  }

  function renderFinishingPrices(size: any, index: any) {
    const finishingPrices = calculatePriceForFinishing(finishings, size);
    return finishingPrices.map((finishingPrice: any, innerIndex: any) => {
      if (!finishingPrice.price || finishingPrice.quantity === 0) return "";
      return (
        <p key={index + "" + innerIndex}>
          {" "}
          {size.width}cm X {size.height}cm ({size.name}) -{" "}
          {finishingPrice.finishing}: {finishingPrice.quantity} Certificates x{" "}
          {finishingPrice.price} AED ={" "}
          {finishingPrice.price * finishingPrice.quantity} AED
        </p>
      );
    });
  }

  function renderLaminationPrices(size: any, index: number) {
    if (!showCertificateLamination) return null;
    const sizeKey = getCertificateSizePriceKey(size, index);
    const rows = getCertificateLaminationBreakdownForSize(
      certificateLaminations,
      sizeKey,
      size.files,
    );
    return rows.map((row, innerIndex) => (
      <p key={`${index}-lam-${innerIndex}`}>
        {" "}
        {size.width}cm X {size.height}cm ({size.name}) - {row.type}:{" "}
        {row.quantity} Prints x {row.unitPrice} AED = {row.total.toFixed(2)}{" "}
        AED
      </p>
    ));
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(certificatesPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles(){
    const { sizes } = getFormikValues();
    const files = (sizes || [])
        .filter((size:any) => size?.isSelected) // only selected sizes
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
    //console.log("SIzes", data?.sizes);
    setPrice(minPrice);
    setSizes(data?.certificates_prices);
    setPrices(data?.certificates_prices);
    if (
      data?.certificates_prices &&
      data.certificates_prices.length > 0 &&
      data.certificates_prices[0]?.types &&
      data.certificates_prices[0].types[0]
    ) {
      setTypes(
        data?.certificates_prices[0].types.map((type: any) => type.value)
      );
    }
    if (
      data?.certificates_finishing_types &&
      data.certificates_finishing_types.length > 0
    ) {
      setFinishings(data.certificates_finishing_types);
    }
    setInitialValues({
      ...initialValues,
      sizes: data?.certificates_prices?.map((size: any) => {
        return { ...size, isSelected: false, files: [], custom: false };
      }),
    });
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
    sizes: Yup.array().of(
      Yup.object().shape({
        files: Yup.array()
          // .test(
          //   "fileSize",
          //   "Per file size should not exceed 10MB, please use an online tool to compress the photos greater than 10MB and re-upload",
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
            "simpleType",
            "Type is missing for one or more files.",
            function (files: any, { parent }) {
              const { isSelected } = parent;
              if (!isSelected || !files || files.length === 0) {
                return true;
              }
              if (files && files.length > 0) {
                for (const file of files) {
                  if (file.simpleType == "") {
                    return false;
                  }
                }
                return true;
              } else {
                return true;
              }
            }
          )
          .test(
            "finishing",
            "Finishing is missing for one or more files.",
            function (files: any, { parent }) {
              const { isSelected } = parent;
              if (!isSelected || !files || files.length === 0) {
                return true;
              }
              if (files && files.length > 0) {
                for (const file of files) {
                  if (file.finishing == "") {
                    return false;
                  }
                }
                return true;
              } else {
                return true;
              }
            }
          ),
      })
    ),
  });

  return (
    <div
      className="photo-printing-form--wrapper certificate-printing-form--wrapper order-form--wrapper"
      id="orderForm"
    >
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
          // console.log("values>>", values);
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
                      text: `${
                        errors?.sizes
                          ? "Please check the size of the photos you have uploaded, each file should be less than a maximum of 10mb"
                          : "Please fill all fields!"
                      }`,
                      showLoaderOnConfirm: false,
                      showLoaderOnDeny: false,
                      loaderHtml: `<div></div>`,
                    });
                    formSubmission(
                      "Certificates Printing",
                      "form_submission_error",
                      {
                        title: "Validation Error",
                        text: `${
                          errors?.sizes
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
              <CheckoutActivityFormTracker orderType="CERTIFICATE_PRINT" />
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
                        pushDatalyer("Certificates Printing", "First Name")
                      }
                      placeholder="Please Write Your First Name"
                      name="firstname"
                      id="firstname"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name="firstname"
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
                        pushDatalyer("Certificates Printing", "Last Name")
                      }
                      placeholder="Please Write Your Last Name"
                      name="lastname"
                      id="lastname"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name="lastname"
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
                        pushDatalyer("Certificates Printing", "Email")
                      }
                      placeholder="Please Write Your Email"
                      name="email"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name="email"
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
                        pushDatalyer("Certificates Printing", "Phone Number")
                      }
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name="phone"
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
                      name="city"
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
                      name="area"
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
                        pushDatalyer("Certificates Printing", "Address")
                      }
                      id="address"
                      name="address"
                      placeholder="Please Write Your Address"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name="address"
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
                          "Certificates Printing",
                          "Privacy Preference",
                          e.target?.value
                        );
                      }}
                      onFocus={() =>
                        pushDatalyer(
                          "Certificates Printing",
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
                      name="privacy"
                    />
                  </div>
                </div>
                <br />
                <div className="formControll">
                  <label className="fw-medium font-secondary order-option-label">
                    Please Choose From The Sizes Below You Would Like to Print
                  </label>
                </div>
                <div className="formControll">
                  <FieldArray
                    name="sizes"
                    render={(arrayHelpers) => {
                      return (
                        <>
                          {values.sizes && values.sizes.length > 0 && (
                            <>
                              {values?.sizes?.map((size: any, index: any) => {
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
                                            "Certificates Printing",
                                            `${size.width}cmx${size.height}cm
                                      ${
                                        size.name
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
                                        {size.width}cmx{size.height}cm{" "}
                                        {size.name
                                          ? "- " + size.name + " Size "
                                          : " "}
                                        <FileUploadingStatus files={size.files}/>
                                      </label>
                                      <br />
                                    </div>
                                    {size.isSelected && (
                                      <>
                                        <div className="custom-dropzone--container">
                                          <FileDropzone
                                            orderType="CERTIFICATE_PRINT"
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
                                            pages={0}
                                            setPages={() => {}}
                                            showCounters={true}
                                            types={types}
                                            finishings={finishings}
                                            showCertificateLamination={
                                              showCertificateLamination
                                            }
                                            laminationOptions={buildLaminationSelectOptions(
                                              certificateLaminations,
                                              getCertificateSizePriceKey(
                                                size,
                                                index,
                                              ),
                                            )}
                                            showStapling={false}
                                            zoom={true}
                                            data={data}
                                          />
                                          <UploadInfoLabel
                                            supportedTypes={DOCUMENT_FILE_TYPES}
                                          />
                                          {/* <ImageDropzone
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
                                            finishings={finishings}
                                            types={types}
                                            zoom={true}
                                          /> */}

                                          <RenderErrorMessage
                                            errors={errors}
                                            touches={touched}
                                            name={`sizes[${index}].files`}
                                          />
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
                        pushDatalyer("Certificates Printing", "Any Comments")
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
                      if (!size.isSelected) return "";
                      return renderSizePrices(size, index);
                    })}
                    {values?.sizes?.map((size: any, index: any) => {
                      if (!size.isSelected) return "";
                      return renderFinishingPrices(size, index);
                    })}
                    {values?.sizes?.map((size: any, index: any) => {
                      if (!size.isSelected) return "";
                      return renderLaminationPrices(size, index);
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
                  <button type="submit" id="tap-btn" disabled={checkFilesLoadings(values?.sizes)}>
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

export default CppOrderForm;
