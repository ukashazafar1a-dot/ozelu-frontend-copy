'use client'

import React, { useState } from 'react'
import './style.css'
import { Formik } from 'formik';
import InputError from './Components/InputError';
import * as Yup from 'yup';
import axios from 'axios';
import Link from 'next/link';

const services = [
  'Passport Size Photos Soft Copy', 
  'Passport Size Photos Soft Copy & Hard Copy Delivery', 
  'Photos Printing', 
  'Documents Printing'
];

const initialValues = {
  service: '',
  feedbackType: 'anonymous',
  fullName: '',
  phoneNumber: '',
  email: '',
  rating: '7',
  comment: ''
};


const Feedback = () => {
  const [submitting,setSubmitting] = useState(false)
  const [stage,setStage] = useState('form')
  const renderServiceText = function(type:string){
    switch (type) {
      case 'Passport Size Photos Soft Copy':
        return 'Please share your feedback below about your experience with Demo in terms of Customer Service or Passport Size Photos Editing.';
      case 'Passport Size Photos Soft Copy & Hard Copy Delivery':
        return 'Please share your feedback below about your experience with Demo in terms of Customer Service, Passport Size Photos Editing, Photos Print Quality or the Delivery Experience. ';
      case 'Photos Printing':
        return 'Please share your feedback below about your experience with Demo in terms of Customer Service, Photos Print Quality or the Delivery Experience.';
      case 'Documents Printing':
        return 'Please share your feedback below about your experience with Demo in terms of Customer Service, Documents Print Quality or the Delivery Experience.';
      default:
        return '';
    }
  }

  const FeedbackSchema = Yup.object().shape({
    service: Yup.string().required('Please enter service used'),
    comment: Yup.string().required('Please enter your comment.').min(10,'Comment is too short. Please atleast enter 10 characters.'),
    fullName: Yup.string().when('feedbackType', {
      is: 'share',
      then: (schema) => schema.required('Please enter your full name.'),
      otherwise: (schema) => schema
    }),
    phoneNumber: Yup.string().when('feedbackType', {
      is: 'share',
      then: (schema) => schema.required('Please enter your phone number.'),
      otherwise: (schema) => schema
    }),
    email: Yup.string().when('feedbackType', {
      is: 'share',
      then: (schema) => schema.email('Invalid email').required('Please enter your email.'),
      otherwise: (schema) => schema
    }),
  });

  const handleSubmit = async function(values:any){
    const { service,feedbackType,fullName,phoneNumber,email,rating,comment } = values;
    setSubmitting(true)
    try {
      const formData = new FormData();
      formData.append('service',service);
      formData.append('feedback_type',feedbackType);
      formData.append('full_name',fullName);
      formData.append('phone_number',phoneNumber);
      formData.append('email',email);
      formData.append('rating',rating);
      formData.append('comment',comment);
      await axios({
        data: formData,
        method: "POST",
        url: process.env.NEXT_PUBLIC_API_URL + '/api/assets/feedback',
        headers: {
          "Content-Type": "application/json"
        }
      })
      setStage('success');
    } catch (error) {
      console.log("Error",error);
      setStage('error');
    }finally{
      setSubmitting(false)
      window.scrollTo({top:0,behavior:'smooth'})
    }
  }


  return (
    <div className="feedback-pagewrapper">

    
    <div className="container ">
      <div className="row d-flex">
        <div className='feedback-box'>
          <div className='feedback-header'>
            <div className='feedback-header-title'>
              <div className='feedback-header-title-icon'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="chat"><path d="M19,8H18V5a3,3,0,0,0-3-3H5A3,3,0,0,0,2,5V17a1,1,0,0,0,.62.92A.84.84,0,0,0,3,18a1,1,0,0,0,.71-.29l2.81-2.82H8v1.44a3,3,0,0,0,3,3h6.92l2.37,2.38A1,1,0,0,0,21,22a.84.84,0,0,0,.38-.08A1,1,0,0,0,22,21V11A3,3,0,0,0,19,8ZM8,11v1.89H6.11a1,1,0,0,0-.71.29L4,14.59V5A1,1,0,0,1,5,4H15a1,1,0,0,1,1,1V8H11A3,3,0,0,0,8,11Zm12,7.59-1-1a1,1,0,0,0-.71-.3H11a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1h8a1,1,0,0,1,1,1Z" fill="#fff"/></svg>
              </div>
              <span>Demo Feedback</span>
            </div>
          </div>
          <hr/>
          {stage === 'form' && <div className='feedback-body'>
            <div className='feedback-body-heading text-center'>
              <h1>How are you feeling?</h1>
              <p>You input is valuable in helping us better understand your needs and tailor our service accordingly?</p>
            </div>
            <Formik
              initialValues={initialValues}
              validationSchema={FeedbackSchema}
              onSubmit={handleSubmit}
            >{({values,touched,errors,handleChange,handleSubmit,setFieldValue})=>(
              <form onSubmit={handleSubmit}>
                <div className="formControll">
                  <label htmlFor="service">Service Used</label>
                  <select name="service" id="service" value={values.service} className="selectOptions" onChange={handleChange}>
                    <option value={''} disabled>Choose a service</option>
                    {services.map((service)=>{
                      return <option value={service} key={service}>{service}</option>
                    })}
                  </select>
                  {errors.service && touched.service ? (
                    <InputError message={errors.service}/>
                  ) : null}
                </div>
            <br/>
            <br/>
            <div className="formControll">
              <p className="content">Would you like this to be an anonymous feedback or you are willing to share your order information so we can have a look into your order?</p>
            </div>
            <div className="formControll flex-column flex-md-row">
              <div className=" checkbox-container">
                  <input type="checkbox" name="feedbackType" onChange={()=>setFieldValue('feedbackType','anonymous')} checked={values.feedbackType === 'anonymous'}/>
                  <label className="margin-left-15" htmlFor="img-bg">Anonymous</label>
                  <br/>
              </div>
              <div className=" checkbox-container ml-md-5">
                  <input type="checkbox" name="feedbackType" onChange={()=>setFieldValue('feedbackType','share')} checked={values.feedbackType === 'share'}/>
                  <label className="margin-left-15" htmlFor="img-bg2">I can share my order information</label>
                  <br/>
              </div>
            </div>
            
            {values.feedbackType === 'share' && <><div className="formControll">
              <label htmlFor="fullname">Full Name</label>
              <input data-formcontrolname="fullname" placeholder="Please Write Your Full Name" id="fullname" type="text" value={values.fullName} name="fullName" onChange={handleChange} />
              {errors.fullName && touched.fullName ? (
                    <InputError message={errors.fullName}/>
              ) : null}
            </div>
            <div className="formControll">
              <label htmlFor="phone">Phone Number</label>
              <input data-formcontrolname="phone" placeholder="Please Write Your Phone Number" id="phone" type="text" value={values.phoneNumber} name="phoneNumber" onChange={handleChange} />
              {errors.phoneNumber && touched.phoneNumber ? (
                    <InputError message={errors.phoneNumber}/>
              ) : null}
            </div>
            <div className="formControll">
              <label htmlFor="email">Email</label>
              <input data-formcontrolname="email" placeholder="Please Write Your Email" id="email" type="text" value={values.email} name="email" onChange={handleChange} />
              {errors.email && touched.email ? (
                    <InputError message={errors.email}/>
              ) : null}
            </div></>}

            <div className='formControll mt-5'>
              <p >On a scale of 1-10, how would you rate your overall experience with Demo, where 1 is the least and 10 the highest.</p>
            </div>
            <div className='formControll mt-3'>
              <div className='ratings-box'>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="1" checked={values.rating === '1'}/>
                  <label htmlFor="rating">1</label>
                  <span>Terrible</span>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="2" checked={values.rating === '2'}/>
                  <label htmlFor="rating">2</label>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="3" checked={values.rating === '3'}/>
                  <label htmlFor="rating">3</label>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="4" checked={values.rating === '4'}/>
                  <label htmlFor="rating">4</label>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="5" checked={values.rating === '5'}/>
                  <label htmlFor="rating">5</label>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="6" checked={values.rating === '6'}/>
                  <label htmlFor="rating">6</label>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="7" checked={values.rating === '7'}/>
                  <label htmlFor="rating">7</label>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="8" checked={values.rating === '8'}/>
                  <label htmlFor="rating">8</label>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="9" checked={values.rating === '9'}/>
                  <label htmlFor="rating">9</label>
                </div>
                <div className='rating-item'>
                  <input type="radio" id="rating" name="rating" onChange={handleChange} value="10" checked={values.rating === '10'}/>
                  <label htmlFor="rating">10</label>
                  <span>Amazing</span>
                </div>
              </div>
            </div>
            <div className='formControll mt-3'>
              <p >
                {renderServiceText(values.service)}
                <br/>
                <br/>
              Let us know anything you liked or disliked or share any suggestions that we can improve on. Any feedback is highly appreciated.
              </p>
            </div>
            <div className='formControl'>
            <textarea placeholder='Add a comment...' name='comment' onChange={handleChange} className='feedback-comment-box mt-2' rows={5}/>
            {errors.comment && touched.comment ? (
                    <InputError message={errors.comment}/>
            ) : null}
            </div>
            <div className='feedback-btn mt-3'>
              <button type='submit' disabled={submitting}>{
                submitting ? 'Submitting...' : 'Submit Now'
              }</button>
            </div>
            </form>
            )}
            </Formik>
          </div>}

          {/* //Success Message */}
          {stage === 'success' && <div className='feedback-body'>
            <div className='feedback-body-heading'>
              <h1 style={{color:'#309d8a'}}>Thank You for Your Feedback!</h1>
              <p>We appreciate you taking the time to share your thoughts with us. Your feedback is invaluable in helping us enhance your experience on our site.
                <br/><br/>
                Our team is committed to continually improving, and your input plays a crucial role in that process. If you have any further suggestions or concerns, please don't hesitate to reach out to us.
                <br/><br/>
                Thanks again for being a part of our community!
                <br/>
              </p>
            </div>
            <div className='feedback-btn mt-3'>
              <Link href={'/'}>
                <button type='button'>Home</button>
              </Link>
            </div>
          </div>}

          {stage === 'error' && <div className='feedback-body'>
            <div className='feedback-body-heading'>
              <h1 style={{color:'red'}}>Oops! Something Went Wrong.</h1>
              <p>
                We apologize for the inconvenience, but it seems that we're currently experiencing technical difficulties on our end. Our team has been notified, and we're working diligently to resolve the issue.
                <br/><br/>
                If possible, please try submitting your feedback again in a few moments.
                <br/><br/>
                We appreciate your patience and understanding. Thank you for bringing this to our attention, and we apologize for any inconvenience.
                <br/>
              </p>
            </div>
            <div className='feedback-btn mt-3'>
              <Link href={'/'}>
                <button type='button'>Home</button>
              </Link>
            </div>
          </div>}
        </div>
      </div>
    </div>
    </div>
  )
}

export default Feedback