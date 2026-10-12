import { returnImage } from '@/helpers/generals'
import React from 'react'

const Banner = ({section}:any) => {
  return (
    <div className='banner-container'>
        {returnImage(section?.settings?.image)}
        <div className='main_content_inner'>
          <h1 className='mb-5 fw-bold'>JUMP START YOUR <br/>BUSINESS</h1>
          <h2 className='fw-bold'>With a Perfect Logo</h2>  
        </div>
    </div>
  )
}

export default Banner