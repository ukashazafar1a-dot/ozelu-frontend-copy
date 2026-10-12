"use client"
import React from 'react'
import './loading.css'

function Loading() {
  return (
    <div className='loading--wrapper'>
        <img src={'/images/Rolling.svg'} style={{width:'auto'}}/>
        <span>Loading...</span>
    </div>
  )
}

export default Loading