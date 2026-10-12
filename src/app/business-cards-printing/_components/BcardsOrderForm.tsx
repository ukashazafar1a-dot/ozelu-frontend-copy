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
import { BUSINESS_CARD_FILE_TYPES } from "@/constants/uploadSupportedTypes";
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
      type: Yup.string().required("Card Type is required"),
      size: Yup.string().required("Card Size is required"),
      quantity: Yup.string().required("Card Quantity is required"),
      finishing: Yup.string().required("Finishing Type is required"),
    })
  ),
});

type props = {
  data: PageData;
  areas: DeliveryArea[] | null;
};

const defaultSize = {
  id: generateUniqueKey(),
  type: null,
  size: null,
  quantity: null,
  finishing: null,
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

const BcardsOrderForm = ({ data, areas }: props) => {
  const { tryCreateToken, businessCardsPrintingPrices, resetStripeElements, sessionId } = useApp();
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
  const [quantities, setQuantities] = useState<any>([]);
  const [prices, setPrices] = useState<any>([]);
  const [types, setTypes] = useState<any>([]);
  const [finishings, setFinishings] = useState<any>([]);

  const [initialValues, setInitialValues] = useState<any>(defaultValues);

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

  const calculateGroupedPrices = (sizes: any[], prices: any[]) => {
    const groupedPrices: Record<string, any> = {};

    sizes.forEach((size) => {
      const key = `${size.type}-${size.size}-${size.quantity}`;
      const price = calculateSingleSizePrice(size, prices);

      if (!groupedPrices[key]) {
        groupedPrices[key] = {
          type: size.type,
          size: size.size,
          quantity: size.quantity,
          price: price, // Initial price
        };
      } else {
        groupedPrices[key].price += price; // Sum up prices
      }
    });

    return Object.values(groupedPrices);
  };

  const calculateGroupedFinishingPrices = (sizes: any[], finishings: any[]) => {
    const groupedFinishingPrices: Record<string, any> = {};

    sizes.forEach((size) => {
      const key = `${size.type}-${size.size}-${size.quantity}-${size.finishing}`;
      const price = calculateSingleSizeFinishingPrice(size, finishings);

      if (!groupedFinishingPrices[key]) {
        groupedFinishingPrices[key] = {
          type: size.type,
          size: size.size,
          quantity: size.quantity,
          finishing: size.finishing,
          price: price, // Initial price
        };
      } else {
        groupedFinishingPrices[key].price += price; // Sum up prices
      }
    });

    return Object.values(groupedFinishingPrices);
  };

  function calculateSingleSizePrice(size: any, prices: any) {
    const sizeCategory = prices.find((p: any) => p._id === size.size);
    if (!sizeCategory) return 0;

    const typeCategory = sizeCategory.types.find(
      (t: any) => t.value === size.type
    );
    if (!typeCategory) return 0;

    const quantityPrice = typeCategory.quantities.find(
      (q: any) => q.value == size.quantity
    );
    if (!quantityPrice) return 0;

    return quantityPrice.price;
  }

  function calculateSingleSizeFinishingPrice(size: any, finishings: any) {
    const finishing = finishings.find((f: any) => f.value === size.finishing);
    if (!finishing) return 0;
    return finishing.price;
  }

  function calculateTotalPrice(sizes: any, prices: any) {
    let totalPrice = 0;

    sizes.forEach((size: any) => {
      // ✅ Only calculate price if size is selected (if isSelected property exists)
      if (size.hasOwnProperty('isSelected') && !size.isSelected) return;
      const sizeCategory = prices.find((p: any) => p._id === size.size);
      if (!sizeCategory) return;

      const typeCategory = sizeCategory.types.find(
        (t: any) => t.value === size.type
      );
      if (!typeCategory) return;

      const quantityPrice = typeCategory.quantities.find(
        (q: any) => q.value == size.quantity
      );
      if (!quantityPrice) return;

      totalPrice += quantityPrice.price;
    });

    return totalPrice;
  }

  function calculateFinishingTotal(sizes: any, finishings: any) {
    let totalFinishingPrice = 0;

    sizes.forEach((size: any) => {
      // ✅ Only calculate price if size is selected (if isSelected property exists)
      if (size.hasOwnProperty('isSelected') && !size.isSelected) return;
      const finishing = finishings.find((f: any) => f.value === size.finishing);
      if (!finishing) return;
      totalFinishingPrice += finishing.price;
    });
    return totalFinishingPrice;
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
        calculateTotalPrice(sizes, prices) +
        calculateFinishingTotal(sizes, finishings);
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
          businessCardsPrintingPrices,
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
    formSubmission("Business Cards Printing", "form_submission_error");
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
      formSubmission("Business Cards Printing", "form_submission_error", {
        title: "Validation Error",
        text: "Please upload picture!",
      });
      return;
    }

    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart("Business Cards Printing");
      if (token === undefined || token === "") {
        console.log("Error while getting token");
        formSubmission("Business Cards Printing", "form_submission_error", {
          text: "Error while getting token",
        });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        // console.log("Sizes", sizes);

        sizes &&
          sizes?.forEach((size: any, index: any) => {
            const selectedSize = prices.find(
              (item: any) => item._id === size?.size
            );
            //Here embed type and quantity in name becouse we have multiple
            //sizes with same name but could be different type and quantity.
            const name = `${selectedSize.width}mmX${
              selectedSize.height
            }mm (${parseFloat(
              (selectedSize.width / 10).toFixed(2)
            )}cmx${parseFloat((selectedSize.height / 10).toFixed(2))}cm)`;
            const nameWithSize = `${name}_${size.type + size.quantity + index}`;

            const validFiles = getValidFiles(size.files);

            validFiles.forEach((file: any) => {
              const extension = file.name.split(".").pop();
              const filename = `${file.name
                .split(".")
                .slice(0, -1)
                .join(".")}_${name}.${extension}`;
              filesMetaData.push({
                filename,
                url: file.url,
                key: file.key,
                size: nameWithSize,
              });
            });
            sizesMetaData.push({
              size: nameWithSize,
              name: selectedSize.name,
              type: size.type,
              quantity: size.quantity,
              finishing: {
                value: size.finishing,
                price: calculateSingleSizeFinishingPrice(size, finishings),
              },
              price: calculateSingleSizePrice(size, prices),
            });
          });
        fileUploading("Business Cards Printing", filesMetaData, "started");
        formData.append("order_type","business_card");
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
          String(getDeliveryCharges(businessCardsPrintingPrices, area, areas))
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

          fileUploading("Business Cards Printing", filesMetaData, "completed");
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
                pushOrderLayer("Business Cards Printing", object);
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
                  "Business Cards Printing",
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
                "Business Cards Printing",
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
          formSubmission("Business Cards Printing", "form_submission_error", {
            title: "Oops...",
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats, that is, JPG/JPEG, PNG, TIF, HEIC & other generic image formats. If error still persists, please contact us on our email on care@ozelu.com or WhatsApp us, we will surely help you. Or try submitting again as it might just be your internet speed and if it still doesn’t work, please don’t hesitate to get in touch with us.`
            }`,
          });
        }
      }
    });
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer("Business Cards Printing", type, value);
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

  function addBusinessCard(arrayHelpers: any) {
    arrayHelpers.push({ ...defaultSize, id: generateUniqueKey() });
    const length = arrayHelpers.form.values.sizes.length;
    formRef.current.setFieldValue(
      `sizes[${length}].finishing`,
      data.business_cards_finishing_types[0].value
    );
  }

  function renderPrices(sizes: any[]) {
    const sizePrices = calculateGroupedPrices(sizes, prices);
    if (!sizes || sizePrices.length === 0) {
      return "";
    }
    return sizePrices.map((size: any, index: any) => {
      const selectedSize = prices.find((item: any) => item._id === size?.size);
      if (price === 0 || !selectedSize) return "";
      let sizeLabel = (
        <>
          {selectedSize.width}mm X {selectedSize.height}mm (
          {selectedSize.width / 10}cm X {selectedSize.height / 10}cm)
          {size.type ? ` - ${size.type}` : ""}
          {" - "}
          {selectedSize.name}
        </>
      );
      return (
        <p key={index}>
          {sizeLabel}: {size.quantity} Prints = {size.price}
          {" AED"}
        </p>
      );
    });
  }

  function renderFinishingPrices(sizes: any[]) {
    const finishingPrices = calculateGroupedFinishingPrices(sizes, finishings);
    //console.log("Finishing Prices", finishingPrices);
    if (!sizes || finishingPrices.length === 0) {
      return "";
    }

    return finishingPrices.map((size: any, index: any) => {
      const selectedSize = prices.find((item: any) => item._id === size?.size);
      if (
        size.price === 0 ||
        !selectedSize ||
        !size?.quantity ||
        !size?.finishing
      )
        return "";
      //console.log(size);
      let sizeLabel = (
        <>
          {selectedSize.width}mm X {selectedSize.height}mm (
          {selectedSize.width / 10}cm X {selectedSize.height / 10}cm){" - "}
          {size.finishing}
        </>
      );
      return (
        <p key={index}>
          {sizeLabel}: {size.quantity} Prints = {size.price}
          {" AED"}
        </p>
      );
    });
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(businessCardsPrintingPrices, area, areas)}
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
    //console.log("SIzes", data?.sizes);
    setPrice(data?.min_price ? data?.min_price : 0);
    if (data?.business_cards_prices && data.business_cards_prices.length > 0) {
      setPrices(data.business_cards_prices);
      if (
        data.business_cards_prices[0].types &&
        data.business_cards_prices[0].types.length > 0
      ) {
        let types = data.business_cards_prices[0].types.map(
          (type) => type.value
        );
        setTypes(types);
        if (
          data.business_cards_prices[0].types[0].quantities &&
          data.business_cards_prices[0].types[0].quantities.length > 0
        ) {
          let quantities =
            data.business_cards_prices[0].types[0].quantities.map(
              (q) => q.value
            );
          setQuantities(quantities);
        }
      }
    }
    if (
      data?.business_cards_finishing_types &&
      data.business_cards_finishing_types.length > 0
    ) {
      setFinishings(data.business_cards_finishing_types);
      formRef.current.setFieldValue(
        "sizes[0].finishing",
        data.business_cards_finishing_types[0].value
      );
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
                      "Business Cards Printing",
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
              <CheckoutActivityFormTracker orderType="BUSINESS_CARD" />
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
                        pushDatalyer("Business Cards Printing", "First Name")
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
                        pushDatalyer("Business Cards Printing", "Last Name")
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
                        pushDatalyer("Business Cards Printing", "Email")
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
                        pushDatalyer("Business Cards Printing", "Phone Number")
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
                        pushDatalyer("Business Cards Printing", "Address")
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
                          "Business Cards Printing",
                          "Privacy Preference",
                          e.target?.value
                        );
                      }}
                      onFocus={() =>
                        pushDatalyer(
                          "Business Cards Printing",
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
                                            htmlFor="cardType"
                                            className="order-option-label"
                                          >
                                            Card Type
                                          </label>
                                          <Field
                                            as="select"
                                            id="cardType"
                                            name={`sizes[${index}].type`}
                                            className="selectOptionsCustom new-custom-field-rf"
                                          >
                                            <option
                                              value={""}
                                              label="Choose Your Card Type"
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
                                            htmlFor="cardSize"
                                            className="order-option-label"
                                          >
                                            Size
                                          </label>
                                          <Field
                                            as="select"
                                            id="cardSize"
                                            name={`sizes[${index}].size`}
                                            className="selectOptionsCustom new-custom-field-rf"
                                          >
                                            <option
                                              value=""
                                              label="Choose Your Size"
                                              selected
                                              disabled
                                            />
                                            {prices.length > 0 &&
                                              prices.map((size: any) => (
                                                <option
                                                  key={size._id}
                                                  value={size._id}
                                                >
                                                  {size?.name}
                                                  {" ("}
                                                  {size?.width}
                                                  {"x"}
                                                  {size?.height}
                                                  {"mm)"}
                                                </option>
                                              ))}
                                          </Field>
                                          <RenderErrorMessage
                                            errors={errors}
                                            touches={touched}
                                            name={`sizes[${index}].size`}
                                          />
                                        </div>
                                        <div className="formControll">
                                          <label
                                            htmlFor="quantity"
                                            className="order-option-label"
                                          >
                                            Quantity
                                          </label>
                                          <Field
                                            as="select"
                                            id="quantity"
                                            name={`sizes[${index}].quantity`}
                                            className="selectOptionsCustom new-custom-field-rf"
                                          >
                                            <option
                                              value=""
                                              label="Choose Number of Card Prints"
                                              selected
                                              disabled
                                            />
                                            {quantities.length > 0 &&
                                              quantities.map((q: any) => (
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
                                              label="Select Your Finishing Type"
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
                                        <label style={{margin:0}}>
                                          <FileUploadingStatus files={size.files}/>
                                        </label>
                                        <ImageDropzone
                                          orderType="BUSINESS_CARD"
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
                                          zoom={true}
                                          page="psp-page"
                                          allowPdf={true}
                                        />
                                        <UploadInfoLabel
                                          supportedTypes={BUSINESS_CARD_FILE_TYPES}
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
                              onClick={() => addBusinessCard(arrayHelpers)}
                            >
                              Add Another Business Card
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
                      onFocus={() =>
                        pushDatalyer("Business Cards Printing", "Any Comments")
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
                    {renderFinishingPrices(values?.sizes)}
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

export default BcardsOrderForm;
