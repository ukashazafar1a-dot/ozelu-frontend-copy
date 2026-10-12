"use client"
import { returnImage } from '@/helpers/generals'
import React, { useEffect,useState } from 'react'



function Banner({section:data}:any) {
    const [section,setSection] = useState<any>({})
    useEffect(()=>{
        setSection(data)
    },[data])
    return (
    <section className="banner">
        <div className='row'>
            <div className="col-md-6 header-text-container px-3 m-md-0">
                <div className="hero-area-text">
                    <h1 className="h1 cover-photo-heading ">You Request <br />We Deliver</h1>
                    <div className="paragraph rte rte-settings description cover-photo-content first-description">
                        <p>
                            Ozelu focuses on providing traditional photo studio
                            services
                            online,
                            while having a creative touch and
                            being customer centric.
                        </p>
                    </div>
                </div>
            </div>
            <div className="col-md-6 img-div overflow-hidden" >
                {returnImage(section?.settings?.image)}
            </div>
        </div>
    </section>
    )
}

export default Banner