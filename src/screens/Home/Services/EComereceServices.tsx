"use client"
import React, { useEffect } from "react";
import "./styleEComerecServices.css";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";


const EComereceServices =  () => {
  const [collections, setCollections] = useState<any>([])

  useEffect(()=>{
      const getCollections =async ()=>{
          const {data} = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/assets/collections/by-tag/'+'trending');
          const {collections} = data
          setCollections(collections)
      }
      getCollections()
  },[])

  return (
    <section className="container">
      <div className="services-tittle">
        <div className="container" >
          <h2 className="txt-center heading-h2 my-5">E-Commerce Store</h2>
        </div>
      </div>
      <div className="shopify-section nt_section type_collection_list ecomerece-services_wrapper">
        <div className="nt_se_1652476174fe4738a5 wrap">
          {/* <div className="container"> */}
            <div className="mt__30 nt_cats_holder row equal_nt hoverz_true cat_size_3 cat_lay4_2 cat_lay5_1 cat_space_20 cat_design_2 col-12">
              <div className="cat_grid_item cat_space_item cat_grid_item_1 col-md-6 ">
                <div className="cat_grid_item__content pr oh">
                  <Link href={'/collections/'+collections[0]?.slug} className="db cat_grid_item__link">
                    <div
                      className="cat_grid_item__overlay item__position nt_bg_lz center lazyloadt4sed"
                      style={{
                        backgroundImage:`url(${collections[0]?.featured_image.src})`
                      }}
                    ></div>{" "}
                  </Link>
                  <div className="cat_grid_item__wrapper pe_none">
                    <div className="cat_grid_item__title h3">{collections[0]?.title}</div>
                    <div className="cat_grid_item__count dn">{collections[0]?.products.length}</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="row" >
                  <div className="cat_grid_item cat_space_item cat_grid_item_2 col-12" >
                    <div className="cat_grid_item__content pr oh">
                        <Link href={'/collections/'+collections[1]?.slug} className='db cat_grid_item__link'>
                        <div
                          className="cat_grid_item__overlay item__position nt_bg_lz center lazyloadt4sed"
                          style={{
                            backgroundImage:
                            ` url( ${collections[1]?.featured_image.src})`
                          }}
                        ></div>{" "}
                      </Link>
                      <div className="cat_grid_item__wrapper pe_none">
                        <div className="cat_grid_item__title h3">
                        {collections[1]?.title}
                        </div>
                        <div className="cat_grid_item__count dn">{collections[1]?.products.length}</div>
                      </div>
                    </div>
                  </div>
                  <div className="cat_grid_item cat_space_item cat_grid_item_3 col-12">
                    <div className="cat_grid_item__content pr oh">
                        <Link href={'/collections/'+collections[2]?.slug} className="db cat_grid_item__link">
                          <div
                            className="cat_grid_item__overlay item__position nt_bg_lz center lazyloadt4sed"
                            style={{
                              backgroundImage:
                              ` url( ${collections[2]?.featured_image.src})`
                            }}
                          ></div>
                        </Link>
                      <div className="cat_grid_item__wrapper pe_none">
                        <div className="cat_grid_item__title h3">{collections[2]?.title}</div>
                        <div className="cat_grid_item__count dn">{collections[2]?.products.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/* </div> */}
        </div>
      </div>
    </section>
  );
};

export default EComereceServices;
