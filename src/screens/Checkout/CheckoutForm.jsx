"use client";
import React, { useEffect, useRef, useState } from "react";
import "./styleCheckoutComponent.scss";
import Checkout from "../../components/Checkout";
import { Formik } from "formik";
import Swal from "sweetalert2";
import useApp from "../../store/useApp";
import { useCart } from "react-use-cart";
import SearchableSelect from "../../components/SearchableSelect";
import axios from "axios";
import Loading from "../../components/Loading";
import { useRouter } from "next/navigation";
import { checkFreeDelivery, getAreaSet, getDeliveryCharges } from "@/helpers/generals";
import { orderDataLayer } from "@/datalayers/Ecommerce";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";

const CheckoutForm = ({ deliveryCharges, freeDeliveryThreshold, setDeliveryCharges, areas,minPrice,area,setArea }) => {
  const formRef = useRef();
  const { storePrices,sessionId } = useApp();
  const [areaOptions, setAreaOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const router = useRouter();
  const { items, cartTotal, totalItems, emptyCart } = useCart();
  const { tryCreateToken } = useApp();
  const [showLoading, setShowLoading] = useState(false);

  const initialValues = {
    email: "",
    firstname: "",
    lastname: "",
    address: "",
    apartment: "",
    city: "",
    area: "",
    phone: "",
  };
  const validator = function (values) {
    const errors = {};
    if (!values.firstname) errors.firstname = "Required";
    if (!values.lastname) errors.lastname = "Required";
    if (!values.phone) errors.phone = "Required";
    if (!values.address) errors.address = "Required";
    if (!values.city) errors.city = "Required";
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
    if(!formikValues) return {};
    return formikValues;
  };

  function onSubmit() {
    const {
      firstname,
      lastname,
      email,
      phone,
      address,
      city,
      area,
      apartment,
    } = getFormikValues();
    setShowLoading(true);

    tryCreateToken().then(async (token) => {
      if (token === undefined || token === "") {
        console.log("Error while getting token");
        setShowLoading(false);
      } else {
        const formData = new FormData();

        let filesMetaData = [];

        items.forEach((item, index) => {
          if (item?.line_items_pics) {
            item.line_items_pics.forEach((file) => {
              // formData.append(`files${index}`, file);
              filesMetaData.push({
                  filename: file.name,
                  url: file.url,
                  key: file.key,
                  name: file.field,
                  id: item.id,
                  fieldname: `files${index}`
              })
            });
          }
        });

        formData.append("order_type","store_product")
        formData.append("firstname", firstname);
        formData.append("lastname", lastname);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("city", city);
        formData.append("area", area);
        formData.append("apartment", apartment);
        formData.append("session_id",sessionId);
        formData.append("filesData",JSON.stringify(filesMetaData))
        formData.append("price", parseFloat(totalPrice + deliveryCharges).toFixed(2));
        formData.append("minPrice",minPrice)

        formData.append("delivery_charges", String(getDeliveryCharges(storePrices,area,areas)));
        formData.append("free_delivery",String(checkFreeDelivery(cartTotal, freeDeliveryThreshold)));

        formData.append("totalItems", totalItems);
        formData.append("items", JSON.stringify(items));
        formData.append("token", token.id);

        const {data} = await axios({
          data: formData,
          method: "post",
          url: process.env.NEXT_PUBLIC_API_URL + "/api/createOrder",
          headers: {
            "Content-Type": "application/json",
          },
        })

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
          ).then((response) => {

            if (response.data.status) {
              setShowLoading(false);
              Swal.fire({
                title: "Order Placed!",
                icon: "success",
                text: "Please check Your Email!",
                showLoaderOnConfirm: false,
                showLoaderOnDeny: false,
                loaderHtml: `<div></div>`,
              });
              //console.log(response);
              orderDataLayer(response?.data?.object)
              emptyCart();
              router.push("/");
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
            }
            console.log("Response", response);
          })
          .catch((err) => {
            const { status } = err.response;
            if (status === 405) {
              Swal.fire({
                icon: "error",
                title: "Out Of Stock",
                text:
                  err?.response?.data?.message ||
                  "Some items are out of stock!",
                showLoaderOnConfirm: false,
                showLoaderOnDeny: false,
                loaderHtml: `<div></div>`,
              });
              emptyCart();
              router.push("/");
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err?.response?.data?.message || "Something went wrong!",
                showLoaderOnConfirm: false,
                showLoaderOnDeny: false,
                loaderHtml: `<div></div>`,
              });
            }
            setShowLoading(false);
          });
      }
    });
  }

  async function setValueCalculatePrice(type, value) {
    let newDeliveryCharges = 0;
    if (type === "city") {
      formRef.current.setFieldValue("area", "");
      setArea("");
      const filteredAreas = areas?.filter((area) => area.city === value);
      const sortedAreas = filteredAreas?.sort((a, b) => {
        if (a?.name < b?.name) {
          return -1;
        }
        if (a?.name > b?.name) {
          return 1;
        }
        return 0;
      });
      const options = sortedAreas?.map((area) => ({
        value: area?.name,
        label: area?.name,
      }));
      setAreaOptions(options);
    }

    if(type === 'area'){
      setArea(value)
    }

    formRef.current.setFieldValue(type, value);
    await Promise.resolve();

    const { area = null } = getFormikValues();

    newDeliveryCharges = getDeliveryCharges(storePrices,area,areas)
    if(checkFreeDelivery(cartTotal,freeDeliveryThreshold)){
      newDeliveryCharges = 0;
    }

    setDeliveryCharges(newDeliveryCharges)
  }

  useEffect(() => {
    const sortedAreas = areas?.sort((a, b) => {
      if (a?.name < b?.name) {
        return -1;
      }
      if (a?.name > b?.name) {
        return 1;
      }
      return 0;
    });
    let options = sortedAreas?.map((area) => {
      return { value: area.name, label: area.name };
    });
    setAreaOptions(options);
  }, []);

  useEffect(() => {
    let allCities = [],
      allAreas = [];
    areas.forEach((area) => {
      if (!allCities.includes(area.city)) {
        allCities.push(area.city);
      }
    });
    let optionsTwo = allCities.sort().map((city, i) => {
      return { value: city, label: city };
    });

    const firstCity = optionsTwo[0];

    areas.forEach((area) => {
      if (area.city === firstCity?.value) {
        allAreas.push({ value: area.name, label: area.name });
      }
    });
    formRef.current.setFieldValue("city", firstCity?.value);
    setAreaOptions(allAreas);
    setCityOptions(optionsTwo);
  }, [areas]);

  useEffect(() => {
    if((cartTotal + deliveryCharges) < minPrice){
      setTotalPrice(minPrice)
    }else{
      setTotalPrice(cartTotal);
    }
  }, [cartTotal, deliveryCharges]);

  return (
    <>
      {showLoading && <Loading />}
      <div className="form-container__checkout">
        <div className="form__checkout">
          <div className="heading-cont__checkout mb-2">
            <h3 className="mr-0">Contact Information</h3>
          </div>
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
                onSubmit={(event) => {
                  event.preventDefault();
                  validateForm().then((errors) => {
                    if (errors && Object.keys(errors).length !== 0) {
                      Swal.fire({
                        icon: "error",
                        title: "Validation Error",
                        text: "Please fill all fields!",
                      });
                      handleSubmit();
                    } else {
                      handleSubmit();
                    }
                  });
                }}
              >
                <CheckoutActivityFormTracker orderType="STORE_PRODUCT" />
                <div className="formControll mb-3">
                  <input
                    formControlName="email"
                    value={values.email}
                    onChange={(e) => handleChange(e)}
                    type="email"
                    id="email"
                    placeholder="Email"
                    name="email"
                  />
                  {errors.email && touched.email && (
                    <div className="inputError">
                      <div className="arrow-up"></div>
                      <span>
                        <img
                          className="errorImage"
                          src="/images/images/error.jpeg"
                          alt="errorImg"
                        />
                      </span>{" "}
                      Please enter your valid email address
                    </div>
                  )}
                </div>
                <h3 className="mr-0 mb-2">Shipping Address</h3>
                <div className=" mb-3">
                  <div className="row justify-content-between">
                    <div className="col-6 ml-z">
                      <div className="formControll">
                        <input
                          formControlName="firstname"
                          value={values.firstname}
                          onChange={(e) => handleChange(e)}
                          type="text"
                          placeholder="First Name"
                          name="firstname"
                          id="firstname"
                        />
                        {errors.firstname && touched.firstname && (
                          <div className="inputError">
                            <div className="arrow-up"></div>
                            <span>
                              <img
                                className="errorImage"
                                src="/images/images/error.jpeg"
                                alt="errorImg"
                              />
                            </span>{" "}
                            Please enter your first name
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-6 mr-z">
                      <div className="formControll">
                        <input
                          formControlName="lastname"
                          type="text"
                          value={values.lastname}
                          onChange={(e) => handleChange(e)}
                          placeholder="Last Name"
                          name="lastname"
                          id="lastname"
                        />
                        {errors.lastname && touched.lastname && (
                          <div className="inputError">
                            <div className="arrow-up"></div>
                            <span>
                              <img
                                className="errorImage"
                                src="/images/images/error.jpeg"
                                alt="errorImg"
                              />
                            </span>{" "}
                            Please enter your last name
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="formControll mb-3">
                 
                  <input
                    formControlName="address"
                    value={values.address}
                    onChange={(e) => handleChange(e)}
                    type="text"
                    placeholder="Address - Don't Put Work/Office Address"
                    id="address"
                    name="address"
                  />
                  {errors.address && touched.address && (
                    <div className="inputError">
                      <div className="arrow-up"></div>
                      <span>
                        <img
                          className="errorImage"
                          src="/images/images/error.jpeg"
                          alt="errorImg"
                        />
                      </span>{" "}
                      Please enter your address
                    </div>
                  )}
                </div>
                <div className="formControll mb-3">
                  <input
                    formControlName="apartment"
                    value={values.apartment}
                    onChange={(e) => handleChange(e)}
                    type="text"
                    placeholder="Apartment, Villa, etc"
                    id="apartment"
                    name="apartment"
                  />
                </div>
                <div className="mb-3">
                  <div className="row justify-content-between">
                    <div className="col-6 ml-z">
                      <div className="formControll mb-3">
                        <SearchableSelect
                          type="city"
                          options={cityOptions}
                          value={values.city}
                          placeholder={"Select City"}
                          onChangeHandler={setValueCalculatePrice}
                          controlBg="#fff"
                          optionBg="#fff"
                        />
                        {errors.city && touched.city && (
                          <div className="inputError">
                            <div className="arrow-up"></div>
                            <span>
                              <img
                                className="errorImage"
                                src="/images/images/error.jpeg"
                                alt="errorImg"
                              />
                            </span>{" "}
                            Please enter your city
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-6 mr-z">
                      <div className="formControll mb-3">
                        <SearchableSelect
                          type="area"
                          options={areaOptions}
                          value={values.area}
                          placeholder={"Select Area"}
                          onChangeHandler={setValueCalculatePrice}
                          controlBg="#fff"
                          optionBg="#fff"
                        />
                        {errors.area && touched.area && (
                          <div className="inputError">
                            <div className="arrow-up"></div>
                            <span>
                              <img
                                className="errorImage"
                                src="/images/images/error.jpeg"
                                alt="errorImg"
                              />
                            </span>{" "}
                            Please enter your area
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="formControll mb-3">
                  <input
                    formControlName="phone"
                    value={values.phone}
                    onChange={(e) => handleChange(e)}
                    type="tel"
                    id="pnumber"
                    placeholder="Phone Number"
                    name="phone"
                  />
                  {errors.phone && touched.phone && (
                    <div className="inputError">
                      <div className="arrow-up"></div>
                      <span>
                        <img
                          className="errorImage"
                          src="/images/images/error.jpeg"
                          alt="errorImg"
                        />
                      </span>{" "}
                      Please enter your phone number
                    </div>
                  )}
                </div>
                <h3 className="mr-0 mb-3">Payment</h3>
                <Checkout />
                <div className="mt-3">
                  <div className="row justify-content-between flex-box">
                    <div className="col-12 text-center width-101">
                      <button
                        type="submit"
                        className="aqHkS Mlpfi bAS_j okQ4n wkoOa DmJZe Lot1G EmqTg"
                      >
                        <span className="upmlD">
                          <h5>Pay Now</h5>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
        {/* <div className="footer__checkout primery-color">
        <span className="icon-right">
          <Link>Refund Policy</Link>
        </span>
        <span className="icon-right">
          <Link>Shipping Policy</Link>
        </span>
        <span className="icon-right">
          <Link>Privacy Policy</Link>
        </span>
        <span className="icon-right">
          <Link>Terms of Service Policy</Link>
        </span>
      </div> */}
      </div>
    </>
  );
};

export default CheckoutForm;
