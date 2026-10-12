import React from 'react'

const Banner = () => {
  return (
    <section className='banner-section'>
        <div className="pb-5 mb-5 container">
            <h2 className="heading-h2 mb-5 mx-0">Documents Printing & Delivery</h2>
            <div className="inner-container d-flex justify-content-between flex-wrap">
                <div className="p-container col-md-7">
                    
                    <div className="rte mb-3">
                    <p>If you want quick and easy printing of your A4 documents, 
                    delivered to your doorstep, simply use our form below, 
                    upload your documents and pay using your credit or debit card.<br/>
                    If you want quick and easy printing of your A4 or A3 documents, 
                    delivered to your doorstep, simply use our form below, upload your documents 
                    and pay using your credit or debit card.</p>
                    <p>We do single sided printing by default, if you need double sided for any document, 
                        please do mention its name in the comments field and we will manage it.</p>
                    </div>
                </div>
                <div className="img-container col-md-5">
                    <img 
                        src={"/images/images/documets-printing/documents-printing-delivery-dubai.jpg"} 
                        alt="Document Printing & Delivery Page Banner"
                        loading='lazy'
                    />
                </div>
            </div>
        </div>
    </section>
  )
}

export default Banner