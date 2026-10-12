"use client";
import React, { useRef, useState, useEffect } from "react";
import { Field, Formik } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import Checkout from "../../../components/Checkout";
import useApp from "../../../store/useApp";
import "./styles.css";
import FileDropzone from "../../../components/Dropzones/FileDropzone";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import DeliveryChargesLine from "@/components/DeliveryChargesLine";
import { DOCUMENT_FILE_TYPES } from "@/constants/uploadSupportedTypes";
import SearchableSelect from "../../../components/SearchableSelect";
import LoadingProgress from "../../../components/LoadingProgress";
import showCustomPopup from "@/components/NoSwal";
import { privacyDocOptions } from "@/utils";
import {
  checkFileSizeValidity,
  getFilesCalculatedPrice,
  getFilesPages,
  getTheRangePrice,
  getFilesLaminationPrice,
  getBindingPrices,
  checkFreeDelivery,
  getDeliveryCharges,
  getValidFiles,
} from "@/helpers/generals";
import { PageData } from "@/libs/types";
import { sortArrayAlphabetically } from "@/libs/utils";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import FileUploadProgress from "@/components/FileUploadProgress";
import { cityAreaLayer, fileUploading, formSubmission, pushDatalyer, pushDropdownLayer, pushOrderLayer, stripeStart } from "@/datalayers/CP";

type props = {
  data: PageData;
  areas: any;
};

const DacumentPrintingForm = ({ data, areas }: props) => {
  // console.log("Data",data)
  const { tryCreateToken, documentPrintingPrices, resetStripeElements, sessionId } =
    useApp();
  const [price, setPrice] = useState<any>(data?.min_price ? data?.min_price : 0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<any>(data?.free_delivery_threshold ? data?.free_delivery_threshold : 0);
  const formRef = useRef<any>();
  const [showLoading, setShowLoading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [areaOptions, setAreaOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

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

  const [laminationPrices, setLaminationPrices] = useState<any>([])
  const [bindingPrices, setBindingPrices] = useState<any>([])

  const [filesForA4PrintValid, setFilesForA4PrintValid] = useState<any>({
    colorPrint: true,
    blackAndWhitePrint: true,
  });

  const [filesForA3PrintValid, setFilesForA3PrintValid] = useState<any>({
    colorPrint: true,
    blackAndWhitePrint: true,
  });

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
    A4Print: false,
    A3Print: false,
  };

  function checkFilesLoadings(files: any) {
    let isLoading = false;
    if (files && files?.length) {
      files.forEach((file: any) => {
        if (file && file?.loading) isLoading = true;
      })
    }

    return isLoading;
  }

  const getOptionPrice = (type: any, size: any, files: any) => {
    // 1. check if there is any valume based pricing.
    // 2. if no volume based pricing apply standard pricing.
    // 3. if non of above there return 0.
    let finalPrice = 0;
    const validFiles = getValidFiles(files)
    if (data?.document_volume_prices && data?.document_volume_prices[0].prices.length > 0) {
      finalPrice = getTheRangePrice(data.document_volume_prices, size, type, validFiles)
    } else if (data?.options) {
      const selectedOption = data?.options?.find(
        (option: any) => option.type === type && option.size === size
      );
      if (selectedOption) finalPrice = selectedOption.price;
    }
    return parseFloat(finalPrice.toFixed(2));;
  };

  const resetForm = () => {
    formRef.current.resetForm();
    setTotalA4PrintPages({ colorPrint: 0, blackAndWhite: 0 });
    setTotalA3PrintPages({ colorPrint: 0, blackAndWhite: 0 });
    setFilesForColorPrint({ a3: [], a4: [] });
    setFilesForBlackAndWhitePrint({ a3: [], a4: [] });
    setFilesForA4PrintValid({ colorPrint: true, blackAndWhitePrint: true });
    setFilesForA3PrintValid({ colorPrint: true, blackAndWhitePrint: true });
    resetStripeElements();
    calculatePrice();
  };

  const setFiles = (files: any, type: any, size: any) => {
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

  const validator = function (values: any) {
    const errors: any = {};
    if (!values.firstname) errors.firstname = "Required";
    if (!values.lastname) errors.lastname = "Required";
    if (!values.phone) errors.phone = "Required";
    if (!values.address) errors.address = "Required";
    if (!values.area) errors.area = "Required";
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    return errors;
  };

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    if (!formikValues) return {};
    return formikValues;
  };

  function calculatePrice() {

    let a4LaminationPrices: any = [];
    let a3LaminationPrices: any = [];
    let a4BindingPrices: any = [];
    let a3BindingPrices: any = [];
    setTimeout(() => {
      const { A4Print, A3Print, area = null } = getFormikValues();
      let newPrice = 0;
      //setPrice(minPrice);
      if (A4Print) {
        newPrice = newPrice + getFilesCalculatedPrice(filesForColorPrint.a4, getOptionPrice("Color Print", "A4", filesForColorPrint.a4));
        newPrice = newPrice + getFilesCalculatedPrice(filesForBlackAndWhitePrint.a4, getOptionPrice("Black & White Print", "A4", filesForBlackAndWhitePrint.a4));
        a4LaminationPrices = getFilesLaminationPrice([...filesForColorPrint.a4, ...filesForBlackAndWhitePrint.a4], data?.document_laminations, 'a4')
        a4BindingPrices = getBindingPrices([...filesForColorPrint.a4, ...filesForBlackAndWhitePrint.a4], data?.document_bindings, 'a4')
        setPrice(newPrice);
      }
      if (A3Print) {
        newPrice = newPrice + getFilesCalculatedPrice(filesForColorPrint.a3, getOptionPrice("Color Print", "A3", filesForColorPrint.a3));
        newPrice = newPrice + getFilesCalculatedPrice(filesForBlackAndWhitePrint.a3, getOptionPrice("Black & White Print", "A3", filesForBlackAndWhitePrint.a3));
        a3LaminationPrices = getFilesLaminationPrice([...filesForColorPrint.a3, ...filesForBlackAndWhitePrint.a3], data?.document_laminations, 'a3')
        a3BindingPrices = getBindingPrices([...filesForColorPrint.a3, ...filesForBlackAndWhitePrint.a3], data?.document_bindings, 'a3')
        setPrice(newPrice);
      }
      setLaminationPrices([...a3LaminationPrices, ...a4LaminationPrices])
      setBindingPrices([...a3BindingPrices, ...a4BindingPrices])
      const totalLaminationPrice = [...a3LaminationPrices, ...a4LaminationPrices].reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      const totalBindingPrice = [...a3BindingPrices, ...a4BindingPrices].reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      newPrice = newPrice + totalLaminationPrice + totalBindingPrice;
      if (newPrice < data?.min_price) {
        newPrice = data?.min_price;
      }
      setPrice(newPrice)
      if (checkFreeDelivery(newPrice, freeDeliveryThreshold)) {
        setDeliveryCharges(0);
      } else {
        let newDeliveryCharges = getDeliveryCharges(documentPrintingPrices, area, areas)
        setDeliveryCharges(newDeliveryCharges);
      }
    }, 100);
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer("Documents Printing", type, value);
    if (type === "city") {
      formRef.current.setFieldValue("area", "");
      const filteredAreas = areas?.filter((area: any) => area.city === value);
      const sortedAreas = sortArrayAlphabetically(filteredAreas);
      const options: any = sortedAreas?.map((area: any) => ({
        value: area?.name,
        label: area?.name,
      }));
      setAreaOptions(options);
    }
    formRef.current.setFieldValue(type, value);
    await Promise.resolve();
    calculatePrice();
  }

  function onSubmit() {
    if (!data?.isActive) {
      //console.log(data)
      showCustomPopup(data?.alert_message);
      return;
    }
    const {
      firstname,
      lastname,
      email,
      phone,
      address,
      area,
      city,
      privacy,
      comments,
      A4Print,
      A3Print,
    } = getFormikValues();

    setShowLoading(true);

    tryCreateToken().then(async (token: any) => {
      stripeStart("Documents Printing");
      if (token === undefined || token === "") {
        //console.log("Error while getting token");
        formSubmission("Documents Printing", "form_submission_error", { text: "Error while getting token" });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        const fileInfos: any = [];
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        if (A4Print) {
          const validColorPrintFiles = getValidFiles(filesForColorPrint.a4)
          validColorPrintFiles.forEach((file: any) => {
            const extension = file.name.split(".").pop();
            const filename = `${file.name
              .split(".")
              .slice(0, -1)
              .join(".")}_color_print_a4_${file?.print}(${file.count
              }).${extension}`;
            filesMetaData.push({
              filename,
              url: file.url,
              key: file.key,
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

          const validBlackAndWhitePrintFiles = getValidFiles(filesForBlackAndWhitePrint.a4)

          validBlackAndWhitePrintFiles.forEach((file: any) => {
            const extension = file.name.split(".").pop();
            const filename = `${file.name
              .split(".")
              .slice(0, -1)
              .join(".")}_black_white_print_a4_${file?.print}(${file.count
              }).${extension}`;
            filesMetaData.push({
              filename,
              url: file.url,
              key: file.key,
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
              stapling: file?.stapling,
              duplex: file?.duplex,
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

          const validBlackAndWhitePrintFiles = getValidFiles(filesForBlackAndWhitePrint.a3)

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
              stapling: file?.stapling,
              duplex: file?.duplex,
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

        // console.log("Files Data>>",filesMetaData)
        // setShowLoading(false)
        // return;
        fileUploading("Documents Printing", filesMetaData, "started");
        formData.append("order_type", "document_print");
        formData.append("firstname", firstname);
        formData.append("lastname", lastname);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("area", area);
        formData.append("city", city);
        formData.append("price", parseFloat(price + deliveryCharges).toFixed(2));
        formData.append("token", token.id);
        if (sessionId) formData.append("session_id", sessionId);
        formData.append("filesData", JSON.stringify(filesMetaData));
        formData.append("sizesData", JSON.stringify(sizesMetaData));
        formData.append("comments", comments);
        formData.append("privacy", privacy);
        formData.append("delivery_charges", String(getDeliveryCharges(documentPrintingPrices, area, areas)));
        formData.append("free_delivery", String(checkFreeDelivery(price, freeDeliveryThreshold)))

        try {
          const { data } = await axios({
            data: formData,
            method: "POST",
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
          const { order_id, customer_id } = data;

          fileUploading("Documents Printing", filesMetaData, "completed");
          axios
            .post(
              process.env.NEXT_PUBLIC_API_URL + "/api/stripe/pay",
              {
                order_id,
                customer_id,
                session_id: sessionId
              }
            )
            .then((response) => {
              //console.log("Response", response);
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
                pushOrderLayer("Documents Printing", object);
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
                formSubmission("Documents Printing", "form_submission_error", {
                  title: "Oops...",
                  text:
                    response?.data?.message ||
                    "Failed to collect your payment.",
                });
              }
              //console.log("Response", response);
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
              formSubmission("Documents Printing", "form_submission_error", {
                title: "Oops...",
                text:
                  err?.response?.data?.message ||
                  "Failed to collect your payment.",
              });
              console.log("Error", err);
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
          formSubmission("Documents Printing", "form_submission_error", {
            title: "Oops...",
            text:
              error?.response?.data?.message ||
              "Something went wrong while uploading your files. Please make sure files are in proper format and size. If error presist please contact our support.",
          });
        }
      }
    });
  }

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

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(documentPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles({ A4Print, A3Print }: any) {
    let allFiles: any = [];
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

    return allFiles;
  }

  function renderFileUploadSummary({ A4Print, A3Print }: any) {
    const allFiles = getAllFiles({ A4Print, A3Print });
    return <FileUploadSummary files={allFiles} />
  }

  function renderFileUploadProgress({ A4Print, A3Print }: any) {
    const allFiles = getAllFiles({ A4Print, A3Print });
    return <FileUploadProgress files={allFiles} />
  }

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
    formRef.current.setFieldValue("city", firstCity?.value);
    const sortedAreas: any = sortArrayAlphabetically(allAreas);
    setAreaOptions(sortedAreas);
    setCityOptions(optionsTwo);
  }, [areas]);

  useEffect(() => {
    calculatePrice();
    setPagesAndCopies();
    // checkFilesSizeValid();
  }, [filesForColorPrint, filesForBlackAndWhitePrint]);
  //console.log(areaOptions)
  return (
    <div className="document-printing-form--wrapper" id="printing-form">
      {showLoading && <LoadingProgress loaded={percentageUploaded} />}
      <Formik
        innerRef={formRef}
        initialValues={initialValues}
        validate={validator}
        onSubmit={(values, errors) => {
          onSubmit();
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
          validateForm,
        }) => (
          <form
            className="container mb-5"
            onSubmit={(event) => {
              event.preventDefault();
              validateForm().then((errors) => {
                if (errors && Object.keys(errors).length !== 0) {
                  Swal.fire({
                    icon: "error",
                    title: "Validation Error",
                    text: "Please fill all fields!",
                  });
                  formSubmission("Documents Printing", "form_submission_error", {
                    title: "Validation Error",
                    text: "Please fill all fields!",
                  });
                  handleSubmit();
                } else {
                  if (
                    !filesForA3PrintValid.colorPrint ||
                    !filesForA3PrintValid.blackAndWhitePrint ||
                    !filesForA4PrintValid.colorPrint ||
                    !filesForA4PrintValid.blackAndWhitePrint
                  )
                    return;
                  handleSubmit();
                }
              });
            }}
          >
            <CheckoutActivityFormTracker orderType="DOCUMENT_PRINT" />
            <div className="contactSection" id="photos">
              <h2 className="heading-h2 text-center my-5">
                Fill The Form Below To Place An Order
              </h2>
              <div className="formContainer">
                <div className="formControll">
                  <label htmlFor="firstname">First Name</label>
                  <input
                    data-data-formControlName="firstname"
                    value={values.firstname}
                    onChange={(e) => handleChange(e)}
                    onFocus={() => pushDatalyer("Documents Printing", "First Name")}
                    type="text"
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
                          alt="errorImg"
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
                    onChange={(e) => handleChange(e)}
                    onFocus={() => pushDatalyer("Documents Printing", "Last Name")}
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
                          alt="errorImg"
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
                    value={values.email}
                    onChange={(e) => handleChange(e)}
                    onFocus={() => pushDatalyer("Documents Printing", "Email")}
                    type="email"
                    id="email"
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
                          alt="errorImg"
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
                    value={values.phone}
                    onChange={(e) => handleChange(e)}
                    onFocus={() => pushDatalyer("Documents Printing", "Phone Number")}
                    type="tel"
                    id="pnumber"
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
                          alt="errorImg"
                        />
                      </span>{" "}
                      Please enter your phone number
                    </div>
                  )}
                </div>
                <div className="formControll">
                  <label htmlFor="city">City</label>
                  <SearchableSelect
                    type="city"
                    options={cityOptions}
                    value={values.city}
                    onChangeHandler={setValueCalculatePrice}
                  />
                  {errors.city && touched.city && (
                    <div className="inputError">
                      <div className="arrow-up"></div>
                      <span>
                        <img
                          className="errorImage"
                          src={"/images/images/error.jpeg"}
                          alt="errorImg"
                        />
                      </span>{" "}
                      Please select your city
                    </div>
                  )}
                </div>
                <div className="formControll">
                  <label htmlFor="area">Area</label>
                  <SearchableSelect
                    type="area"
                    options={areaOptions}
                    value={values?.area}
                    onChangeHandler={setValueCalculatePrice}
                  />
                  {errors.area && touched.area && (
                    <div className="inputError">
                      <div className="arrow-up"></div>
                      <span>
                        <img
                          className="errorImage"
                          src={"/images/images/error.jpeg"}
                          alt="errorImg"
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
                    value={values.address}
                    onChange={(e) => handleChange(e)}
                    onFocus={() => pushDatalyer("Documents Printing", "Address")}
                    type="text"
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
                          alt="errorImg"
                        />
                      </span>{" "}
                      Please enter your address
                    </div>
                  )}
                </div>

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
                      pushDropdownLayer("Documents Printing", "Privacy Preference", e.target?.value);
                    }}
                    onFocus={() => pushDatalyer("Documents Printing", "Privacy Preference")}
                  >
                    <option
                      value=""
                      label="Choose Your Privacy Preference"
                      selected
                      disabled
                    />
                    {privacyDocOptions.map((option) => (
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
              <div className="formControll">
                <p className="fw-medium font-secondary special-label order-option-label">
                  Please Choose The Print Size And Whether Printed In Color Or
                  Black And White
                </p>
              </div>
              <div className="formControll">
                <div>
                  <input
                    checked={values.A4Print}
                    onChange={(e) => {
                      setValueCalculatePrice("A4Print", !values.A4Print);
                    }}
                    onFocus={() => pushDatalyer("Documents Printing", "A4 Print")}
                    type="checkbox"
                    name="img-bg"
                  />
                  <label
                    className="margin-left-15 font-simple"
                    htmlFor="img-bg"
                  >
                    A4{" "}
                  </label>
                  <br />
                </div>
                {values.A4Print && (
                  <>
                    <div className="formControll custom-dropzone--container">
                      <label className="order-option-label">A4 Color Print</label>
                      <label style={{ margin: 0 }}>
                        <FileUploadingStatus files={filesForColorPrint.a4} />
                      </label>
                      <FileDropzone
                        orderType="DOCUMENT_PRINT"
                        files={filesForColorPrint.a4}
                        setFiles={(files: any) =>
                          setFiles(files, "color_print", "a4")
                        }
                        pages={0}
                        setPages={() => { }}
                        showCounters={true}
                        showDuplex={true}
                        showPaper={true}
                        zoom={true}
                        data={data}
                      />
                      <UploadInfoLabel supportedTypes={DOCUMENT_FILE_TYPES} />
                      {!filesForA4PrintValid.colorPrint && (
                        <div className="inputError">
                          <div className="arrow-up"></div>
                          <span>
                            <img
                              className="errorImage"
                              src={"/images/images/error.jpeg"}
                            />
                          </span>{" "}
                          Per file size should not exceed 10MB, please use an
                          online tool to compress the photos greater than 10MB
                          and re-upload
                        </div>
                      )}
                    </div>

                    <div className="formControll custom-dropzone--container">
                      <label className="order-option-label">A4 Black &amp; White Print</label>
                      <label style={{ margin: 0 }}>
                        <FileUploadingStatus files={filesForBlackAndWhitePrint.a4} />
                      </label>
                      <FileDropzone
                        orderType="DOCUMENT_PRINT"
                        files={filesForBlackAndWhitePrint.a4}
                        setFiles={(files: any) =>
                          setFiles(files, "black_white_print", "a4")
                        }
                        pages={0}
                        setPages={() => { }}
                        showCounters={true}
                        showDuplex={true}
                        showPaper={true}
                        zoom={true}
                        data={data}
                      />
                      <UploadInfoLabel supportedTypes={DOCUMENT_FILE_TYPES} />
                      {!filesForA4PrintValid.blackAndWhitePrint && (
                        <div className="inputError">
                          <div className="arrow-up"></div>
                          <span>
                            <img
                              className="errorImage"
                              src={"/images/images/error.jpeg"}
                            />
                          </span>{" "}
                          Per file size should not exceed 10MB, please use an
                          online tool to compress the photos greater than 10MB
                          and re-upload
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
                      setValueCalculatePrice("A3Print", !values.A3Print);
                    }}
                    onFocus={() => pushDatalyer("Documents Printing", "A3 Print")}
                    name="img-bg"
                  />
                  <label
                    className="margin-left-15 font-simple"
                    htmlFor="img-bg"
                  >
                    A3
                  </label>
                  <br />
                </div>
              </div>
              {values.A3Print && (
                <>
                  <div className="formControll custom-dropzone--container">
                    <label className="order-option-label">A3 Color Print</label>
                    <label style={{ margin: 0 }}>
                      <FileUploadingStatus files={filesForColorPrint.a3} />
                    </label>
                    <FileDropzone
                      orderType="DOCUMENT_PRINT"
                      files={filesForColorPrint.a3}
                      setFiles={(files: any) =>
                        setFiles(files, "color_print", "a3")
                      }
                      pages={0}
                      setPages={() => { }}
                      showCounters={true}
                      showDuplex={true}
                      showPaper={true}
                      zoom={true}
                      data={data}
                    />
                    <UploadInfoLabel supportedTypes={DOCUMENT_FILE_TYPES} />
                    {!filesForA3PrintValid.colorPrint && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                          />
                        </span>{" "}
                        Per file size should not exceed 10MB, please use an
                        online tool to compress the photos greater than 10MB and
                        re-upload
                      </div>
                    )}
                  </div>

                  <div className="formControll custom-dropzone--container">
                    <label className="order-option-label">A3 Black &amp; White Print</label>
                    <label style={{ margin: 0 }}>
                      <FileUploadingStatus files={filesForBlackAndWhitePrint.a3} />
                    </label>
                    <FileDropzone
                      orderType="DOCUMENT_PRINT"
                      files={filesForBlackAndWhitePrint.a3}
                      setFiles={(files: any) =>
                        setFiles(files, "black_white_print", "a3")
                      }
                      pages={0}
                      setPages={() => { }}
                      showCounters={true}
                      showDuplex={true}
                      showPaper={true}
                      zoom={true}
                      data={data}
                    />
                    <UploadInfoLabel supportedTypes={DOCUMENT_FILE_TYPES} />
                    {!filesForA3PrintValid.blackAndWhitePrint && (
                      <div className="inputError">
                        <div className="arrow-up"></div>
                        <span>
                          <img
                            className="errorImage"
                            src={"/images/images/error.jpeg"}
                          />
                        </span>{" "}
                        Per file size should not exceed 10MB, please use an
                        online tool to compress the photos greater than 10MB and
                        re-upload
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="formControll any-comments">
                <label htmlFor="people">Any Comments</label>
                <textarea
                  data-formControlName="comments"
                  typeof="textarea"
                  value={values.comments}
                  onChange={handleChange}
                  onFocus={() => pushDatalyer("Documents Printing", "Any Comments")}
                  id="comments"
                  name="comments"
                />
              </div>
              <div className="formControll">
                <label htmlFor="people">Price</label>
                <input
                  readOnly
                  data-formControlName="price"
                  value={parseFloat(price + deliveryCharges).toFixed(2)}
                  type="text"
                  id="people"
                  name="people"
                />
                <div className="order-summary">
                  {renderDeliveryCharges()}
                  {values.A4Print && (
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
                  {values.A3Print && (
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
                  {laminationPrices && (
                    <>
                      {laminationPrices.map((laminationPrice: any, index: any) => (
                        <p key={index}>
                          {laminationPrice.type.toUpperCase()}{" "}{laminationPrice.laminationType}:{" "}{laminationPrice.totalPages} Pages x{" "}{laminationPrice.pricePerUnit} AED = {laminationPrice.totalPrice}{" "}AED
                        </p>
                      ))}
                    </>
                  )}
                  {
                    bindingPrices && (
                      <>
                        {bindingPrices.map((bindingPrice: any, index: any) => (
                          <p key={index}>
                            {bindingPrice.type.toUpperCase()}{" "}{bindingPrice.bindingType}:{" "}{bindingPrice.totalMultiplier} Documents x{" "}{bindingPrice.pricePerUnit} AED = {bindingPrice.totalPrice}{" "}AED
                          </p>
                        ))}
                      </>
                    )
                  }
                  <OrderTotalPrice total={Number(price) + Number(deliveryCharges)} />
                </div>
                {renderFileUploadSummary({
                  A4Print: values.A4Print,
                  A3Print: values.A3Print
                })}
              </div>
            </div>

            <br />
            <div id="form-container" className="formControll payment-form">
              <Checkout />
              {renderFileUploadProgress({
                A4Print: values.A4Print,
                A3Print: values.A3Print
              })}
              <div className="submit-button">
                <button type="submit" id="tap-btn"
                  disabled={checkFilesLoadings([...filesForBlackAndWhitePrint.a3, ...filesForBlackAndWhitePrint.a4, ...filesForColorPrint.a3, ...filesForColorPrint.a4])}>
                  Submit
                </button>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default DacumentPrintingForm;
