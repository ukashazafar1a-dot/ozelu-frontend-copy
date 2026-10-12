import React from 'react'

function Banner({title}:any) {
  return (
    <div className="shopify-section" style={{background: '#6ec1cd'}}>
        <div className="p-5">
          <h1 className="text-center text-white h2">{title == 'Products' ? 'All Products' : title}</h1>
        </div>
    </div>
  )
}

export default Banner