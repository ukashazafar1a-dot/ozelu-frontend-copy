"use client"
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { Navigation, Zoom } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css/zoom'
import 'swiper/css/navigation'
import Lightbox from './Lightbox';

function CvCard({ id, item, openModal }) {
  //console.log("Item>>", item)
  const [images, setImages] = useState([]);

  useEffect(() => {
    //console.log("Item", item)
    if (!item?.preview) return;
    let imgs = item?.preview?.map((item) => {
      if (item.path.includes('https')) {
        return item.path;
      } else {
        return item.path.replace('http', 'https');
      }
    })
    //console.log("Images", imgs)
    setImages(imgs);
  }, [item])

  return (<>
    <div className="col-12 col-lg-4 col-md-4 my-4">
      <div style={{ padding: '32px', backgroundColor: '#eff2f9' }}>
        <div className="cv-card__img" style={{
          backgroundImage: `url("${item?.preview[0]?.path}")`,
          position: 'relative',
          paddingBottom: '139.389%',
          borderRadius: '4px',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}>

          <Lightbox images={images} />
          <button className="cv-card__btn btn btn-sm" onClick={() => openModal(item)}>Download</button>
        </div>
        <div className='cv-content py-1'>
          <ul className='p-0 m-0'>
            <li className='d-flex justify-content-between price-column mt-2 fw-medium'>
              <span>Price</span>
              <span>{item?.price}{` AED`}</span>
            </li>
            <li className='text-right name-column'>
              <h5>{images?.length} {images?.length === 1 ? ' Page' : ' Pages'}</h5>
              <h5>.Docx / .Doc</h5>
            </li>
            {item?.isPaid && <li className='text-right'>
                <button 
                  type="button" 
                  className="button__cv-page premium" 
                  onClick={(e) => { openModal(item) }}>
                  PREMIUM CV
                </button>
            </li>}
            {!item?.isPaid && <li className='text-right'>
                <button 
                  type="button" 
                  className="button__cv-page" 
                  onClick={(e) => { openModal(item) }}>
                  FREE CV
                </button>
            </li>}
          </ul>
        </div>
      </div>
    </div>
  </>
  )
}

export default CvCard