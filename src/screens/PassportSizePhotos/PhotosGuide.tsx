import React from 'react'
import GuideTabs from './components/GuideTabs'

const PhotosGuide = ({section}:any) => {
  return (
    <div className='pg-main my-3'>
      <div className="section--header text-center">
          <h2 className="heading-h2 text-center mx-0 mt-0 text-capitalize">
            Guidelines for taking photo from home for <br/>passport size photo delivery</h2>
      </div>
      <GuideTabs section={section}/>
    </div>
  )
}

export default PhotosGuide