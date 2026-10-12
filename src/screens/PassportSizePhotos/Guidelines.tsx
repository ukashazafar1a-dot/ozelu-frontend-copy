'use client'

import React,{useState,useEffect} from 'react'
import {BeforeAfterImageCategory} from '../../utils'
import NewAppCarusal from './Swiper/NewCarusal'

function Guidelines() {

    const [adultImages, setAdultImages] = useState<any>([]);
    const [babyImages, setBabyImages] = useState<any>([]);
    const [kidImages, setKidImages] = useState<any>([]);

    function getBeforeAfterObj(number:any, category:any) {
      const beforeImgSrc =
        `/images/images/passport-size-photos-delivery/before-after/${category}-passport-size-photo-sample${number ? `-${number}` : ''}-before.jpg`;
      const afterImgSrc =
        `/images/images/passport-size-photos-delivery/before-after/${category}-passport-size-photo-sample${number ? `-${number}` : ''}-after.jpg`;
      return {
        beforeImgSrc: beforeImgSrc,
        afterImgSrc: afterImgSrc,
      };
    }

    function loadImages() {
      setAdultImages([
        getBeforeAfterObj(null, BeforeAfterImageCategory?.Man),
        getBeforeAfterObj(1, BeforeAfterImageCategory?.Woman),
        getBeforeAfterObj(null, 'adult'),
        getBeforeAfterObj(2, BeforeAfterImageCategory?.Woman),
        getBeforeAfterObj(null, 'emirates-id'),
        getBeforeAfterObj(3, BeforeAfterImageCategory?.Woman),
        getBeforeAfterObj(null, 'uae-visa'),
        getBeforeAfterObj(null, 'female'),
      ]);
  
      setKidImages([
        getBeforeAfterObj(1, BeforeAfterImageCategory?.Kid),
        getBeforeAfterObj(2, BeforeAfterImageCategory?.Kid),
        getBeforeAfterObj(3, BeforeAfterImageCategory?.Kid),
        getBeforeAfterObj(null, 'kid-emirates-id'),
      ]);
  
      setBabyImages([
        getBeforeAfterObj(1, BeforeAfterImageCategory?.Baby),
        getBeforeAfterObj(2, BeforeAfterImageCategory?.Baby),
        getBeforeAfterObj(3, BeforeAfterImageCategory?.Baby),
        getBeforeAfterObj(4, 'new-born'),
      ]);
    }
  
    useEffect(() => {
      // declare the data fetching function
      const fetchData = () => {
        const data = loadImages();
      };
      // call the function
      fetchData()
        // make sure to catch any error
        ;
    }, []);

  return (
    <section className='mt-5 pt-5'>
      <div className="rules pt-5 my-5">
          <h2 className="heading-h2 text-center my-3">
            Guidelines for taking photo from home for passport size photo delivery
          </h2>
      </div>
      <div className="rules">
          {adultImages.length > 0 &&
          kidImages.length > 0 &&
          babyImages.length > 0 && (
              <NewAppCarusal
              carouselName="adult"
              adultImages={adultImages}
              kidImages={kidImages}
              babyImages={babyImages}
              />
          )}
      </div>
    </section>
  )
}

export default Guidelines