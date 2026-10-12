"use client"
import { returnImage } from '@/helpers/generals'
import React from 'react'


const Banner = ({section}:any) => {
  return (
    <div className='banner-container__cv-page d-flex flex-column-reverse flex-md-row'>
        <div className='banner-text__cv-page col-md-6 d-flex flex-column align-items-start justify-content-start p-3 px-md-5 py-md-4'>
          <h1 className='fw-bold mb-5'>Elevate Your Job Search With Our Free and Premium CV Templates</h1>
          <div className="rte">
             <p>Choose from our free samples or paid templates (editable) of well-designed expert
             approved CVs or get in touch with us to design for you a fully customized CV based 
             on the industry you are hunting for and the profession you would like to get into. </p>
          </div>
        </div>
        <div className='banner-img__cv-page col-md-6 p-0'>
          {returnImage(section?.settings?.image,'w-100',800)}
        </div>
    </div>
  )
}

export default Banner