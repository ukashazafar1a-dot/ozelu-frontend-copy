"use client";
import React, { useRef, useState, useEffect } from "react";
import { Field, Formik, FieldArray, ErrorMessage } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import DeliveryChargesLine from "@/components/DeliveryChargesLine";
import MugLineUploads from "./MugLineUploads";
import TypeCard from "@/app/canvas-printing/_components/TypeCard";
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
  getMugLinePrice,
  getMugUnitPrice,
  getValidFiles,
} from "@/helpers/generals";
import { DeliveryArea, PageData } from "@/libs/types";
import { sortArrayAlphabetically } from "@/libs/utils";

function resolveMugImageSrc(image: unknown): string | undefined {
  if (!image) return undefined;
  if (typeof image === "object" && image !== null && "src" in image) {
    return String((image as { src?: string }).src || "");
  }
  return String(image);
}
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
      type: Yup.string().required("Mug Type is required"),
      quantity: Yup.string()
        .required("Quantity is required")
        .test(
          "valid-quantity",
          "Enter a whole number of at least 1",
          (value) => {
            if (value === undefined || value === null || value === "") {
              return false;
            }
            const qty = Number(value);
            return Number.isFinite(qty) && Number.isInteger(qty) && qty >= 1;
          }
        ),
    })
  ),
});

const FORM_NAME = "Mugs Printing" as const;

type props = {
  data: PageData;
  areas: DeliveryArea[] | null;
};

// Empty strings (not null) keep `<select>` placeholders visible after reset.
const defaultSize = {
  id: generateUniqueKey(),
  type: "",
  quantity: "",
  files: [],
};

function resolveUploadFileName(file: any) {
  if (file?.name) return file.name;
  if (file?.filename) return file.filename;
  const fromKey = typeof file?.key === "string" ? file.key.split("/").pop() : "";
  if (fromKey) return fromKey;
  return "mug-upload";
}

function getReadyUploadFiles(files: any) {
  return getValidFiles(files).filter(
    (file: any) =>
      file?.status === "uploaded" && file?.url && file?.key && resolveUploadFileName(file)
  );
}

function hasUploadsInProgress(sizes: any[]) {
  return (sizes || []).some(
    (size) =>
      Array.isArray(size?.files) &&
      size.files.some((file: any) => file?.status === "uploading")
  );
}

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
  sizes: [{ ...defaultSize }],
};

const parseConfiguredNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const MugsOrderForm = ({ data, areas }: props) => {
  const { tryCreateToken, mugsPrintingPrices, resetStripeElements, sessionId } = useApp();
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
  const [mugPrices, setMugPrices] = useState<any>([]);

  const [initialValues, setInitialValues] = useState<any>(defaultValues);

  const resetForm = function () {
    // ImageDropzone keeps internal `localFiles` that ignore parent prop changes
    // after mount. A fresh `size.id` remounts the row (upload slots + dropzones).
    formRef.current.resetForm({
      values: {
        ...defaultValues,
        sizes: [{ ...defaultSize, id: generateUniqueKey() }],
      },
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

  const getMugLinePricing = (line: any) => {
    const quantity = parseQuantity(line.quantity);
    const unitPrice = getMugUnitPrice(mugPrices, line.type, quantity);
    const lineTotal = getMugLinePrice(mugPrices, line.type, quantity);
    return { lineTotal, quantity, unitPrice };
  };

  const calculateGroupedPrices = (sizes: any[]) => {
    const groupedPrices: Record<string, any> = {};
    sizes.forEach((size) => {
      const key = `${size.type}-${size.quantity}`;
      const { lineTotal, quantity, unitPrice } = getMugLinePricing(size);
      if (!groupedPrices[key]) {
        groupedPrices[key] = {
          type: size.type,
          quantity,
          unitPrice,
          price: lineTotal,
        };
      }
    });
    return Object.values(groupedPrices);
  };

  function parseQuantity(value: unknown) {
    const qty = Number(value);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
      return 0;
    }
    return qty;
  }

  function calculateSingleLinePrice(line: any) {
    return getMugLinePricing(line).lineTotal;
  }

  function calculateTotalPrice(sizes: any) {
    let totalPrice = 0;
    sizes.forEach((size: any) => {
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
          mugsPrintingPrices,
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
          sizes?.forEach((size: any, index: any) => {
            if (!size?.type) return;
            const nameWithSize = `${size.type}_${size.quantity}${index}`;

            const validFiles = getReadyUploadFiles(size.files);

            validFiles.forEach((file: any) => {
              const originalName = resolveUploadFileName(file);
              const parts = originalName.split(".");
              const extension = parts.length > 1 ? parts.pop() : "jpg";
              const baseName =
                parts.length > 0 ? parts.join(".") : originalName;
              const filename = `${baseName}_${size.type}.${extension}`;
              filesMetaData.push({
                filename,
                url: file.url,
                key: file.key,
                size: nameWithSize,
                field: file.field || null,
              });
            });
            sizesMetaData.push({
              size: nameWithSize,
              name: size.type,
              type: size.type,
              quantity: parseQuantity(size.quantity),
              unitPrice: getMugLinePricing(size).unitPrice,
              price: calculateSingleLinePrice(size),
            });
          });
        fileUploading(FORM_NAME, filesMetaData, "started");

        formData.append("order_type", "mug_print");
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
          String(getDeliveryCharges(mugsPrintingPrices, area, areas))
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

  function addMugLine(arrayHelpers: any) {
    arrayHelpers.push({ ...defaultSize, id: generateUniqueKey() });
  }

  function renderPrintLineTotal(size: any) {
    return <>{size.price} AED</>;
  }

  function renderPrices(sizes: any[]) {
    const sizePrices = calculateGroupedPrices(sizes);
    if (!sizes || sizePrices.length === 0) {
      return "";
    }
    return sizePrices.map((size: any, index: any) => {
      if (!size.price || !size?.quantity || !size?.type) return "";
      return (
        <p key={index}>
          {size.type}: {size.quantity} Prints × {size.unitPrice} ={" "}
          {renderPrintLineTotal(size)}
        </p>
      );
    });
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(mugsPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles(){
    const { sizes } = getFormikValues();
    // console.log("Sizes",sizes)
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
    const minPrice = parseConfiguredNumber(data?.min_price);
    setPrice(minPrice);
    setFreeDeliveryThreshold(parseConfiguredNumber(data?.free_delivery_threshold));
    if (data?.mugs_prices && data.mugs_prices.length > 0) {
      setMugPrices(data.mugs_prices);
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
              <CheckoutActivityFormTracker orderType="MUG_PRINT" />
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
                                (size: any, index: any, array: any) => {
                                  return (
                                    <div
                                      className="custom-sizes-container"
                                      key={size.id}
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
                                      <div className="formControll">
                                        <label
                                          htmlFor={`quantity-${index}`}
                                          className="order-option-label"
                                        >
                                          Quantity
                                        </label>
                                        <Field
                                          type="number"
                                          min={1}
                                          step={1}
                                          id={`quantity-${index}`}
                                          name={`sizes[${index}].quantity`}
                                          className="selectOptionsCustom new-custom-field-rf input-hidden-arrows"
                                          placeholder="Type Any Quantity"
                                          onChange={(e: any) => {
                                            handleChange(e);
                                            calculatePrice();
                                          }}
                                        />
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].quantity`}
                                        />
                                      </div>
                                      <div
                                        className="formControll mb-2"
                                        style={{ marginTop: "20px" }}
                                      >
                                        <label className="font-secondary single-label order-option-label">
                                          Mug Type
                                        </label>
                                      </div>
                                      <div className="formControll mugs-type-cards-field">
                                        <div className="type-cards-flex d-flex smart_scroll align-items-start justify-content-start gap-2 pb-2">
                                          {mugPrices.length > 0 &&
                                            mugPrices.map((mug: any) => (
                                              <TypeCard
                                                key={mug._id || mug.value}
                                                title={mug.value}
                                                value={mug.value}
                                                handleOnClick={(value: any) => {
                                                  setFieldValue(
                                                    `sizes[${index}].type`,
                                                    value
                                                  );
                                                  pushDatalyer(
                                                    FORM_NAME,
                                                    "Mug Type"
                                                  );
                                                  calculatePrice();
                                                }}
                                                selected={
                                                  mug.value === size.type
                                                }
                                                image={resolveMugImageSrc(
                                                  mug?.image
                                                )}
                                              />
                                            ))}
                                        </div>
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].type`}
                                        />
                                      </div>
                                      <MugLineUploads
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
                                        }}
                                      />
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
                              onClick={() => addMugLine(arrayHelpers)}
                            >
                              Add Another Mug
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

export default MugsOrderForm;
