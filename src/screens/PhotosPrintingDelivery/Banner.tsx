import './banner.css'
import React from 'react'

function Banner() {
  return (
    <div className="homeSection" id="home" style={{backgroundImage: "url('/images/images/photos-printing-delivery/photos-printing-delivery-dubai.jpg')"}}>
        <div className="homeSectionLeftContent">
          <h1 className="heading"></h1>
          <div className="description"></div>
        </div>
    </div>
  )
}

export default Banner