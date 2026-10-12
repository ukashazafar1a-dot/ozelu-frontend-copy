"use client"
import React,{ useState, useRef, useEffect } from "react"
import useApp from '../../../store/useApp'

import { Formik } from 'formik'
import Swal from 'sweetalert2'
import axios from 'axios'
import Loading from '../../../components/Loading'
import Checkout from '../../../components/Checkout'
import ImageDropzone from '../../../components/Dropzones/ImageDropzone'
import UploadInfoLabel from '@/components/UploadInfoLabel'
import OrderTotalPrice from '@/components/OrderTotalPrice'
import CheckoutActivityFormTracker from '@/components/CheckoutActivityFormTracker'
import { RETOUCHING_IMAGE_TYPES } from '@/constants/uploadSupportedTypes'


const RetouchingForm = () => {
    const {tryCreateToken} = useApp();
    const [price,setPrice] = useState<any>(40);
    const formRef = useRef<any>();
    const [showLoading,setShowLoading] = useState(false);
    const [files,setFiles] = useState([])
    const [filesBGRemove, setfilesBGRemove] = useState([])
    const [filesClippingPath, setFilesClippingPath] = useState([])
    const [filesPostProduction, setFilesPostProduction] = useState([])
    const [filesImageRetouching, setFilesImageRetouching] = useState([])
    const [filesImageMasking, setFilesImageMasking] = useState([])
    const [filesImageRestoration, setFilesImageRestoration] = useState([])
    const [filesJewelryEditing, setFilesJewelryEditing] = useState([])
    const [filesGhostMannequin, setFilesGhostMannequin] = useState([])
    const [filesColorCorrection, setFilesColorCorrection] = useState([])
    const [filesAutomativePhotoEditing, setFilesAutomativePhotoEditing] = useState([])

    const initialValues = {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        returnFileFormat: '',
        photos: '',
        comments: '',
        bgRemove:false,
        postProduction: false,
        masking: false,
        jewelry: false,
        colorCorrection: false,
        clippingPath: false,
        retouching: false,
        restoration: false,
        mannequin: false,
        automotive: false
    }

    const validator = function(values:any){
        const errors:any = {};
        if(!values.firstname) errors.firstname = 'Required';
        if(!values.lastname) errors.lastname = 'Required';
        if(!values.phone) errors.phone = 'Required';
        if(!values.address) errors.address = 'Required';
        if(!values.country) errors.country = 'Required';
        if(!values.returnFileFormat) errors.returnFileFormat = 'Required';
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

    function calculatePrice() {
        const {bgRemove,clippingPath,postProduction,retouching,masking,restoration,jewelry,mannequin,colorCorrection,automotive} = getFormikValues();
        setPrice(40);
        let newPrice = 40;
        if (bgRemove) {
          newPrice = newPrice + (filesBGRemove.length * 35)
          setPrice(newPrice)
        }
        if (clippingPath) {
          newPrice = newPrice + (filesClippingPath.length * 30)
          setPrice(newPrice)
        } if (postProduction) {
          newPrice = newPrice + (filesPostProduction.length * 25)
          setPrice(newPrice)
        } if (retouching) {
          newPrice = newPrice + (filesImageRetouching.length * 20)
          setPrice(newPrice)
        } if (masking) {
          newPrice = newPrice + (filesImageMasking.length * 15)
          setPrice(newPrice)
        } if (restoration) {
          newPrice = newPrice + (filesImageRestoration.length * 10)
          setPrice(newPrice)
        } if (jewelry) {
          newPrice = newPrice + (filesJewelryEditing.length * 35)
          setPrice(newPrice)
        } if (mannequin) {
          newPrice = newPrice + (filesGhostMannequin.length * 30)
          setPrice(newPrice)
        } if (colorCorrection) {
          newPrice = newPrice + (filesColorCorrection.length * 25)
          setPrice(newPrice)
        } if (automotive) {
          newPrice = newPrice + (filesAutomativePhotoEditing.length * 20)
          setPrice(newPrice)
        }
        if (newPrice < 40) {
          newPrice = 40
          setPrice(newPrice)
        }
    }

    function onSubmit() {
        const {firstname,lastname,email,phone,address,returnFileFormat,comments,country,bgRemove,clippingPath,postProduction,retouching,masking,restoration,jewelry,mannequin,colorCorrection,automotive} = getFormikValues();
        if (filesBGRemove.length === 0 && filesClippingPath.length === 0 && filesPostProduction.length === 0 && filesImageRetouching.length === 0 && filesImageMasking.length === 0 && filesImageRestoration.length === 0 && filesJewelryEditing.length === 0 && filesGhostMannequin.length === 0 && filesColorCorrection.length === 0 && filesAutomativePhotoEditing.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please upload picture!',
            showLoaderOnConfirm: false,
                showLoaderOnDeny:false,
                loaderHtml:`<div></div>`
          })
          return;
        }
        setShowLoading(true);
        tryCreateToken().then((token:any) => {
            if(token === undefined || token === ''){
                console.log("Error while getting token");
                setShowLoading(false);
            }else{
                const formData = new FormData();
                // 1
                if (bgRemove) {
                  filesBGRemove.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_BgRemove.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
      
                // 2
                if (clippingPath) {
                  filesClippingPath.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_ClippingPath.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
      
                // 3
                if (postProduction) {
                  filesPostProduction.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_PostProduction.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
      
                // 4
                if (retouching) {
                  filesImageRetouching.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_Retouching.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
      
                // 5
                if (masking) {
                  filesImageMasking.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_ImageMasking.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
      
                // 6
                if (restoration) {
                  filesImageRestoration.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_ImageRestoration.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
      
                // 7
                if (jewelry) {
                  filesJewelryEditing.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_JewelryEditing.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
      
                // 8
                if (mannequin) {
                  filesGhostMannequin.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_GhostMannequin.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
                // 9
                if (colorCorrection) {
                  filesColorCorrection.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_ColorCorrection.${extension}`;
                    formData.append('files', file, filename);
                  });
                }
      
                // 10
                if (automotive) {
                  filesAutomativePhotoEditing.forEach((file:any) => {
                    const extension = file.name.split('.').pop();
                    const filename = `${file.name.split('.').slice(0, -1).join('.')}_AutomativeEditing.${extension}`;
                    formData.append('files', file, filename);
                  });
                }

                formData.append("firstname", firstname);
                formData.append("lastname", lastname);
                formData.append("email", email);
                formData.append("phone", phone);
                formData.append("address", address);
                formData.append("country", country);
                formData.append("comments", comments);
                formData.append("price", price);
                formData.append("returnFileFormat", returnFileFormat);
      
                formData.append("token", token.id);

                axios({
                    data:formData,
                    method:'post',
                    url: process.env.NEXT_PUBLIC_API_URL + '/api/stripe/retouching-pay',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }).then(response=>{
                    console.log("Response",response)
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

    useEffect(()=>{
        calculatePrice()
    },[filesBGRemove,filesClippingPath,filesPostProduction,filesImageRetouching,filesImageMasking,filesImageRestoration,filesJewelryEditing,filesGhostMannequin,filesColorCorrection,filesAutomativePhotoEditing])

  return (
     <div className="photo-retouching-form--wrapper" id="retouching-form">
                {showLoading && <Loading/>}
        <Formik 
            innerRef={formRef}
            initialValues={initialValues}
            validate={validator}
            onSubmit={(values,errors) => {
                onSubmit();
            }}>{({values,errors,touched,isValid,handleSubmit,handleChange,setFieldValue,validateForm})=>(
    <form className="container" onSubmit={(event)=>{event.preventDefault();validateForm().then((errors)=>{
        if(errors && Object.keys(errors).length !== 0){
            Swal.fire({
                icon: "error",
                title: "Validation Error",
                text: "Please fill all fields!",
                showLoaderOnConfirm: false,
                showLoaderOnDeny:false,
                loaderHtml:`<div></div>`
              });
              handleSubmit();
        }else{
            handleSubmit();
        }})}}>
    <CheckoutActivityFormTracker orderType="RETOUCHING" />
    <div className="contactSection" id='photos'>
         <div className="formContainer-retouching">
          <div className="formControll">
                <label htmlFor="firstname">First Name</label>
                <input data-formControlName="firstname" value={values.firstname} onChange={handleChange} type='text' placeholder="Please Write Your First Name" name="firstname"
                    id="firstname"/>
                {errors.firstname && touched.firstname && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} alt="img"/>
                    </span> Please enter your first name
                </div>}
            </div>
            <div className="formControll">
                <label htmlFor="lastname">Last Name</label>
                <input data-formControlName="lastname" type='text' value={values.lastname} onChange={handleChange} placeholder="Please Write Your Last Name" name="lastname"
                    id="lastname"/>
                {errors.lastname && touched.lastname && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} />
                    </span> Please enter your last name
                </div>}
            </div>
            <div className="formControll">
                <label htmlFor="email">Email</label>
                <input data-formControlName="email" type="email" value={values.email} onChange={handleChange} id="email" placeholder="Please Write Your Email"
                    name="email"/>
                {errors.email && touched.email && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} />
                    </span> Please enter your valid email address
                </div>}
            </div>
            <div className="formControll">
                <label htmlFor="phone">Phone Number</label>
                <input data-formControlName="phone" type="tel" value={values.phone} onChange={handleChange} id="phone" placeholder="Please Write Your Phone Number"
                    name="phone"/>
                {errors.phone && touched.phone && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} />
                    </span> Please enter your phone number
                </div>}
            </div>
            <div className="formControll">
                <label htmlFor="address">Address</label>
                <input data-formControlName="address" type="text" value={values.address} onChange={handleChange} placeholder="Please Write Your Address" id="address" name="address"/>
                {errors.address && touched.address && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} />
                    </span> Please enter your address
                </div>}
            </div>
            <div className="formControll">
                <label htmlFor="country">Country</label>
                <input data-formControlName="country" value={values.country} onChange={handleChange} type="text" placeholder="Please Write Your Country" id="country"
                    name="country"/>
                {errors.country && touched.country && <div className="inputError">
                    <div className="arrow-up"></div>
                    <span>
                        <img className="errorImage" src={"/images/images/error.jpeg"} />
                    </span> Please enter your Country
                </div>}
            </div>
            <div className="formControll">
                <label htmlFor="area">Service</label>
                <span>
                    <p>Please choose one or multiple services from below</p>
                </span>
            </div>
            <br/>
            <div className="formControll">
                <div>
                    <input checked={values.bgRemove} onChange={(e)=>setFieldValue('bgRemove', !values.bgRemove)}
                        type="checkbox" name="img-bg" />
                    <label className="margin-left-15" htmlFor="img-bg">Image Background Removal</label><br/>
                </div>
                <div>
                    <input checked={values.postProduction} onChange={(e)=>setFieldValue('postProduction', !values.postProduction)}
                        type="checkbox" name="img-bg" />
                    <label className="margin-left-15" htmlFor="img-bg">Photography Post Production Editing</label><br/>
                </div>
                <div>
                    <input checked={values.masking} onChange={(e)=>setFieldValue('masking', !values.masking)}
                        type="checkbox" name="img-bg" />
                    <label className="margin-left-15" htmlFor="img-bg">Image Masking Service</label><br/>
                </div>
                <div>
                    <input checked={values.jewelry} onChange={(e)=>setFieldValue('jewelry', !values.jewelry)}
                        type="checkbox" name="img-bg"/>
                    <label className="margin-left-15" htmlFor="img-bg">Jewelry Photo Editing</label><br/>
                </div>
                <div>
                    <input checked={values.colorCorrection} onChange={(e)=>setFieldValue('colorCorrection', !values.colorCorrection)}
                        type="checkbox" name="img-bg"/>
                    <label className="margin-left-15" htmlFor="img-bg">Photoshop Color Correction & Editing
                        Service</label><br/>
                </div>
            </div>
            <div className="formControll">
                <div>
                    <input checked={values.clippingPath} onChange={(e)=>setFieldValue('clippingPath', !values.clippingPath)}
                        type="checkbox" name="img-bg" />
                    <label className="margin-left-15" htmlFor="img-bg">Clipping Path Service</label><br/>
                </div>
                <div>
                    <input checked={values.retouching} onChange={(e)=>setFieldValue('retouching', !values.retouching)}
                        type="checkbox" name="img-bg"/>
                    <label className="margin-left-15" htmlFor="img-bg">Image Retouching Service</label><br/>
                </div>
                <div>
                    <input checked={values.restoration} onChange={(e)=>setFieldValue('restoration', !values.restoration)}
                        type="checkbox" name="img-bg"/>
                    <label className="margin-left-15" htmlFor="img-bg">Image Restoration Service</label><br/>
                </div>
                <div>
                    <input checked={values.mannequin} onChange={(e)=>setFieldValue('mannequin', !values.mannequin)}
                        type="checkbox" name="img-bg"/>
                    <label className="margin-left-15" htmlFor="img-bg">Ghost Mannequin Service</label><br/>
                </div>
                <div>
                    <input checked={values.automotive} onChange={(e)=>setFieldValue('automotive', !values.automotive)}
                        type="checkbox" name="img-bg"/>
                    <label className="margin-left-15" htmlFor="img-bg">Automative Photo Editing</label><br/>
                </div>
            </div>



            <div className="formControll">
                <label htmlFor="people">Return File Format</label>
                {/* <!-- <input data-formControlName="returnFileFormat" type="text" id="formate"
                    placeholder="Please Write Your File formate" name="formate"> --> */}
                <select data-formControlName="returnFileFormat" name="returnFileFormat" value={values.returnFileFormat} onChange={handleChange}>
                    <option selected disabled value="">Select Format</option>
                    <option value="JPG">JPG</option>
                    <option value="pdf">PNG</option>
                    <option value="pdf">GIF</option>
                    <option value="pdf">TIFF</option>
                    <option value="pdf">PSD</option>
                    <option value="pdf">PDF</option>
                </select>

            </div>
            <br/>

            {values.bgRemove && <div>
                <label>Upload Photo(s) for Background Removal </label>
                <ImageDropzone orderType="RETOUCHING" files={filesBGRemove} setFiles={setfilesBGRemove}/>
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.clippingPath && <div>
                <label>Upload Photo(s) for Clipping Path </label>
                <ImageDropzone orderType="RETOUCHING" files={filesClippingPath} setFiles={setFilesClippingPath} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.postProduction && <div>
                <label>Upload Photo(s) for Post Production Editing </label>
                <ImageDropzone orderType="RETOUCHING" files={filesPostProduction} setFiles={setFilesPostProduction} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.retouching && <div>
                <label>Upload Photo(s) for Image Retouching </label>
                <ImageDropzone orderType="RETOUCHING" files={filesImageRetouching} setFiles={setFilesImageRetouching} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.masking && <div>
                <label>Upload Photo(s) for Image Masking </label>
                <ImageDropzone orderType="RETOUCHING" files={filesImageMasking} setFiles={setFilesImageMasking} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.restoration && <div>
                <label>Upload Photo(s) for Image Restoration </label>
                <ImageDropzone orderType="RETOUCHING" files={filesImageRestoration} setFiles={setFilesImageRestoration} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.jewelry && <div>
                <label>Upload Photo(s) for Jewelry Photo Editing </label>
                <ImageDropzone orderType="RETOUCHING" files={filesJewelryEditing} setFiles={setFilesJewelryEditing} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.mannequin && <div>
                <label>Upload Photo(s) for Ghost Mannequin service </label>
                <ImageDropzone orderType="RETOUCHING" files={filesGhostMannequin} setFiles={setFilesGhostMannequin} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.colorCorrection && <div>
                <label>Upload Photo(s) for Color Correction and Editing Service </label>
                <ImageDropzone orderType="RETOUCHING" files={filesColorCorrection} setFiles={setFilesColorCorrection} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}

            {values.automotive && <div>
                <label>Upload Photo(s) for Automotive photo Editing Service </label>
                <ImageDropzone orderType="RETOUCHING" files={filesAutomativePhotoEditing} setFiles={setFilesAutomativePhotoEditing} />
                <UploadInfoLabel supportedTypes={RETOUCHING_IMAGE_TYPES} />
            </div>}      

            <br/>
            </div>
            <div className="formControll">

            <div className="formControll any-comments">
                <label htmlFor="people">Any Comments</label>
                <textarea data-formControlName="comments" typeof="textarea" id="comments" name="comments"> </textarea>
            </div>
            
            <label htmlFor="price">Price</label>
            <input readOnly data-formControlName="price" value={price} type="text" placeholder="Please enter price" id="price" name="price"/>
            <div className="order-summary">
                {values.bgRemove && <p> Image Background Removal: {filesBGRemove.length} Photos x 35 AED =
                    {filesBGRemove.length * 35} AED
                </p>}
                {values.clippingPath && <p > Clipping Path Service: {filesClippingPath.length} Photos x 30 AED =
                    {filesClippingPath.length * 30} AED
                </p>}
                {values.postProduction && <p> Photography Post Production Editing: {filesPostProduction.length} Photos x
                    25 AED = {filesPostProduction.length * 25} AED </p>}
                {values.retouching && <p> Image Retouching Service: {filesImageRetouching.length} Photos x 20 AED =
                    {filesImageRetouching.length * 20}
                    AED </p>}
                {values.masking && <p> Image Masking Service: {filesImageMasking.length} Photos x 15 AED =
                    {filesImageMasking.length * 15} AED </p>}
                {values.restoration && <p> Image Restoration Service: {filesImageRestoration.length} Photos x 10 AED =
                    {filesImageRestoration.length *
                    10} AED </p>}
                {values.jewelry && <p> Jewelry Photo Editing: {filesJewelryEditing.length} Photos x 35 AED =
                    {filesJewelryEditing.length * 35} AED </p>}
                {values.mannequin && <p> Ghost Mannequin Service: {filesGhostMannequin.length} Photos x 30 AED =
                    {filesGhostMannequin.length * 30} AED </p>}
                {values.colorCorrection && <p> Photoshop Color Correction & Editing Service:
                    {filesColorCorrection.length} Photos x 25 AED =
                    {filesColorCorrection.length * 25} AED </p>}
                {values.automotive && <p> Automative Photo Editing:
                    {filesAutomativePhotoEditing.length} Photos x 20 AED =
                    {filesAutomativePhotoEditing.length * 20} AED </p>}
                <OrderTotalPrice total={Number(price)} />
            </div>
    </div>
            </div>
            <br/>
    <div id="form-container" className="formControll payment-form">
        <Checkout/>
        <div className="submit-button">
            <button type="submit" id="tap-btn">Submit</button>
        </div>
    </div>
</form>
    )}
    </Formik>
</div>
  )
}

export default RetouchingForm