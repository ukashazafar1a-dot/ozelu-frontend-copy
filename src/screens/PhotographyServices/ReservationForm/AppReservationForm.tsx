"use client";
import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import { Formik } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import Loading from "../../../components/Loading";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
// import { Formik, Form, Field, ErrorMessage } from 'formik';
// import * as Yup from 'yup';

const AppReservationForm = ({ service, title, description, image }: any) => {
  const formRef = useRef<any>();
  const [showLoading, setShowLoading] = useState(false);
  const initialValues = {
    name: "",
    email: "",
    phone: "",
    message: "",
  };

  const validator = function (values: any) {
    const errors: any = {};
    if (!values.name) errors.name = "Required";
    if (!values.phone) errors.phone = "Required";
    if (!values.message) errors.message = "Required";
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    return errors;
  };

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    return formikValues;
  };

  function onSubmit() {
    const { name, phone, email, message } = getFormikValues();
    setShowLoading(true);
    let formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("service", service);

    axios({
      data: formData,
      method: "post",
      url: process.env.NEXT_PUBLIC_API_URL + "/reservation",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Congratulations!",
          text: "Reservation Created Successfully.",
          showLoaderOnConfirm: false,
                showLoaderOnDeny:false,
                loaderHtml:`<div></div>`
        });
        setShowLoading(false);
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something Went Wrong!",
          showLoaderOnConfirm: false,
                showLoaderOnDeny:false,
                loaderHtml:`<div></div>`
        });
        console.log(error);
        setShowLoading(false);
      });
  }

  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div id="reservation-form">
      {showLoading && <Loading />}
      <section className="img-form mb-30">
        <div className="container">
          <div className="row">
            <div className="col-md-7">
              <img
                src={
                  image ? image : "/images/images/portrait-headhots/img7.jpg"
                }
                loading="lazy"
                alt="Reservation Form"
                className="lazyload"
              />
            </div>
            <div className="col-md-1">
              <span></span>
            </div>
            <div className="col-md-4 mt-3 mt-md-0">
              <h2 className="mb-4">{title ? title : "Make Your Reservation Now"}</h2>
              {description && <p>{description}</p>}
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
                    className="request-quote"
                    onSubmit={(event) => {
                      event.preventDefault();
                      validateForm().then((errors) => {
                        if (errors && Object.keys(errors).length !== 0) {
                          Swal.fire({
                            icon: "error",
                            title: "Validation Error",
                            text: "Please fill all fields!",
                            showLoaderOnConfirm: false,
                showLoaderOnDeny:false,
                loaderHtml:`<div></div>`
                          });
                          handleSubmit();
                        } else {
                          handleSubmit();
                        }
                      });
                    }}
                  >
                    <CheckoutActivityFormTracker orderType="PHOTOGRAPHY_RESERVATION" />
                    <div className="reservation-fields">
                      <input
                        data-formControlName="name"
                        value={values.name}
                        onChange={handleChange}
                        type="text"
                        name="name"
                        placeholder="Your Name"
                      />
                      {errors.name && touched.name && (
                        <span className="validation-message">
                          Name is required
                        </span>
                      )}
                    </div>

                    <div className="reservation-fields">
                      <input
                        data-formControlName="phone"
                        type="tel"
                        value={values.phone}
                        onChange={handleChange}
                        name="phone"
                        placeholder="Phone Number"
                      />
                      {errors.phone && touched.phone && (
                        <span className="validation-message">
                          Phone Number is required
                        </span>
                      )}
                    </div>
                    <div className="reservation-fields">
                      <input
                        data-formControlName="email"
                        value={values.email}
                        onChange={handleChange}
                        type="email"
                        name="email"
                        placeholder="Your Email"
                      />
                      {errors.email && touched.email && (
                        <span className="validation-message">
                          Email is required
                        </span>
                      )}
                    </div>

                    <textarea
                      className="reservation-fields"
                      data-formControlName="message"
                      rows={5}
                      placeholder="Message"
                      name="message"
                      value={values.message}
                      onChange={handleChange}
                    />
                    <button type="submit">Create Reservation</button>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// const AppReservationForm = () => {
//     const validationSchema = Yup.object().shape({
//         name: Yup.string().required(),
//         phone: Yup.string().required(),
//         email: Yup.string().required(),
//         message: Yup.string().required()
//       });

//       const handleSubmit = (values, { setSubmitting, resetForm, isValidating }) => {
//         console.log("handleSubmit function called");
//         if (isValidating) {
//           console.log(values);
//           setSubmitting(false);
//           resetForm();

//           Swal.fire({
//             icon: 'success',
//             title: 'Success!',
//             text: 'Your reservation has been created.'
//           });
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Validation Error',
//             text: "All Fiedls ARE"
//           });
//         }
//         resetForm();
//       };

//   return (
//     <div id="reservationForm">
//       <section className="img-form mb-30">
//         <div className="container">
//           <div className="row">
//             <div className="col-md-7">
//               <img src={portraitHeadshotImg} alt="portraitHeadshotImg" />
//             </div>
//             <div className="col-md-1"></div>
//             <div className="col-md-4">
//               <h2>Make Your Reservation Now</h2>
//               <Formik
//                 initialValues={{
//                   name: '',
//                   phone: '',
//                   email: '',
//                   message: ''
//                 }}
//                 validationSchema={validationSchema}
//                 onSubmit={handleSubmit}
//               >
//                 {({ isSubmitting }) => (
//                   <Form className="request-quote">
//                     <div className='reservation-fields'>
//                     <Field type="text" name="name" placeholder="Your Name" /></div>
//                     {/* <ErrorMessage name="name" component="div" /> */}

//                     <div className='reservation-fields'>
//                     <Field type="tel" name="phone" placeholder="Phone Number" /></div>
//                     {/* <ErrorMessage name="phone" component="div" /> */}

//                     <div className='reservation-fields'>
//                     <Field type="email" name="email" placeholder="Your Email" /></div>
//                     {/* <ErrorMessage name="email" component="div" /> */}
//                     <div className='reservation-fields'>
//                     <Field name="message" component="textarea" rows="5" placeholder="Message" /></div>
//                     {/* <ErrorMessage name="message" component="div" /> */}
//                     <button type="submit" disabled={isSubmitting}>
//                       Create Reservation
//                     </button>
//                   </Form>
//                 )}
//               </Formik>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );}

export default AppReservationForm;
