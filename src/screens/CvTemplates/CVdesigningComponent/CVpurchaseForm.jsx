"use client"
import { useRef,useState } from "react";
import { Formik, Form } from "formik";
import Checkout from "../../../components/Checkout";

import Link from 'next/link'
import { useEffect } from "react";
import Swal from "sweetalert2";
import axios from 'axios';
import Loading from "../../../components/Loading";
import useApp from "../../../store/useApp";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
const CVpurchaseForm = ({ template }) => {
  const {tryCreateToken} = useApp()
  const formRef = useRef();
  const [showLoading,setShowLoading] = useState(false);

  const initialValues = {
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  }

  const validator = function(values){
    const errors = {};
    if(!values.firstname) errors.firstname = 'Required';
    if(!values.lastname) errors.lastname = 'Required';
    if(!values.phone) errors.phone = 'Required';
    if (!values.email) {
        errors.email = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }
    return errors;
}

const getFormikValues = () => {
  const formikValues = formRef.current?.values
   return formikValues
}

function onSubmit() {
  const {firstname,lastname,email,phone} = getFormikValues();

  setShowLoading(true);
  tryCreateToken().then(token => {
      if(token === undefined || token === ''){
          console.log("Error while getting token");
          setShowLoading(false);
      }else{
          const formData = new FormData();

          formData.append("order_type","template_order")
          formData.append("firstname", firstname);
          formData.append("lastname", lastname);
          formData.append("email", email);
          formData.append("phone", phone);

          formData.append("template", template);
          formData.append("token", token.id);
          axios({
              data:formData,
              method:'post',
              url: process.env.NEXT_PUBLIC_API_URL + '/api/createOrder',
              headers: {
                  'Content-Type': 'application/json',
              }
          }).then(response=>{
              console.log("Response",response)

              //Testing
              setShowLoading(false)
              return;
              //Testing

          if(response.data.status){
              setShowLoading(false);
              Swal.fire({
                  title:"Order Placed!",
                  text:"Please check Your Email!",
                  icon:"success",
                  showLoaderOnConfirm: false,
                showLoaderOnDeny:false,
                loaderHtml:`<div></div>`
          });
          }else{
              setShowLoading(false);
              Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text:
                    response?.data?.message ||
                    "Something went wrong!",
                    showLoaderOnConfirm: false,
                showLoaderOnDeny:false,
                loaderHtml:`<div></div>`
              });
          }
          console.log("Response", response);
          }).catch(err=>{
            setShowLoading(false);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text:
                  err?.data?.message ||
                  "Something went wrong!",
                  showLoaderOnConfirm: false,
                showLoaderOnDeny:false,
                loaderHtml:`<div></div>`
            });
            console.log("Error",err);
          })
      }
  });
}
  
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  useEffect(()=>{
    scrollToTop()
  },[])
  return (
    <>
      {showLoading && <Loading/>}
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validate={validator}
      onSubmit={(values) => {
        // handle form submission here
        onSubmit()
      }}
    >
      {({ errors, touched, values, handleChange, handleSubmit,validateForm }) => (
        <Form className="form-container-cv" onSubmit={(event)=>{event.preventDefault();validateForm().then((errors)=>{
          if(errors && Object.keys(errors).length !== 0){
              Swal.fire({
                  icon: "error",
                  title: "Validation Error",
                  text: "Please fill all fields!",
                });
                handleSubmit();
          }else{
              handleSubmit();
          }})}}>
          <CheckoutActivityFormTracker orderType="TEMPLATE_ORDER" />
          <h2 className="form-heading-cv">
            Please fill in the form with your basic information.
          </h2>

          <div className="formControll">
                <label for="firstname">First Name</label>
                <input formControlName="firstname" value={values.firstname} onChange={handleChange} type='text' placeholder="Please Write Your First Name" name="firstname"
                    id="firstname"/>
                {errors.firstname && touched.firstname && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} alt="img"/>
                    </span> Please enter your first name
                </div>}
            </div>
            <div className="formControll">
                <label for="lastname">Last Name</label>
                <input formControlName="lastname" type='text' value={values.lastname} onChange={handleChange} placeholder="Please Write Your Last Name" name="lastname"
                    id="lastname"/>
                {errors.lastname && touched.lastname && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} />
                    </span> Please enter your last name
                </div>}
            </div>
            <div className="formControll">
                <label for="email">Email</label>
                <input formControlName="email" type="email" value={values.email} onChange={handleChange} id="email" placeholder="Please Write Your Email"
                    name="email"/>
                {errors.email && touched.email && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} />
                    </span> Please enter your valid email address
                </div>}
            </div>
            <div className="formControll">
                <label for="phone">Phone Number</label>
                <input formControlName="phone" type="tel" value={values.phone} onChange={handleChange} id="phone" placeholder="Please Write Your Phone Number"
                    name="phone"/>
                {errors.phone && touched.phone && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} />
                    </span> Please enter your phone number
                </div>}
            </div>

          <Checkout />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "200px",
              margin: "auto",
              marginTop: "20px",
            }}
          ><Link href="/editing-service/cv-templates">
            <button
              type="button"
              className="btn btn-sm button__cv-page"
              style={{ display: "flex", padding: "5px 28px" }}
              onClick={scrollToTop}
            >
              Back
            </button>
            </Link>
            <button
              type="submit"
              className="btn btn-sm button__cv-page"
              style={{ display: "flex", padding: "5px 25px" }}
            >
              Submit
            </button>
          </div>
        </Form>
      )}
    </Formik>
    </>
  );
};

export default CVpurchaseForm;
