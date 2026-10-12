"use client";
import React, { useRef, useState, useEffect } from "react";
import { Field, Formik, FieldArray, ErrorMessage } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import ImageDropzone from "../../../components/Dropzones/ImageDropzone";
import Checkout from "../../../components/Checkout";
import SearchableSelect from "../../../components/SearchableSelect";
import useApp from "../../../store/useApp";
import * as Yup from "yup";
import LoadingProgress from "../../../components/LoadingProgress";
import showCustomPopup from "@/components/NoSwal";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import DeliveryChargesLine from "@/components/DeliveryChargesLine";
import { FLYERS_SUPPORTED_TYPES } from "@/constants/uploadSupportedTypes";
import { privacyOptions } from "@/utils";
import {
  checkFreeDelivery,
  generateUniqueKey,
  getDeliveryCharges,
  getValidFiles,
  hasValidFiles,
} from "@/helpers/generals";
import { BrochurePrice, DeliveryArea, PageData } from "@/libs/types";
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
import FileUploadingStatus from "@/components/FileUploadingStatus";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadProgress from "@/components/FileUploadProgress";

const FORM_NAME = "Brochures Printing" as const;

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
      brochure_type: Yup.string().required("Brochure Type is required"),
      pages: Yup.string().required("Number of Pages is required"),
      quantity: Yup.string().required("Quantity is required"),
    }),
  ),
});

type Props = {
  data: PageData;
  areas: DeliveryArea[] | null;
};

const defaultSize = {
  id: generateUniqueKey(),
  brochure_type: "",
  pages: "",
  quantity: "",
  files: [],
};

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

function calculateSingleSizePrice(
  size: any,
  prices: BrochurePrice[],
): number | null {
  if (!size?.brochure_type || !size?.pages || !size?.quantity) {
    return null;
  }
  const brochureType = prices.find((p) => p.value === size.brochure_type);
  if (!brochureType) return null;
  const column = brochureType.columns?.find((c) => c.key === size.pages);
  if (!column) return null;
  const quantityPrice = column.quantities?.find(
    (q) => q.value == size.quantity,
  );
  if (
    !quantityPrice ||
    typeof quantityPrice.price !== "number" ||
    quantityPrice.price <= 0
  ) {
    return null;
  }
  return quantityPrice.price;
}

const BrochuresOrderForm = ({ data, areas }: Props) => {
  const {
    tryCreateToken,
    brochuresPrintingPrices,
    resetStripeElements,
    sessionId,
  } = useApp();
  const formRef = useRef<any>();
  const submitLockRef = useRef(false);
  const [showLoading, setShowLoading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [price, setPrice] = useState<any>(
    data?.min_price ? data?.min_price : 0,
  );
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [orderValue, setOrderValue] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<any>(
    data?.free_delivery_threshold ? data?.free_delivery_threshold : 0,
  );
  const [prices, setPrices] = useState<BrochurePrice[]>([]);

  const [initialValues] = useState<any>(defaultValues);

  const releaseSubmitLock = () => {
    submitLockRef.current = false;
    setShowLoading(false);
  };

  const resetForm = function () {
    formRef.current.resetForm({
      values: {
        ...defaultValues,
        sizes: [{ ...defaultSize, id: generateUniqueKey() }],
      },
    });
    setPercentageUploaded(0);
    submitLockRef.current = false;
    calculatePrice();
    resetStripeElements();
  };

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    if (!formikValues) return {};
    return formikValues;
  };

  const calculateGroupedPrices = (sizes: any[], brochurePrices: BrochurePrice[]) => {
    const groupedPrices: Record<string, any> = {};

    sizes.forEach((size) => {
      const key = `${size.brochure_type}-${size.pages}-${size.quantity}`;
      const linePrice = calculateSingleSizePrice(size, brochurePrices);
      if (linePrice == null) return;
      const qty = Number(size.quantity) || 0;

      if (!groupedPrices[key]) {
        groupedPrices[key] = {
          brochure_type: size.brochure_type,
          pages: size.pages,
          quantity: qty,
          price: linePrice,
        };
      } else {
        // Keep qty in sync when identical lines merge so unit price stays correct
        groupedPrices[key].price += linePrice;
        groupedPrices[key].quantity += qty;
      }
    });

    return Object.values(groupedPrices);
  };

  function calculateTotalPrice(sizes: any, brochurePrices: BrochurePrice[]) {
    let totalPrice = 0;
    sizes.forEach((size: any) => {
      if (size.hasOwnProperty("isSelected") && !size.isSelected) return;
      const line = calculateSingleSizePrice(size, brochurePrices);
      if (line == null) return;
      totalPrice += line;
    });
    return totalPrice;
  }

  function hasInvalidLinePricing(sizes: any[]) {
    return (sizes || []).some((size: any) => {
      if (size.hasOwnProperty("isSelected") && !size.isSelected) return false;
      if (!size?.brochure_type || !size?.pages || !size?.quantity) {
        return true;
      }
      return calculateSingleSizePrice(size, prices) == null;
    });
  }

  function calculatePrice() {
    setTimeout(() => {
      setPrice(0);
      setOrderValue(0);
      let newOrderValue = 0;
      let newDeliveryCharges = 0;
      const { sizes, area } = getFormikValues();

      let value = newOrderValue + calculateTotalPrice(sizes, prices);
      value = parseFloat(value.toFixed(2));
      newOrderValue = value;

      const minPrice =
        typeof data?.min_price === "number" ? data.min_price : 0;
      if (minPrice > 0 && newOrderValue < minPrice) {
        newOrderValue = minPrice;
      }

      setOrderValue(newOrderValue);
      setPrice(newOrderValue);

      if (checkFreeDelivery(newOrderValue, freeDeliveryThreshold)) {
        newDeliveryCharges = 0;
      } else {
        newDeliveryCharges = getDeliveryCharges(
          brochuresPrintingPrices,
          area,
          areas,
        );
      }

      setDeliveryCharges(newDeliveryCharges);
    }, 100);
  }

  function onSubmit() {
    if (submitLockRef.current || showLoading) {
      return;
    }
    if (!data?.isActive) {
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

    if (hasInvalidLinePricing(sizes)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please choose a valid Brochure Type, Number of Pages, and Quantity with a listed price.",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
      formSubmission(FORM_NAME, "form_submission_error", {
        title: "Validation Error",
        text: "Invalid brochure pricing selection",
      });
      return;
    }

    let haveFiles = hasValidFiles(sizes);
    if (!haveFiles) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please upload your brochure artwork files!",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
      formSubmission(FORM_NAME, "form_submission_error", {
        title: "Validation Error",
        text: "Please upload your brochure artwork files!",
      });
      return;
    }

    submitLockRef.current = true;
    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart(FORM_NAME);
      if (token === undefined || token === "") {
        formSubmission(FORM_NAME, "form_submission_error", {
          text: "Error while getting token",
        });
        releaseSubmitLock();
      } else {
        const formData = new FormData();
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        sizes &&
          sizes?.forEach((size: any, index: any) => {
            const brochureType = prices.find(
              (item) => item.value === size?.brochure_type,
            );
            const column = brochureType?.columns?.find(
              (c) => c.key === size.pages,
            );
            const displayName =
              column?.label ||
              `${brochureType?.label || size.brochure_type}`;
            const nameWithSize = `${displayName}_${size.brochure_type + size.pages + size.quantity + index}`;

            const validFiles = getValidFiles(size.files);

            validFiles.forEach((file: any) => {
              const extension = file.name.split(".").pop();
              const filename = `${file.name
                .split(".")
                .slice(0, -1)
                .join(".")}_${displayName}.${extension}`;
              filesMetaData.push({
                filename,
                url: file.url,
                key: file.key,
                size: nameWithSize,
              });
            });
            const linePrice = calculateSingleSizePrice(size, prices) ?? 0;
            const qty = Number(size.quantity) || 0;
            sizesMetaData.push({
              size: nameWithSize,
              name: `${brochureType?.label || size.brochure_type} - ${column?.label || size.pages}`,
              brochure_type: size.brochure_type,
              brochure_type_label: brochureType?.label || size.brochure_type,
              kind: brochureType?.kind || "",
              format: brochureType?.format || "",
              pages: size.pages,
              pages_label: column?.label || size.pages,
              quantity: size.quantity,
              price: linePrice,
              unit_price:
                qty > 0 ? parseFloat((linePrice / qty).toFixed(2)) : linePrice,
            });
          });
        fileUploading(FORM_NAME, filesMetaData, "started");
        formData.append("order_type", "brochure_print");
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
          parseFloat(price + deliveryCharges).toFixed(2),
        );
        formData.append("token", token.id);
        if (sessionId) formData.append("session_id", sessionId);
        formData.append("delivery_charges", String(deliveryCharges));
        formData.append(
          "free_delivery",
          String(checkFreeDelivery(price, freeDeliveryThreshold)),
        );

        try {
          const { data: orderResponse } = await axios({
            data: formData,
            method: "post",
            url: process.env.NEXT_PUBLIC_API_URL + "/api/createOrder",
            headers: {
              "Content-Type": "application/json",
            },
            onUploadProgress: (progressEvent: any) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setPercentageUploaded(progress);
            },
          });

          fileUploading(FORM_NAME, filesMetaData, "completed");
          const { order_id, customer_id } = orderResponse;

          axios
            .post(process.env.NEXT_PUBLIC_API_URL + "/api/stripe/pay", {
              order_id,
              customer_id,
              session_id: sessionId,
            })
            .then((response) => {
              if (response.data.status) {
                releaseSubmitLock();
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
                releaseSubmitLock();
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
                formSubmission(FORM_NAME, "form_submission_error", {
                  title: "Oops...",
                  text:
                    response?.data?.message ||
                    "Failed to collect your payment.",
                });
              }
            })
            .catch((err) => {
              releaseSubmitLock();
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
              formSubmission(FORM_NAME, "form_submission_error", {
                title: "Oops...",
                text:
                  err?.response?.data?.message ||
                  "Failed to collect your payment.",
              });
            });
        } catch (error: any) {
          releaseSubmitLock();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats. If error still persists, please contact us on care@ozelu.com or WhatsApp us. Or try submitting again as it might just be your internet speed and if it still doesn't work, please don't hesitate to get in touch with us.`
            }`,
            showLoaderOnConfirm: false,
            showLoaderOnDeny: false,
            loaderHtml: `<div></div>`,
          });
          formSubmission(FORM_NAME, "form_submission_error", {
            title: "Oops...",
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats.`
            }`,
          });
        }
      }
    });
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer(FORM_NAME, type, value);
    if (type === "city") {
      formRef.current.setFieldValue("area", "");
      const filteredAreas = areas?.filter((area: any) => area?.city === value);
      const sortedAreas = filteredAreas?.sort((a: any, b: any) => {
        if (a?.name < b?.name) return -1;
        if (a?.name > b?.name) return 1;
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

  function addBrochure(arrayHelpers: any) {
    arrayHelpers.push({ ...defaultSize, id: generateUniqueKey() });
  }

  function getColumns(brochureTypeValue: string) {
    const brochureType = prices.find((p) => p.value === brochureTypeValue);
    return brochureType?.columns || [];
  }

  function getQuantities(brochureTypeValue: string, pagesKey: string) {
    const column = getColumns(brochureTypeValue).find(
      (c) => c.key === pagesKey,
    );
    return column?.quantities?.map((q) => q.value) || [];
  }

  function renderPrices(sizes: any[]) {
    const sizePrices = calculateGroupedPrices(sizes, prices);
    if (!sizes || sizePrices.length === 0) {
      return "";
    }
    return sizePrices.map((size: any, index: any) => {
      const brochureType = prices.find(
        (item) => item.value === size?.brochure_type,
      );
      const column = brochureType?.columns?.find((c) => c.key === size.pages);
      if (price === 0 || !brochureType || !column) return "";
      const qty = Number(size.quantity) || 0;
      const lineTotal = Number(size.price) || 0;
      const unitPrice =
        qty > 0 ? parseFloat((lineTotal / qty).toFixed(2)) : lineTotal;
      return (
        <p key={index}>
          {brochureType.label}
          {" - "}
          {column.label}: {size.quantity} Prints x {unitPrice} AED ={" "}
          {size.price}
          {" AED"}
        </p>
      );
    });
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(brochuresPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles() {
    const { sizes } = getFormikValues();
    const files = (sizes || []).flatMap((size: any) =>
      Array.isArray(size.files) ? size.files : [],
    );
    return files;
  }

  function renderFileUploadSummary() {
    const files = getAllFiles();
    return <FileUploadSummary files={files} />;
  }

  function renderFileUploadProgress() {
    const files = getAllFiles();
    return <FileUploadProgress files={files} />;
  }

  useEffect(() => {
    if (!areas) return;
    const sortedAreas = sortArrayAlphabetically(areas);
    let options: any = sortedAreas?.map((area: any) => ({
      value: area.name,
      label: area.name,
    }));
    setAreaOptions(options);
  }, [areas]);

  useEffect(() => {
    setPrice(data?.min_price ? data?.min_price : 0);
    if (data?.brochure_prices && data.brochure_prices.length > 0) {
      setPrices(data.brochure_prices);
    }
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
    let optionsTwo: any = allCities.sort().map((city: any) => ({
      value: city,
      label: city,
    }));

    const firstCity = optionsTwo[0];
    areas.forEach((area: any) => {
      if (area?.city === firstCity?.value) {
        allAreas.push({ value: area?.name, label: area?.name });
      }
    });
    if (formRef.current) {
      formRef.current.setFieldValue("city", firstCity?.value);
    }
    const sortedAreas = sortArrayAlphabetically(allAreas);
    setAreaOptions(sortedAreas);
    setCityOptions(optionsTwo);
  }, [areas]);

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
        validate={() => {
          calculatePrice();
        }}
        onSubmit={() => {
          onSubmit();
        }}
      >
        {({
          values,
          errors,
          touched,
          handleSubmit,
          handleChange,
          setFieldValue,
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
                    Swal.fire({
                      icon: "error",
                      title: "Validation Error",
                      text: `Please fill all fields!`,
                      showLoaderOnConfirm: false,
                      showLoaderOnDeny: false,
                      loaderHtml: `<div></div>`,
                    });
                    formSubmission(FORM_NAME, "form_submission_error", {
                      title: "Validation Error",
                      text: `Please fill all fields!`,
                      errors,
                    });
                    handleSubmit();
                  } else {
                    handleSubmit();
                  }
                });
              }}
            >
              <CheckoutActivityFormTracker orderType="BROCHURE_PRINT" />
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
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "First Name")}
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
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "Last Name")}
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
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "Email")}
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
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "Phone Number")}
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
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "Address")}
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
                          e.target?.value,
                        );
                      }}
                      onFocus={() =>
                        pushDatalyer(FORM_NAME, "Privacy Preference")
                      }
                    >
                      <option
                        value=""
                        label="Choose Your Privacy Preference"
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
                              {values.sizes.map((size: any, index: any) => {
                                const pageColumns = getColumns(
                                  size.brochure_type,
                                );
                                const quantityOptions = getQuantities(
                                  size.brochure_type,
                                  size.pages,
                                );
                                return (
                                  <div
                                    className="custom-sizes-container"
                                    key={size.id}
                                  >
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
                                          htmlFor={`brochureType-${index}`}
                                          className="order-option-label"
                                        >
                                          Brochure Type
                                        </label>
                                        <Field
                                          as="select"
                                          id={`brochureType-${index}`}
                                          name={`sizes[${index}].brochure_type`}
                                          className="selectOptionsCustom new-custom-field-rf"
                                          onChange={(e: any) => {
                                            handleChange(e);
                                            setFieldValue(
                                              `sizes[${index}].pages`,
                                              "",
                                            );
                                            setFieldValue(
                                              `sizes[${index}].quantity`,
                                              "",
                                            );
                                            const selected = prices.find(
                                              (p) => p.value === e.target?.value,
                                            );
                                            pushDropdownLayer(
                                              FORM_NAME,
                                              "Brochure Type",
                                              selected?.label ||
                                                e.target?.value ||
                                                "",
                                            );
                                          }}
                                        >
                                          <option
                                            value=""
                                            label="Choose Your Brochure Type"
                                            disabled
                                          />
                                          {prices.map((t) => (
                                            <option key={t.value} value={t.value}>
                                              {t.label}
                                            </option>
                                          ))}
                                        </Field>
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].brochure_type`}
                                        />
                                      </div>
                                      <div className="formControll">
                                        <label
                                          htmlFor={`pages-${index}`}
                                          className="order-option-label"
                                        >
                                          Number of Pages
                                        </label>
                                        <Field
                                          as="select"
                                          id={`pages-${index}`}
                                          name={`sizes[${index}].pages`}
                                          className="selectOptionsCustom new-custom-field-rf"
                                          onChange={(e: any) => {
                                            handleChange(e);
                                            setFieldValue(
                                              `sizes[${index}].quantity`,
                                              "",
                                            );
                                            const col = pageColumns.find(
                                              (c) => c.key === e.target?.value,
                                            );
                                            pushDropdownLayer(
                                              FORM_NAME,
                                              "Number of Pages",
                                              col?.label || e.target?.value || "",
                                            );
                                          }}
                                        >
                                          <option
                                            value=""
                                            label="Choose Number of Pages to Print"
                                            disabled
                                          />
                                          {pageColumns.map((c) => (
                                            <option key={c.key} value={c.key}>
                                              {c.label}
                                            </option>
                                          ))}
                                        </Field>
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].pages`}
                                        />
                                      </div>
                                      <div className="formControll">
                                        <label
                                          htmlFor={`quantity-${index}`}
                                          className="order-option-label"
                                        >
                                          Quantity
                                        </label>
                                        <Field
                                          as="select"
                                          id={`quantity-${index}`}
                                          name={`sizes[${index}].quantity`}
                                          className="selectOptionsCustom new-custom-field-rf"
                                          onChange={(e: any) => {
                                            handleChange(e);
                                            pushDropdownLayer(
                                              FORM_NAME,
                                              "Quantity",
                                              e.target?.value,
                                            );
                                          }}
                                        >
                                          <option
                                            value=""
                                            label="Choose Number of Brochure Prints"
                                            disabled
                                          />
                                          {quantityOptions.map((q: any) => (
                                            <option key={q} value={q}>
                                              {q}
                                            </option>
                                          ))}
                                        </Field>
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].quantity`}
                                        />
                                      </div>
                                    </div>
                                    <div className="custom-dropzone--container formControll upload-zone-after-fields">
                                      <label style={{ margin: 0 }}>
                                        <FileUploadingStatus files={size.files} />
                                      </label>
                                      <ImageDropzone
                                        orderType="BROCHURE_PRINT"
                                        files={size.files}
                                        setFiles={(files: any) => {
                                          setFieldValue(
                                            `sizes[${index}].files`,
                                            files,
                                          );
                                          setFieldTouched(
                                            `sizes[${index}].files`,
                                            true,
                                            true,
                                          );
                                          calculatePrice();
                                        }}
                                        zoom={true}
                                        page="psp-page"
                                        allowAllFileTypes={true}
                                      />
                                      <UploadInfoLabel
                                        supportedTypes={FLYERS_SUPPORTED_TYPES}
                                      />
                                      <ErrorMessage name={`files`}>
                                        {() => (
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
                                            Per file size should not exceed 10MB,
                                            please use an online tool to compress
                                            the photos greater than 10MB and
                                            re-upload
                                          </div>
                                        )}
                                      </ErrorMessage>
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                          <div className="formControll mt-3 mb-1">
                            <button
                              className="btn--primary-new "
                              type="button"
                              style={{ width: "fit-content" }}
                              onClick={() => addBrochure(arrayHelpers)}
                            >
                              Add Another Brochure
                            </button>
                          </div>
                        </>
                      );
                    }}
                  />
                </div>

                <div className="formControll mt-1">
                  <div className="formControll any-comments">
                    <label htmlFor="people">Any Comments</label>
                    <textarea
                      data-formControlName="comments"
                      typeof="textarea"
                      value={values.comments}
                      onFocus={() => pushDatalyer(FORM_NAME, "Any Comments")}
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
                <Checkout />
                {renderFileUploadProgress()}
                <div className="submit-button">
                  <button
                    type="submit"
                    id="tap-btn"
                    disabled={showLoading}
                  >
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

export default BrochuresOrderForm;
