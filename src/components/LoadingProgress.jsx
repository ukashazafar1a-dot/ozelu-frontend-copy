"use client"
import React from 'react'
import './loading.css'

function LoadingProgress({loaded}) {
  return (
    <div className='loading--wrapper'>
        <img src={"/images/Rolling.svg"} style={{width:'auto'}}/>
        <span>Uploading files...</span>
        <div className='progress-bar'>
            <div className='progress-bar--inner' style={{width: loaded + '%'}}>
                {loaded+'%'}
            </div>
        </div>
    </div>
  )
}

export default LoadingProgress