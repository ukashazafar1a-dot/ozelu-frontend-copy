"use client"
import React from 'react'
import "./style.css"
import Link from 'next/link'
const GridSection = ({collections}) => {
    console.log(collections)
    return (
    <div className='container container_cat cat_default my-5'>
        <div className='nt_cats_holder row justify-content-center equal_nt hoverz_true ratio1_1 cat_space_30 cat_design_1'>
            {collections?.map(collection=>
            {return (<div key={collection?._id} className='cat_grid_item px-2  mb-2 col-lg-4 col-md-3'>
                <div className='oh relative'>
                    <div className='cat_grid_item__content relative oh'>
                        <Link href={`/collections/`+collection?.slug} className="d-block relative oh">
                            <div className='cat_grid_item__overlay nt_bg_lz lazyloadt4sed' style={{backgroundImage: `url(${collection?.featured_image?.src})`}}>
                                <span></span>
                            </div>
                        </Link>
                    </div>
                    <div className='cat_grid_item__wrapper pe_none'>
                        <div className='cat_grid_item__title h3'>
                            {collection?.title}
                        </div>
                    </div>
                </div>
            </div>)
            })}
        </div>
    </div>
    )
}

export default GridSection