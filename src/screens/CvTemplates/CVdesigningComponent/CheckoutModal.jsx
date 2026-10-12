"use client"
import React,{useRef,useState,useEffect} from 'react'
import { Formik, Form } from "formik";
import Checkout from "../../../components/Checkout";
import Swal from "sweetalert2";
import axios from 'axios';
import Loading from "../../../components/Loading";
import useApp from "../../../store/useApp";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import fileDownload from 'js-file-download'

function CheckoutModal({hideModal, showModal,template}) {
    const openButton = useRef();
    const closeButton = useRef();
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
    if(!template) return;
    setShowLoading(true);
    if(template.isPaid){
        tryCreateToken().then(token => {
            if(token === undefined || token === ''){
                console.log("Error while getting token");
                setShowLoading(false);
            }else{
                const formData = new FormData();
                
                formData.append("order_type","template_order");
                formData.append("firstname", firstname);
                formData.append("lastname", lastname);
                formData.append("email", email);
                formData.append("phone", phone);
      
                formData.append("template", template._id);
                formData.append("token", token.id);
                axios({
                    data:formData,
                    method:'post',
                    url: process.env.NEXT_PUBLIC_API_URL + '/api/createOrder',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(response=>{

                if(response.data.status){
                    setShowLoading(false);
                    hideModal()
                    download(response.data.cv);
                    Swal.fire({
                        title:"Succefully purchased!",
                        text:"We have also send you email with your purchase!",
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
    }else{
        const formData = new FormData();
                
        formData.append("order_type","template_order");
        formData.append("firstname", firstname);
        formData.append("lastname", lastname);
        formData.append("email", email);
        formData.append("phone", phone);

        formData.append("template", template._id);
        axios({
            data:formData,
            method:'post',
            url: process.env.NEXT_PUBLIC_API_URL + '/api/createOrder',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response=>{
            console.log("Response",response)
        if(response.data.status){
            setShowLoading(false);
            hideModal()
            download(template.cv);
            Swal.fire({
                title:"Success!",
                text:"Thanks for downloading a free CV Template!",
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
  }

  const handleDownload = (url, filename) => {
    axios.get(url, {
      responseType: 'blob',
    })
    .then((res) => {
      fileDownload(res.data, filename)
    })
}

function download(cv){
    let path = cv[0]?.path
    let name = cv[0]?.name
    // let extension = template?.cv[0]?.path?.split('.').pop();
    // if(extension){
    if(path){
        if(path.includes('https')){
            console.log(path,name)
            handleDownload(path, name)
        }else{
            let newPath = path.replace('http','https');
            console.log(newPath,name)
            handleDownload(newPath, name)
        }
    }
    // }
}

   return (
    <>
    {showLoading && <Loading/>}
    <button type="button" ref={openButton} className="btn btn-primary" style={{display:'none'}} data-toggle="modal"
        data-target="#checkoutmodal">
    </button>

    <div className="modal fade checkout_model_open" id="checkoutmodal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLongTitle">Please fill in the form with your basic information.</h5>

                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
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
                <div className="modal-body">
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
                            <br/>
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
                            <br/>
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
                            <br/>
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
                            <br/>
                        {template?.isPaid && <div className="formControll">
                            <label for="phone">Price</label>
                            <input formControlName="phone" readOnly type="tel" value={template.price}
                                name="price"/>
                        </div>}

                        {template?.isPaid && <Checkout /> }
                        <div
                            style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "200px",
                            margin: "auto",
                            marginTop: "20px",
                            }}
                        >
                        </div>

                </div>
                <div className="modal-footer justify-content-center">
                    <button 
                        type="button" 
                        ref={closeButton} 
                        data-dismiss="modal" 
                        className='btn--primary-new'>Go Back</button>
                    <button 
                        type="submit" 
                        className='btn--primary-new'>Confirm</button>
                </div>
                </Form>
                )}
                </Formik>
            </div>
        </div>
    </div>
    </>
  )
}

export default CheckoutModal