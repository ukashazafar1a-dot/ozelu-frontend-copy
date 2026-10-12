"use client"
import React from 'react'
import  "./Loader.scss"


const Loader = () => {
  return(
    <div id="loader" className="full-screen-loader">
      <div className="loader">
        <div className="circle"></div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
   )
}
export default Loader;

