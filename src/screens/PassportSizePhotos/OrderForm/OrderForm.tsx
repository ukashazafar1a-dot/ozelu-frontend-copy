"use client";
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { Formik } from "formik";
import Swal from "sweetalert2";
// import { purposes } from '../../../utils';
import useApp from "@/store/useApp";
import axios from "axios";
import Loading from "@/components/Loading";
import SearchableSelect from "@/components/SearchableSelect";
import FileDropzonePDFOnly from '@/components/Dropzones/FileDropzonePDFOnly';
import showCustomPopup from "@/components/NoSwal";
import {
  checkFileSizeValidity,
  getAreaSet,
  getBindingPrices,
  getFilesCalculatedPrice,
  getFilesLaminationPrice,
  getFilesPages,
  getTheRangePrice,
  getValidFiles,
  hasValidFiles,
} from "@/helpers/generals";
import FileDropzone from "@/components/Dropzones/FileDropzone";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import {
  PASSPORT_DOCUMENT_PRINT_TYPES,
  PASSPORT_PHOTO_FILE_TYPES,
} from "@/constants/uploadSupportedTypes";
import { PageData } from "@/libs/types";
import { sortArrayAlphabetically } from "@/libs/utils";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadProgress from "@/components/FileUploadProgress";
import { cityAreaLayer, formSubmission, pushDatalyer, pushDropdownLayer, pushOrderLayer, stripeStart } from "@/datalayers/CP";

declare global {
  interface Window {
    __exampleLocale: any;
    Stripe: any;
    Flickity: any;
  }
}

type props = {
  data: PageData;
  areas: any;
};

/** Two-decimal snap for AED totals (avoids IEEE-754 tails in UI and order payload). */
function roundCurrency(value: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return parseFloat(n.toFixed(2));
}

const OrderForm = ({ data, areas }: props) => {
  const { purposes, passportSizePrices, sessionId } = useApp();
  const [stripe, setStripe] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState(null);
  const [areaOptions, setAreaOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const formRef = useRef<any>();
  const [dummyImages, setDummyImages] = useState<any>([]);
  const [showLoading, setShowLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesValid, setFilesValid] = useState(true);
  const [filesValidSize, setFilesValidSize] = useState(true);
  const [stripeElements, setStripeElements] = useState<any>(null);
  const [softCities, setSoftCities] = useState<any>([]);
  const [price, setPrice] = useState<any>(
    roundCurrency(data?.min_price ? data.min_price : 0)
  );
  // Document Printing states
  const [totalA4PrintPages, setTotalA4PrintPages] = useState<any>({
    colorPrint: 0,
    blackAndWhite: 0,
  });
  const [totalA3PrintPages, setTotalA3PrintPages] = useState<any>({
    colorPrint: 0,
    blackAndWhite: 0,
  });

  const [filesForColorPrint, setFilesForColorPrint] = useState<any>({
    a3: [],
    a4: [],
  });
  const [filesForBlackAndWhitePrint, setFilesForBlackAndWhitePrint] =
    useState<any>({
      a3: [],
      a4: [],
    });
  const [filesForA4PrintValid, setFilesForA4PrintValid] = useState<any>({
    colorPrint: true,
    blackAndWhitePrint: true,
  });

  const [filesForA3PrintValid, setFilesForA3PrintValid] = useState<any>({
    colorPrint: true,
    blackAndWhitePrint: true,
  });
  const [laminationPrices, setLaminationPrices] = useState<any>([])
  const [bindingPrices, setBindingPrices] = useState<any>([])

  // Document Printing states - End

  // console.log("Data",data)

  const openButton = useRef<any>();
  const closeButton = useRef<any>();
  const initialValues = {
    service: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    area: "",
    city: "",
    numberOfPeople: "",
    perPersonPhotos: "",
    purpose: "",
    price: "0",
    comments: "",
    size: "",
    bgColor: "",
    docPrint: false,
    A4Print: false,
    A3Print: false,
  };


  const validator = function (values: any) {
    const errors: any = {};
    if (!values.service) errors.service = "Required";
    if (!values.firstname) errors.firstname = "Required";
    if (!values.lastname) errors.lastname = "Required";
    if (!values.phone) errors.phone = "Required";
    if (values.service != "Soft Copy By Email") {
      if (!values.area) errors.area = "Required";
      if (!values.perPersonPhotos) errors.perPersonPhotos = "Required";
      if (!values.address) errors.address = "Required";
      if (values.purpose === "Other") {
        if (!values.size) errors.size = "Required";
        if (!values.bgColor) errors.bgColor = "Required";
      }
    }

    if (!values.numberOfPeople) errors.numberOfPeople = "Required";
    if (!values.purpose) errors.purpose = "Required";
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    //formSubmissionError(errors);
    return errors;
  };

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    return formikValues;
  };

  function onChangeService(e: any) {
    pushDropdownLayer("Passport Size Photos", "Service", e.currentTarget?.value);
    if (e.currentTarget.value === "Soft Copy By Email") {
      //   setPrice(40);
      if (formRef.current) formRef.current.setFieldValue('docPrint', false);
      calculatePrice();
    } else {
      calculatePrice();
    }
    // this.orderForm.patchValue({ price: this.price });
  }

  const getOptionPrice = (type: any, size: any, files: any) => {
    // 1. check if there is any valume based pricing.
    // 2. if no volume based pricing apply standard pricing.
    // 3. if non of above there return 0.
    let finalPrice = 0;
    if (data?.document_volume_prices && data?.document_volume_prices[0].prices.length > 0) {
      finalPrice = getTheRangePrice(data.document_volume_prices, size, type, files)
    } else if (data?.options) {
      const selectedOption = data?.options?.find(
        (option: any) => option.type === type && option.size === size
      );
      if (selectedOption) finalPrice = selectedOption.price;
    }
    return parseFloat(finalPrice.toFixed(2));;
  };

  const getServicePrice = () => {
    const { service, perPersonPhotos, area, numberOfPeople, A4Print, A3Print, docPrint }: any =
      getFormikValues();
    let passportSizePrice = 0;
    let initialPrice = data?.min_price ? data?.min_price : 0;
    if (service != "Soft Copy By Email") {
      let areaSet = getAreaSet(areas, area);
      let priceObj: any = passportSizePrices?.filter((item: any) => {
        return (
          item.areaset === areaSet && item.perPersonPhotos == perPersonPhotos
        );
      });
      if (priceObj.length > 0) {
        passportSizePrice = priceObj[0]?.price;
        initialPrice = priceObj[0]?.price;
      }

      passportSizePrice = Number(numberOfPeople || 1) * initialPrice;
      //   this.orderForm.patchValue({ price: this.price });
    } else {
      passportSizePrice = Number(numberOfPeople || 1) * initialPrice;
      //   this.orderForm.patchValue({ price: this.price });
    }
    return roundCurrency(passportSizePrice || 0);
  }

  const calculatePrice = async () => {
    let a4LaminationPrices: any = [];
    let a3LaminationPrices: any = [];
    let a4BindingPrices: any = [];
    let a3BindingPrices: any = [];
    setTimeout(() => {
      const { service, perPersonPhotos, area, numberOfPeople, A4Print, A3Print, docPrint }: any =
        getFormikValues();

      //Passport Page Prices

      let totalPrice = 0;
      let passportSizePrice = 0;
      let documentsPrintingPrice = 0;

      passportSizePrice = getServicePrice()
      //Passport Page Prices - END

      if (!docPrint || service === "Soft Copy By Email") {
        setPrice(roundCurrency(passportSizePrice));
        return;
      }

      //Documents Printing Prices

      if (A4Print) {
        documentsPrintingPrice = documentsPrintingPrice + getFilesCalculatedPrice(filesForColorPrint.a4, getOptionPrice("Color Print", "A4", filesForColorPrint.a4));
        documentsPrintingPrice = documentsPrintingPrice + getFilesCalculatedPrice(filesForBlackAndWhitePrint.a4, getOptionPrice("Black & White Print", "A4", filesForBlackAndWhitePrint.a4));
        a4LaminationPrices = getFilesLaminationPrice([...filesForColorPrint.a4, ...filesForBlackAndWhitePrint.a4], data?.document_laminations, 'a4')
        a4BindingPrices = getBindingPrices([...filesForColorPrint.a4, ...filesForBlackAndWhitePrint.a4], data?.document_bindings, 'a4')
      }
      if (A3Print) {
        documentsPrintingPrice = documentsPrintingPrice + getFilesCalculatedPrice(filesForColorPrint.a3, getOptionPrice("Color Print", "A3", filesForColorPrint.a3));
        documentsPrintingPrice = documentsPrintingPrice + getFilesCalculatedPrice(filesForBlackAndWhitePrint.a3, getOptionPrice("Black & White Print", "A3", filesForBlackAndWhitePrint.a3));
        a3LaminationPrices = getFilesLaminationPrice([...filesForColorPrint.a3, ...filesForBlackAndWhitePrint.a3], data?.document_laminations, 'a3')
        a3BindingPrices = getBindingPrices([...filesForColorPrint.a3, ...filesForBlackAndWhitePrint.a3], data?.document_bindings, 'a3')
      }
      setLaminationPrices([...a3LaminationPrices, ...a4LaminationPrices])
      setBindingPrices([...a3BindingPrices, ...a4BindingPrices])
      const totalLaminationPrice = [...a3LaminationPrices, ...a4LaminationPrices].reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      const totalBindingPrice = [...a3BindingPrices, ...a4BindingPrices].reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      documentsPrintingPrice = documentsPrintingPrice + totalLaminationPrice + totalBindingPrice;

      //Documents Printing Prices - END
      totalPrice = passportSizePrice + documentsPrintingPrice;
      if (totalPrice < data?.min_price) {
        setPrice(roundCurrency(data?.min_price ?? 0));
      } else {
        setPrice(roundCurrency(totalPrice));
      }
    }, 100);
  };

  function resetForm() {
    formRef.current.resetForm();
    setFiles([]);
    setPrice(roundCurrency(data?.min_price ? data.min_price : 0));
    if (stripeElements) {
      stripeElements?.cardNumberInstance?.clear();
      stripeElements?.cardExpiry?.clear();
      stripeElements?.cardCvc?.clear();
    }
    setTotalA4PrintPages({ colorPrint: 0, blackAndWhite: 0 });
    setTotalA3PrintPages({ colorPrint: 0, blackAndWhite: 0 });
    setFilesForColorPrint({ a3: [], a4: [] });
    setFilesForBlackAndWhitePrint({ a3: [], a4: [] });
    setFilesForA4PrintValid({ colorPrint: true, blackAndWhitePrint: true });
    setFilesForA3PrintValid({ colorPrint: true, blackAndWhitePrint: true });
    calculatePrice();
  }


  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer("Passport Size Photos", type, value);
    if (type === "city") {
      formRef?.current?.setFieldValue("area", "");
      const filteredAreas = areas?.filter((area: any) => area.city === value);
      const sortedAreas: any = sortArrayAlphabetically(filteredAreas);
      const options = sortedAreas?.map((area: any) => ({
        value: area?.name,
        label: area?.name,
      }));
      setAreaOptions(options);
    }
    formRef.current?.setFieldValue(type, value);
    await Promise.resolve();
    calculatePrice();
  }

  function onConfirm() {
    if (!data?.isActive) {
      //console.log(data)
      showCustomPopup(data?.alert_message);
      return;
    }
    // console.log(this.orderForm.value);
    closeButton?.current.click();

    setShowLoading(true);
    formSubmission("Passport Size Photos", "form_submission_attempt");
    tryCreateToken().then(async (token) => {
      //console.log("Log From then Fucntion: ", token);
      const {
        service,
        area,
        city,
        purpose,
        perPersonPhotos,
        numberOfPeople,
        size,
        bgColor,
        firstname,
        lastname,
        email,
        phone,
        address,
        comments,
        A4Print,
        A3Print,
      } = getFormikValues();
      if (token.status) {
        const formData = new FormData();

        let passportFilesMetaData: any = [];
        // For documents printing options
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        files.forEach((file: any) => {
          passportFilesMetaData.push({
            filename: file.name,
            key: file.key,
            url: file.url
          })
        });

        if (A4Print) {
          const validColorPrintFiles = getValidFiles(filesForColorPrint.a4);
          validColorPrintFiles.forEach((file: any) => {
            const extension = file.name.split(".").pop();
            const filename = `${file.name
              .split(".")
              .slice(0, -1)
              .join(".")}_color_print_a4_${file?.print}(${file.count
              }).${extension}`;
            filesMetaData.push({
              filename,
              key: file.key,
              url: file.url,
              count: file.count,
              pages: file?.pages,
              totalPages: file?.totalPages,
              range: file?.range,
              rangeValue: file?.rangeValue,
              dimension: file?.print,
              stapling: file?.stapling,
              duplex: file?.duplex,
              lamination: file?.lamination,
              binding: file?.binding,
              type: "Color Print",
              size: "a4",
            });
          });

          sizesMetaData.push({
            type: "Color Print",
            size: "a4",
            count: totalA4PrintPages.colorPrint,
            unitPrice: getOptionPrice("Color Print", "A4", filesForColorPrint.a4),
            price: parseFloat((totalA4PrintPages.colorPrint *
              getOptionPrice("Color Print", "A4", filesForColorPrint.a4)).toFixed(2)),
            laminations: getFilesLaminationPrice([...filesForColorPrint.a4], data?.document_laminations, 'a4'),
            bindings: getBindingPrices([...filesForColorPrint.a4], data?.document_bindings, 'a4')
          })

          const validBlackAndWhitePrintFiles = getValidFiles(filesForBlackAndWhitePrint.a4);
          validBlackAndWhitePrintFiles.forEach((file: any) => {
            const extension = file.name.split(".").pop();
            const filename = `${file.name
              .split(".")
              .slice(0, -1)
              .join(".")}_black_white_print_a4_${file?.print}(${file.count
              }).${extension}`;
            filesMetaData.push({
              filename,
              key: file.key,
              url: file.url,
              count: file.count,
              pages: file?.pages,
              totalPages: file?.totalPages,
              range: file?.range,
              rangeValue: file?.rangeValue,
              dimension: file?.print,
              stapling: file?.stapling,
              lamination: file?.lamination,
              duplex: file?.duplex,
              binding: file?.binding,
              type: "Black and White Print",
              size: "a4",
            });
          });

          sizesMetaData.push({
            type: "Black and White Print",
            size: "a4",
            count: totalA4PrintPages.blackAndWhite,
            unitPrice: getOptionPrice("Black & White Print", "A4", filesForBlackAndWhitePrint.a4),
            price: parseFloat((totalA4PrintPages.blackAndWhite *
              getOptionPrice("Black & White Print", "A4", filesForBlackAndWhitePrint.a4)).toFixed(2)),
            laminations: getFilesLaminationPrice([...filesForBlackAndWhitePrint.a4], data?.document_laminations, 'a4'),
            bindings: getBindingPrices([...filesForBlackAndWhitePrint.a4], data?.document_bindings, 'a4')
          })
        }

        if (A3Print) {
          const validColorPrintFiles = getValidFiles(filesForColorPrint.a3);
          validColorPrintFiles.forEach((file: any) => {
            const extension = file.name.split(".").pop();
            const filename = `${file.name
              .split(".")
              .slice(0, -1)
              .join(".")}_color_print_a3_${file?.print}(${file.count
              }).${extension}`;
            filesMetaData.push({
              filename,
              key: file.key,
              url: file.url,
              count: file.count,
              pages: file?.pages,
              totalPages: file?.totalPages,
              range: file?.range,
              rangeValue: file?.rangeValue,
              dimension: file?.print,
              duplex: file?.duplex,
              stapling: file?.stapling,
              lamination: file?.lamination,
              binding: file?.binding,
              type: "Color Print",
              size: "a3",
            });
          });

          sizesMetaData.push({
            type: "Color Print",
            size: "a3",
            count: totalA3PrintPages.colorPrint,
            unitPrice: getOptionPrice("Color Print", "A3", filesForColorPrint.a3),
            price: parseFloat((totalA3PrintPages.colorPrint *
              getOptionPrice("Color Print", "A3", filesForColorPrint.a3)).toFixed(2)),
            laminations: getFilesLaminationPrice([...filesForColorPrint.a3], data?.document_laminations, 'a3'),
            bindings: getBindingPrices([...filesForColorPrint.a3], data?.document_bindings, 'a3')
          })

          const validBlackAndWhitePrintFiles = getValidFiles(filesForBlackAndWhitePrint.a3);
          validBlackAndWhitePrintFiles.forEach((file: any) => {
            const extension = file.name.split(".").pop();
            const filename = `${file.name
              .split(".")
              .slice(0, -1)
              .join(".")}_black_white_print_a3_${file?.print}(${file.count
              }).${extension}`;
            filesMetaData.push({
              filename,
              key: file.key,
              url: file.url,
              count: file.count,
              pages: file?.pages,
              totalPages: file?.totalPages,
              range: file?.range,
              rangeValue: file?.rangeValue,
              dimension: file?.print,
              duplex: file?.duplex,
              stapling: file?.stapling,
              lamination: file?.lamination,
              binding: file?.binding,
              type: "Black and White Print",
              size: "a3",
            });
          });


          sizesMetaData.push({
            type: "Black and White Print",
            size: "a3",
            count: totalA3PrintPages.blackAndWhite,
            unitPrice: getOptionPrice("Black & White Print", "A3", filesForBlackAndWhitePrint.a3),
            price: parseFloat((totalA3PrintPages.blackAndWhite *
              getOptionPrice("Black & White Print", "A3", filesForBlackAndWhitePrint.a3)).toFixed(2)),
            laminations: getFilesLaminationPrice([...filesForBlackAndWhitePrint.a3], data?.document_laminations, 'a3'),
            bindings: getBindingPrices([...filesForBlackAndWhitePrint.a3], data?.document_bindings, 'a3')
          })
        }

        if (service != "Soft Copy By Email") {
          formData.append("area", area);
          formData.append("perPersonPhotos", perPersonPhotos);
          if (purpose === "Other") {
            formData.append("size", size);
            formData.append("bgColor", bgColor);
          }
        }

        let servicePrice: any = getServicePrice()

        formData.append("order_type", "passport_photo");
        formData.append("city", city);
        formData.append("service", service);
        formData.append("firstname", firstname);
        formData.append("lastname", lastname);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("numberOfPeople", numberOfPeople);
        formData.append("comments", comments);
        formData.append("filesData", JSON.stringify(filesMetaData));
        formData.append("sizesData", JSON.stringify(sizesMetaData));
        formData.append("passportFilesData", JSON.stringify(passportFilesMetaData));
        formData.append("service_price", servicePrice)
        formData.append("price", price);
        formData.append("purpose", purpose);

        formData.append("token", token.token.id);
        if (sessionId) formData.append("session_id", sessionId);

        try {
          const { data } = await axios({
            data: formData,
            method: "post",
            url: process.env.NEXT_PUBLIC_API_URL + "/api/createOrder",
            headers: {
              "Content-Type": "application/json",
            }
          });
          const { order_id, customer_id } = data;

          axios.post(
            process.env.NEXT_PUBLIC_API_URL + "/api/stripe/pay",
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

                pushOrderLayer("Passport Size Photos", response?.data?.object);
                resetForm();
              } else {
                setShowLoading(false);
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: response?.data?.message || "Something went wrong!",
                  showLoaderOnConfirm: false,
                  showLoaderOnDeny: false,
                  loaderHtml: `<div></div>`,
                });
                formSubmission("Passport Size Photos", "form_submission_error", response);
              }
              //console.log("Response", response);
            })
            .catch((err) => {
              setShowLoading(false);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err?.response?.data?.message || "Something went wrong!",
                showLoaderOnConfirm: false,
                showLoaderOnDeny: false,
                loaderHtml: `<div></div>`,
              });
              console.log("Error", err);
              formSubmission("Passport Size Photos", "form_submission_error", err);
            });
        } catch (error: any) {
          setShowLoading(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
              error?.response?.data?.message ||
              "Something went wrong while uploading your files. Please make sure files are in proper format and size. If error presist please contact our support.",
          });
          formSubmission("Passport Size Photos", "form_submission_error", {
            title: "Oops...",
            text:
              error?.response?.data?.message ||
              "Something went wrong while uploading your files. Please make sure files are in proper format and size. If error presist please contact our support.",
          });
        }
      } else {
        setShowLoading(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: token?.token || "Token not found!",
          showLoaderOnConfirm: false,
          showLoaderOnDeny: false,
          loaderHtml: `<div></div>`,
        });
        formSubmission("Passport Size Photos", "form_submission_error", {
          title: "Oops...",
          text: token?.token || "Token not found!",
        });
      }
    });
  }

  function renderCardElements(stripe: any) {
    var elements = stripe.elements({
      fonts: [
        {
          cssSrc: "https://fonts.googleapis.com/css?family=Roboto",
        },
      ],
      // Stripe's examples are localized to specific languages, but if
      // you wish to have Elements automatically detect your user's locale,
      // use `locale: 'auto'` instead.
      locale:
        window.__exampleLocale !== undefined ? window.__exampleLocale : "",
    });
    var elementStyles = {
      invalid: {
        color: "#E25950",

        "::placeholder": {
          color: "#FFCCA5",
        },
      },
    };

    //const card = elements.create('card');
    let cardNumberInstance = elements?.create("cardNumber", {
      style: elementStyles,
      placeholder: "Card Number",
    });
    setCardNumber(cardNumberInstance);
    const cardExpiry = elements?.create("cardExpiry", {
      style: elementStyles,
    });
    const cardCvc = elements?.create("cardCvc", {
      style: elementStyles,
    });

    cardNumberInstance.mount("#payment_element_cardNumber");
    cardExpiry.mount("#payment_element_cardExpiry");
    cardCvc.mount("#payment_element_cardCvv");
    //console.log("Rendering Card Elements: ");
    return {
      cardNumberInstance,
      cardExpiry,
      cardCvc,
    };
  }

  async function tryCreateToken() {
    const { token, error } = await stripe.createToken(cardNumber);
    //console.log("Card number", cardNumber);
    if (error) {
      return { status: false, token: error.message };
    } else {
      // Send the token to your server.
      stripeStart("Passport Size Photos");
      return { status: true, token: token };
    }
  }

  //Utils functions for the document printing code
  const setDocumentFiles = (files: any, type: any, size: any) => {
    switch (type) {
      case "color_print":
        if (size === "a3") {
          setFilesForColorPrint((prevFiles: any) => {
            return { ...prevFiles, a3: files };
          });
        } else if (size === "a4") {
          setFilesForColorPrint((prevFiles: any) => {
            return { ...prevFiles, a4: files };
          });
        }
        break;
      case "black_white_print":
        if (size === "a3") {
          setFilesForBlackAndWhitePrint((prevFiles: any) => {
            return { ...prevFiles, a3: files };
          });
        } else if (size === "a4") {
          setFilesForBlackAndWhitePrint((prevFiles: any) => {
            return { ...prevFiles, a4: files };
          });
        }
        break;
      default:
        break;
    }
  };

  function setPagesAndCopies() {
    setTotalA3PrintPages({
      blackAndWhite: getFilesPages(getValidFiles(filesForBlackAndWhitePrint.a3)),
      colorPrint: getFilesPages(getValidFiles(filesForColorPrint.a3)),
    });
    setTotalA4PrintPages({
      blackAndWhite: getFilesPages(getValidFiles(filesForBlackAndWhitePrint.a4)),
      colorPrint: getFilesPages(getValidFiles(filesForColorPrint.a4)),
    });
  }

  const updateSoftCities = (cities: string[]) => {
    let options: any = cities.sort().map((city: any, i: any) => {
      return { value: city, label: city };
    });
    setSoftCities(options);
  };

  const getAllFiles = function ({ A4Print, A3Print, docPrint }: any) {
    let allFiles: any = [...files];
    if (docPrint) {
      if (A4Print) {
        allFiles.push(
          ...(filesForColorPrint.a4 || []),
          ...(filesForBlackAndWhitePrint.a4 || [])
        );
      }

      if (A3Print) {
        allFiles.push(
          ...(filesForColorPrint.a3 || []),
          ...(filesForBlackAndWhitePrint.a3 || [])
        );
      }
    }
    return allFiles;
  }

  function renderFileUploadProgress({ A4Print, A3Print, docPrint }: any) {
    const allFiles = getAllFiles({ A4Print, A3Print, docPrint });
    return <FileUploadProgress files={allFiles} />
  }

  function renderFileUploadSummary({ A4Print, A3Print, docPrint }: any) {
    const allFiles = getAllFiles({ A4Print, A3Print, docPrint });
    return <FileUploadSummary files={allFiles} />
  }

  useEffect(() => {
    calculatePrice();
    setPagesAndCopies();
    // checkFilesSizeValid();
  }, [filesForColorPrint, filesForBlackAndWhitePrint]);

  // Here end the document printing code utils
  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () =>
      files?.forEach((file: any) => URL?.revokeObjectURL(file.preview));
  }, []);

  useEffect(() => {
    const sortedAreas = sortArrayAlphabetically(areas);
    let options: any = sortedAreas?.map((area: any) => {
      return { value: area.name, label: area.name };
    });
    setAreaOptions(options);
  }, [areas]);

  useEffect(() => {
    const loadImages = function () {
      const image1: any =
        "/images/images/passport-size-photos-delivery/before-after/man-passport-size-photo-sample-before.jpg";
      const image2: any =
        "/images/images/passport-size-photos-delivery/before-after/baby-passport-size-photo-sample-1-before.jpg";
      const image3: any =
        "/images/images/passport-size-photos-delivery/before-after/kid-passport-size-photo-sample-1-before.jpg";
      setDummyImages([image1, image2, image3]);
    };
    loadImages();
    if (data?.passportsize_page_cities) {
      updateSoftCities(data?.passportsize_page_cities);
    }
  }, []);

  useEffect(() => {
    if (!window?.Stripe) return;
    let stripeInstance = window?.Stripe(
      process.env.NEXT_PUBLIC_STRIPE_TEST_TOKEN
    );
    setStripe(stripeInstance);
    if (stripeInstance) {
      setStripeElements(renderCardElements(stripeInstance));
    }
  }, []);

  useEffect(() => {
    let allCities: any = [],
      allAreas: any = [];
    areas.forEach((area: any) => {
      if (!allCities.includes(area.city)) {
        allCities.push(area.city);
      }
    });
    let optionsTwo: any = allCities.sort().map((city: any, i: any) => {
      return { value: city, label: city };
    });

    const firstCity = optionsTwo[0];

    areas.forEach((area: any) => {
      if (area.city === firstCity?.value) {
        allAreas.push({ value: area.name, label: area.name });
      }
    });
    formRef?.current?.setFieldValue("city", firstCity?.value);
    setAreaOptions(allAreas);
    setCityOptions(optionsTwo);
  }, [areas]);

  // useEffect(() => {
  //   checkFilesValid();
  // }, [files]);

  return (
    <div className="order-form--wrapper passport-size-printing-form--wrapper ppc-form">
      {showLoading && <Loading />}
      <Formik
        innerRef={formRef}
        initialValues={initialValues}
        validate={validator}
        onSubmit={(values, errors) => {
          console.log("Files", files)
          const hasFiles = hasValidFiles([{ files: files }]);
          console.log("Has Files", hasFiles)
          if (!hasFiles) {
            setFilesValid(false);
            Swal.fire({
              icon: "error",
              title: "Validation Error",
              text: "Please fill all fields!",
              showLoaderOnConfirm: false,
              showLoaderOnDeny: false,
              loaderHtml: `<div></div>`,
            });
            formSubmission("Passport Size Photos", "form_submission_error", {
              title: "Validation Error",
              text: "Please fill all fields!",
              errors,
            });
            return;
          }
          // if (!filesValidSize) return;
          onConfirm();
          //openButton.current.click();
        }}
      >
        {({
          values,
          errors,
          touched,
          isValid,
          handleSubmit,
          handleChange,
          validateForm,
          setFieldTouched,
          setFieldValue,
        }) => {
          // console.log("Errors",errors)
          return (
            <form
              className="container"
              onSubmit={(event) => {
                event.preventDefault();
                validateForm().then((errors) => {
                  if (errors && Object.keys(errors).length !== 0) {
                    Swal.fire({
                      icon: "error",
                      title: "Validation Error",
                      text: "Please fill all fields!",
                      showLoaderOnConfirm: false,
                      showLoaderOnDeny: false,
                      loaderHtml: `<div></div>`,
                    });
                    formSubmission("Passport Size Photos", "form_submission_error", {
                      title: "Validation Error",
                      text: "Please fill all fields!",
                      errors,
                    });
                    handleSubmit();
                  } else {
                    handleSubmit();
                  }
                });
              }}
            >
              <CheckoutActivityFormTracker orderType="PASSPORT_PHOTO" />
              <div className="contactSection" id="photos">
                <h2 className="heading-h2 text-center my-4 mx-0">
                  Fill The Form Below To Place An Order
                </h2>
                <div className="formContainer">
                  <div className="formControll">
                    <label htmlFor="service">Service</label>
                    <select
                      name="service"
                      id="service"
                      onChange={(e) => {
                        handleChange(e);
                        onChangeService(e);
                      }}
                      onFocus={() => pushDatalyer("Passport Size Photos", "Service")}
                      value={values.service}
                      className="selectOptions"
                    >
                      <option disabled selected value="">
                        Choose Service
                      </option>
                      <option value="Soft Copy By Email">
                        Soft Copy By Email
                      </option>
                      <option value="Soft Copy By Email & Hard Copy Delivery">
                        Soft Copy By Email & Hard Copies Delivery
                      </option>
                    </select>
                    {errors.service && touched.service && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                          />
                        </span>{" "}
                        Please select service
                      </div>
                    )}
                  </div>

                  <div className="formControll">
                    <label htmlFor="firstname">First Name</label>
                    <input
                      type="text"
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() => pushDatalyer("Passport Size Photos", "First Name",)}
                      value={values?.firstname}
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
                          />
                        </span>{" "}
                        Please enter your first name
                      </div>
                    )}
                  </div>

                  <div className="formControll">
                    <label htmlFor="lastname">Last Name</label>
                    <input
                      type="text"
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() => pushDatalyer("Passport Size Photos", "Last Name",)}
                      value={values.lastname}
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
                          />
                        </span>{" "}
                        Please enter your last name
                      </div>
                    )}
                  </div>

                  <div className="formControll">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() => pushDatalyer("Passport Size Photos", "Email")}
                      value={values.email}
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
                          />
                        </span>{" "}
                        Please enter your valid email address
                      </div>
                    )}
                  </div>

                  <div className="formControll">
                    <label htmlFor="phone">
                      Phone Number (Preferably With WhatsApp)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() => pushDatalyer("Passport Size Photos", "Phone Number")}
                      value={values.phone}
                      placeholder="Please Write Your Phone Number"
                      name="phone"
                    />
                    {errors.phone && touched.phone && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                          />
                        </span>{" "}
                        Please enter your phone number
                      </div>
                    )}
                  </div>
                  {values.service === "Soft Copy By Email" ? (
                    softCities && softCities?.length > 0 ? (
                      <div className="formControll">
                        <label htmlFor="area">City You Reside In</label>
                        <SearchableSelect
                          value={values?.city}
                          options={softCities}
                          type="city"
                          onChangeHandler={setValueCalculatePrice}
                        />
                        {errors.city && touched.city && (
                          <div className="inputError">
                            <div className="arrow-up"></div>
                            <span>
                              <img
                                className="errorImage"
                                src={"/images/images/error.jpeg"}
                              />
                            </span>{" "}
                            Please select a city
                          </div>
                        )}
                      </div>
                    ) : (
                      <></>
                    )
                  ) : (
                    <div className="formControll">
                      <label htmlFor="address">
                        Address (Please Don't Put Work/Office Address - Preferably
                        Home)
                      </label>
                      <input
                        type="text"
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        onFocus={() => pushDatalyer("Address", "Address", "Passport Size Photos")}
                        value={values.address}
                        placeholder="Please Write Your Address"
                        id="address"
                        name="address"
                      />
                      {errors.address && touched.address && (
                        <div className="inputError">
                          <div className="arrow-up"></div>
                          <span>
                            <img
                              className="errorImage"
                              src={"/images/images/error.jpeg"}
                            />
                          </span>{" "}
                          Please enter your address
                        </div>
                      )}
                    </div>
                  )}

                  {values.service !== "Soft Copy By Email" && (
                    <>
                      <div className="formControll">
                        <label htmlFor="area">City</label>
                        <SearchableSelect
                          value={values.city}
                          options={cityOptions}
                          type="city"
                          onChangeHandler={setValueCalculatePrice}
                        />
                        {errors.city && touched.city && (
                          <div className="inputError">
                            <div className="arrow-up"></div>
                            <span>
                              <img
                                className="errorImage"
                                src={"/images/images/error.jpeg"}
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
                          options={areaOptions}
                          type="area"
                          onChangeHandler={setValueCalculatePrice}
                        />
                        {errors.area && touched.area && (
                          <div className="inputError">
                            <div className="arrow-up"></div>
                            <span>
                              <img
                                className="errorImage"
                                src={"/images/images/error.jpeg"}
                              />
                            </span>{" "}
                            Please select your area
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="formControll">
                    <label htmlFor="purpose" className="order-option-label">
                      Purpose
                    </label>
                    <SearchableSelect
                      options={purposes}
                      type="purpose"
                      value={values.purpose}
                      onChangeHandler={(type: any, value: any) => {
                        setFieldValue(type, value);
                        pushDropdownLayer("Passport Size Photos", "Purpose", value);
                      }}
                    />
                    {errors.purpose && touched.purpose && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                          />
                        </span>{" "}
                        Please select purpose
                      </div>
                    )}
                  </div>

                  {values.purpose === "Other" &&
                    values.service !== "Soft Copy By Email" && (
                      <>
                        <div className="formControll">
                          <label htmlFor="size">
                            Size of Photo (mmxmm or name the visa/passport)
                          </label>
                          <input
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            onFocus={() => pushDatalyer("Size of Photo", "Size of Photo", "Passport Size Photos")}
                            value={values.size}
                            type="text"
                            placeholder="Please Write Size"
                            id="size"
                            name="size"
                          />
                          {errors.size && touched.size && (
                            <div className="inputError">
                              <div className="arrow-up"></div>
                              <span>
                                <img
                                  className="errorImage"
                                  src={"/images/images/error.jpeg"}
                                />
                              </span>{" "}
                              Please Write Size
                            </div>
                          )}
                        </div>

                        <div className="formControll">
                          <label htmlFor="bgColor">Background Color</label>
                          <input
                            id="bgColor"
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            onFocus={() => pushDatalyer("Passport Size Photos", "Background Color")}
                            value={values.bgColor}
                            name="bgColor"
                            type="text"
                            placeholder="Please Write Background Color"
                            required
                          />
                          {errors.bgColor && touched.bgColor && (
                            <div className="inputError">
                              <div className="arrow-up"></div>
                              <span>
                                <img
                                  className="errorImage"
                                  src={"/images/images/error.jpeg"}
                                />
                              </span>{" "}
                              Please Write Background Color
                            </div>
                          )}
                        </div>
                      </>
                    )}

                  <div className="formControll">
                    <label
                      htmlFor="numberOfPeople"
                      className="order-option-label"
                    >
                      Number Of People
                    </label>
                    <select
                      typeof="text"
                      className="selectOptions"
                      id="numberOfPeople"
                      onChange={(e) => {
                        handleChange(e);
                        calculatePrice();
                        pushDropdownLayer("Passport Size Photos", "Number Of People", e?.target?.value);
                      }}
                      onFocus={() => pushDatalyer("Number Of People", "Number Of People", "Passport Size Photos")}
                      value={values?.numberOfPeople}
                      name="numberOfPeople"
                    >
                      <option value="" selected disabled>
                        Please Select Number Of People
                      </option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="7">7</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>

                    {errors.numberOfPeople && touched.numberOfPeople && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                          />
                        </span>{" "}
                        Please Select number of people
                      </div>
                    )}
                  </div>

                  {values.service !== "Soft Copy By Email" && (
                    <div className="formControll">
                      <label
                        htmlFor="numberPhotos"
                        className="order-option-label"
                      >
                        Number Of Photos Required Per Person
                      </label>
                      <select
                        typeof="text"
                        onChange={(e) => {
                          handleChange(e);
                          calculatePrice();
                          pushDropdownLayer("Passport Size Photos", "Number Of Photos Required Per Person", e?.target?.value);
                        }}
                        onFocus={() =>
                          pushDatalyer("Number Of Photos Required Per Person", "Number Of Photos Required Per Person", "Passport Size Photos")
                        }
                        value={values.perPersonPhotos}
                        id="perPersonPhotos"
                        name="perPersonPhotos"
                        className="selectOptions"
                      >
                        <option disabled selected value="">
                          Please Select Number Of Photos Required Per Person
                        </option>
                        <option value="6">6</option>
                        <option value="8">8</option>
                        <option value="12">12</option>
                      </select>
                      {errors.perPersonPhotos && touched.perPersonPhotos && (
                        <div className="inputError">
                          <div className="arrow-up"></div>
                          <span>
                            <img
                              className="errorImage"
                              src={"/images/images/error.jpeg"}
                            />
                          </span>{" "}
                          Please select Per Person photos
                        </div>
                      )}
                    </div>
                  )}

                  <div className="custom-dropzone--container formControll">
                    <div className="form-label formControll">
                      {values.service == "Soft Copy By Email" && (
                        <label className="order-option-label">
                          Upload Photo(s) To Be Edited - Upload Multiple If You
                          Prefer, We Will Choose The Best
                        </label>
                      )}
                      {values.service != "Soft Copy By Email" && (
                        <label className="order-option-label">
                          Upload Photo(s) To Be Printed - Upload Multiple If You
                          Prefer, We Will Choose The Best
                        </label>
                      )}
                      <label style={{ margin: 0 }}>
                        <FileUploadingStatus files={files} />
                      </label>
                    </div>
                    <FileDropzonePDFOnly
                      orderType="PASSPORT_PHOTO"
                      files={files}
                      setFiles={(files: any) => {
                        setFiles(files);
                        // checkFilesValid();
                      }}
                      showCounters={false}
                      page="psp-page"
                    />
                    <UploadInfoLabel supportedTypes={PASSPORT_PHOTO_FILE_TYPES} />
                  </div>
                  {!filesValid && isValid && (
                    <div className="inputError">
                      <div className="arrow-up"></div>
                      <span>
                        <img
                          className="errorImage"
                          src={"/images/images/error.jpeg"}
                        />
                      </span>{" "}
                      Please upload photos
                    </div>
                  )}
                  {!filesValidSize && (
                    <div className="inputError">
                      <div className="arrow-up"></div>
                      <span>
                        <img
                          className="errorImage"
                          src={"/images/images/error.jpeg"}
                        />
                      </span>{" "}
                      Per file size should not exceed 10MB, please use an online
                      tool to compress the photos greater than 10MB and re-upload
                    </div>
                  )}

                  {/* Here will be the new Document Printing Code */}
                  {values.service != "Soft Copy By Email" && (
                    <div className="d-block w-100 doc-print-code formControll">
                      <div className="d-flex align-items-center justify-content-start w-100">
                        <input
                          type="checkbox"
                          name="require_document_printing"
                          id="require_document_printing"
                          checked={values.docPrint}
                          onChange={(e) => {
                            setValueCalculatePrice("docPrint", e.target.checked);
                          }}
                        />
                        <label
                          className="margin-left-15"
                          htmlFor="require_document_printing"
                        >
                          Do You Require Documents To Be Printed?
                        </label>
                      </div>
                      {values.docPrint && (
                        <div className="document-printing--wrapper">
                          <div className="formControll">
                            <div className="font-simple">
                              <input
                                checked={values.A4Print}
                                onChange={(e) => {
                                  setValueCalculatePrice(
                                    "A4Print",
                                    !values.A4Print
                                  );
                                }}
                                onFocus={() => pushDatalyer("Passport Size Photos", "A4 Print")}
                                type="checkbox"
                                name="a4-doc"
                                id="a4-doc"
                              />
                              <label
                                className="margin-left-15 font-simple"
                                htmlFor="a4-doc"
                              >
                                A4 - (Color - {getOptionPrice("Color Print", "A4", [{ count: 1, pages: 1 }])} AED, B/W - {getOptionPrice("Black & White Print", "A4", [{ count: 1, pages: 1 }])} AED)
                              </label>
                              <br />
                            </div>
                            {values.A4Print && (
                              <>
                                <div className="formControll">
                                  <label className="order-option-label">
                                    A4 Color Print
                                  </label>
                                  <label style={{ margin: 0 }}>
                                    <FileUploadingStatus files={filesForColorPrint.a4} />
                                  </label>
                                  <FileDropzone
                                    orderType="PASSPORT_PHOTO"
                                    files={filesForColorPrint.a4}
                                    setFiles={(files: any) =>
                                      setDocumentFiles(files, "color_print", "a4")
                                    }
                                    pages={0}
                                    setPages={() => { }}
                                    showCounters={true}
                                    showDuplex={true}
                                    showPaper={true}
                                    zoom={true}
                                    data={data}
                                  />
                                  <UploadInfoLabel
                                    supportedTypes={PASSPORT_DOCUMENT_PRINT_TYPES}
                                  />
                                  {!filesForA4PrintValid.colorPrint && (
                                    <div className="inputError">
                                      <div className="arrow-up"></div>
                                      <span>
                                        <img
                                          className="errorImage"
                                          src={"/images/images/error.jpeg"}
                                        />
                                      </span>{" "}
                                      Per file size should not exceed 10MB, please
                                      use an online tool to compress the photos
                                      greater than 10MB and re-upload
                                    </div>
                                  )}
                                </div>

                                <div className="formControll">
                                  <label className="order-option-label">
                                    A4 Black &amp; White Print
                                  </label>
                                  <label style={{ margin: 0 }}>
                                    <FileUploadingStatus files={filesForBlackAndWhitePrint.a4} />
                                  </label>
                                  <FileDropzone
                                    orderType="PASSPORT_PHOTO"
                                    files={filesForBlackAndWhitePrint.a4}
                                    setFiles={(files: any) =>
                                      setDocumentFiles(
                                        files,
                                        "black_white_print",
                                        "a4"
                                      )
                                    }
                                    pages={0}
                                    setPages={() => { }}
                                    showCounters={true}
                                    showPaper={true}
                                    zoom={true}
                                    data={data}
                                  />
                                  <UploadInfoLabel
                                    supportedTypes={PASSPORT_DOCUMENT_PRINT_TYPES}
                                  />
                                  {!filesForA4PrintValid.blackAndWhitePrint && (
                                    <div className="inputError">
                                      <div className="arrow-up"></div>
                                      <span>
                                        <img
                                          className="errorImage"
                                          src={"/images/images/error.jpeg"}
                                        />
                                      </span>{" "}
                                      Per file size should not exceed 10MB, please
                                      use an online tool to compress the photos
                                      greater than 10MB and re-upload
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            <div>
                              <input
                                type="checkbox"
                                checked={values.A3Print}
                                onChange={(e) => {
                                  setValueCalculatePrice(
                                    "A3Print",
                                    !values.A3Print
                                  );
                                }}
                                onFocus={() => pushDatalyer("Passport Size Photos", "A3 Print")}
                                name="a3-doc"
                                id="a3-doc"
                              />
                              <label
                                className="margin-left-15 font-simple"
                                htmlFor="a3-doc"
                              >
                                A3 - (Color - {getOptionPrice("Color Print", "A3", [{ count: 1, pages: 1 }])} AED, B/W - {getOptionPrice("Black & White Print", "A3", [{ count: 1, pages: 1 }])} AED)
                              </label>
                              <br />
                            </div>
                          </div>
                          {values.A3Print && (
                            <>
                              <div className="formControll">
                                <label className="order-option-label">
                                  A3 Color Print
                                </label>
                                <label style={{ margin: 0 }}>
                                  <FileUploadingStatus files={filesForColorPrint.a3} />
                                </label>
                                <FileDropzone
                                  orderType="PASSPORT_PHOTO"
                                  files={filesForColorPrint.a3}
                                  setFiles={(files: any) =>
                                    setDocumentFiles(files, "color_print", "a3")
                                  }
                                  pages={0}
                                  setPages={() => { }}
                                  showCounters={true}
                                  showPaper={true}
                                  zoom={true}
                                  data={data}
                                />
                                <UploadInfoLabel
                                  supportedTypes={PASSPORT_DOCUMENT_PRINT_TYPES}
                                />
                                {!filesForA3PrintValid.colorPrint && (
                                  <div className="inputError">
                                    <div className="arrow-up"></div>
                                    <span>
                                      <img
                                        className="errorImage"
                                        src={"/images/images/error.jpeg"}
                                      />
                                    </span>{" "}
                                    Per file size should not exceed 10MB, please
                                    use an online tool to compress the photos
                                    greater than 10MB and re-upload
                                  </div>
                                )}
                              </div>

                              <div className="formControll">

                                <label className="order-option-label">
                                  A3 Black &amp; White Print
                                </label>
                                <label style={{ margin: 0 }}>
                                  <FileUploadingStatus files={filesForBlackAndWhitePrint.a3} />
                                </label>
                                <FileDropzone
                                  orderType="PASSPORT_PHOTO"
                                  files={filesForBlackAndWhitePrint.a3}
                                  setFiles={(files: any) =>
                                    setDocumentFiles(
                                      files,
                                      "black_white_print",
                                      "a3"
                                    )
                                  }
                                  pages={0}
                                  setPages={() => { }}
                                  showCounters={true}
                                  showPaper={true}
                                  zoom={true}
                                  data={data}
                                />
                                <UploadInfoLabel
                                  supportedTypes={PASSPORT_DOCUMENT_PRINT_TYPES}
                                />
                                {!filesForA3PrintValid.blackAndWhitePrint && (
                                  <div className="inputError">
                                    <div className="arrow-up"></div>
                                    <span>
                                      <img
                                        className="errorImage"
                                        src={"/images/images/error.jpeg"}
                                      />
                                    </span>{" "}
                                    Per file size should not exceed 10MB, please
                                    use an online tool to compress the photos
                                    greater than 10MB and re-upload
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Here will be the new Document Printing Code Ends */}

                  <div className="formControll any-comments">
                    <label htmlFor="people">Any Comments</label>
                    <textarea
                      typeof="textarea"
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onFocus={() => pushDatalyer("Passport Size Photos", "Any Comments")}
                      value={values?.comments}
                      id="comments"
                      name="comments"
                    />
                  </div>

                  <div className="formControll">
                    <label htmlFor="people">Price</label>
                    <input
                      readOnly
                      value={price}
                      type="text"
                      id="people"
                      name="people"
                    />
                    <div className="order-summary">
                      {values.service && <p className="mt-2">
                        {" "}
                        {values.purpose}: {values.numberOfPeople} Person(s){" "}
                        ={" "}{getServicePrice()}{" AED"}
                      </p>}
                      {values.docPrint && values.A4Print && (
                        <>
                          <p>
                            {" "}
                            A4 Color Print: {totalA4PrintPages.colorPrint} Pages x{" "}
                            {getOptionPrice("Color Print", "A4", filesForColorPrint.a4)} AED ={" "}
                            {parseFloat((totalA4PrintPages.colorPrint *
                              getOptionPrice("Color Print", "A4", filesForColorPrint.a4)).toFixed(2))}{" "}
                            AED{" "}
                          </p>
                          <p>
                            {" "}
                            A4 Black & White Print:{" "}
                            {totalA4PrintPages.blackAndWhite} Pages x{" "}
                            {getOptionPrice("Black & White Print", "A4", filesForBlackAndWhitePrint.a4)} AED ={" "}
                            {parseFloat((totalA4PrintPages.blackAndWhite *
                              getOptionPrice("Black & White Print", "A4", filesForBlackAndWhitePrint.a4)).toFixed(2))}{" "}
                            AED{" "}
                          </p>
                        </>
                      )}
                      {values.docPrint && values.A3Print && (
                        <>
                          <p>
                            {" "}
                            A3 Color Print: {totalA3PrintPages.colorPrint} Pages x{" "}
                            {getOptionPrice("Color Print", "A3", filesForColorPrint.a3)}
                            AED ={" "}
                            {parseFloat((totalA3PrintPages.colorPrint *
                              getOptionPrice("Color Print", "A3", filesForColorPrint.a3)).toFixed(2))}{" "}
                            AED{" "}
                          </p>
                          <p>
                            {" "}
                            A3 Black and White Print:{" "}
                            {totalA3PrintPages.blackAndWhite} Pages x{" "}
                            {getOptionPrice("Black & White Print", "A3", filesForBlackAndWhitePrint.a3)}
                            AED ={" "}
                            {parseFloat((totalA3PrintPages.blackAndWhite *
                              getOptionPrice("Black & White Print", "A3", filesForBlackAndWhitePrint.a3)).toFixed(2))}{" "}
                            AED{" "}
                          </p>
                        </>
                      )}
                      {values.docPrint && laminationPrices && (
                        <>
                          {laminationPrices.map((laminationPrice: any, index: any) => (
                            <p key={index}>
                              {laminationPrice.type.toUpperCase()}{" "}{laminationPrice.laminationType}:{" "}{laminationPrice.totalPages} Pages x{" "}{laminationPrice.pricePerUnit} AED = {laminationPrice.totalPrice}{" "}AED
                            </p>
                          ))}
                        </>
                      )}
                      {values.docPrint && bindingPrices && (
                        <>
                          {bindingPrices.map((bindingPrice: any, index: any) => (
                            <p key={index}>
                              {bindingPrice.type.toUpperCase()}{" "}{bindingPrice.bindingType}:{" "}{bindingPrice.totalMultiplier} Documents x{" "}{bindingPrice.pricePerUnit} AED = {bindingPrice.totalPrice}{" "}AED
                            </p>
                          ))}
                        </>
                      )}
                      <OrderTotalPrice total={Number(price)} />
                    </div>
                  </div>
                </div>
                {renderFileUploadSummary({
                  docPrint: values.docPrint,
                  A3Print: values.A3Print,
                  A4Print: values.A4Print
                })}
              </div>
              <br />

              <div style={{ display: "flex", width: "100%" }}>
                {" "}
                <div
                  style={{
                    width: "10%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={"/images/images/visa-icon.png"}
                    alt="VISAcARD"
                    style={{ width: "40px", margin: "10px 0px" }}
                  />
                  <img
                    src={"/images/images/master-card-icon.png"}
                    alt="VISAcARD"
                    style={{ width: "40px", margin: "0px 0px" }}
                  />
                </div>
                <div style={{ flexDirection: "column", width: "90%" }}>
                  <div
                    id="payment_element_cardNumber"
                    className="stripe-field"
                  ></div>
                  <div
                    id="payment_element_cardExpiry"
                    className="stripe-field"
                  ></div>
                  <div
                    id="payment_element_cardCvv"
                    className="stripe-field"
                  ></div>
                </div>
              </div>
              <div id="form-container" className="formControll payment-form">
                <div id="element-container"></div>
                {/* <div id="error-handler" role="alert">{{errorElement.textContent}}</div> */}
                <div
                  id="success"
                  style={{ display: "none", position: "relative", float: "left" }}
                >
                  Success! Your token is <span id="token"></span>
                </div>
                {renderFileUploadProgress({
                  docPrint: values.docPrint,
                  A3Print: values.A3Print,
                  A4Print: values.A4Print
                })}
                <div className="submit-button">
                  <button type="submit" id="tap-btn">
                    Submit
                  </button>
                </div>
              </div>
            </form>
          )
        }}
      </Formik>

      <button
        type="button"
        ref={openButton}
        className="btn btn-primary display-none"
        data-toggle="modal"
        data-target="#exampleModalCenter"
      ></button>

      <div
        className="modal fade"
        id="exampleModalCenter"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title confirmation--heading"
                id="exampleModalLongTitle"
              >
                Just a check before you go ahead with the confirmation :)
              </h5>

              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Have a look at the below sample photos one more time before you
                confirm your order, if your photos are far off from these
                samples, we would like to recommend you to please retake the
                pictures and re-attach to the form. This is just to make sure
                that you have no trouble in your application for any
                governmental or other process.
              </p>
              <div className="photo-container">
                {dummyImages.map((image: any, i: any) => {
                  return <img key={i} src={image} />;
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" ref={closeButton} data-dismiss="modal">
                Go Back
              </button>
              <button type="button" data-dismiss="modal" onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
