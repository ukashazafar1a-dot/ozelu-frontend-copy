"use client"
import React from 'react'

import "../../screens/Home/Services/styleEComerecServices.scss";

import "./TrendingProduct.scss"

const Product = 
  {
    image: "https://cdn.shopify.com/s/files/1/0613/5758/8700/products/WomenTshirts-BitterLemonMockup3_360x.png?v=1654278025",
    name: "Bitter Lemon Food Pun – Funny Women’s Tshirt",
    price:"Dhs. 95",
    colors: [{color: "red"}, {color: "green"}, {color: "blue"}, {color: "black"}]
  }


const TrendingProduct = () => {
  return (
    <div className='wrapper_trending-card'>
        
   <div className="product-inner pr">
      <div className="product-image pr oh lazyloadt4sed"
         data-rendert4s="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt/?view=imgtrue"
         data-currentrendert4s="">
        <span className="tc nt_labels pa pe_none cw"></span>
         <a className="db"
            href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt">
            <div className="pr_lazy_img main-img nt_img_ratio nt_bg_lz lazyloadt4sed" 
            // data-id="37193404743900"
            //    data-bgset="//cdn.shopify.com/s/files/1/0613/5758/8700/products/WomenTshirts-BitterLemonMockup3_180x.png?v=1654278025 180w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/WomenTshirts-BitterLemonMockup3_360x.png?v=1654278025 360w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/WomenTshirts-BitterLemonMockup3_540x.png?v=1654278025 540w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/WomenTshirts-BitterLemonMockup3_720x.png?v=1654278025 720w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/WomenTshirts-BitterLemonMockup3_900x.png?v=1654278025 900w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/WomenTshirts-BitterLemonMockup3_1080x.png?v=1654278025 1080w"
            //    data-parent-fit="width" data-wiis="" data-ratio="1.0"
               style={{backgroundImage: `url(${Product.image})`}}>
               <div style={{height: "345px", width:"260px"}}>
                  
                  <img alt="" className="lazyautosizes lazyloadt4sed" data-sizes="auto" data-ratio="1.0" sizes="243px"/>
               </div>
            </div>
         </a>
         <div className="nt_add_w ts__03 pa ">
            <a href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt" data-no-instant=""
               data-id="7692006949084" className="wishlistadd cb chp ttip_nt tooltip_right" rel="nofollow"><span
                  className="tt_txt">Add to Wishlist</span><i className="facl facl-heart-o"></i></a>
         </div>
         <div className="hover_button op__0 tc pa flex column ts__03 des_btns_pr_1 has_sizelistt4_true has_2btnst4_pr"><a
               className="pr nt_add_qv js_add_qv cd br__40 pl__25 pr__25 bgw tc dib ttip_nt tooltip_top_left"
               href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt" data-id="7692006949084"
               rel="nofollow"><span className="tt_txt">Quick view</span><i className="iccl iccl-eye"></i><span>Quick
                  view</span></a><a href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt"
               data-id="7692006949084" className="pr pr_atc cd br__40 bgw tc dib js__qs cb chp ttip_nt tooltip_top_left"
               rel="nofollow"><span className="tt_txt">Quick Shop</span><i className="iccl iccl-cart"></i><span>Quick
                  Shop</span></a></div>
         <div className="product-attr pa ts__03 cw op__0 tc pe_none">
            <p className="truncate mg__0 w__100">S, M, L, XL, XXL</p>
         </div>
      </div>
      <div className="product-info mt__15">
         <h3 className="product-title pr fs__14 mg__0 fwm"><a className="cd chp"
               href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt">Bitter Lemon Food Pun –
               Funny Women’s Tshirt</a></h3>
         <span className="price dib mb__5">Dhs. 95
         </span>
         <div className="shopify-product-reviews-badge star-rating" data-id="7692006949084"></div>
         <div className="swatch__list_js swatch__list lh__1 nt_swatches_on_grid lazyloadt4sed" data-colorcount="5"
            data-rendert4s="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt/?view=swtrue"
            data-currentrendert4s="">

                {Product.colors.map((color,i)=>{
                  return (<span key={i} className="swatch__list--item pr ttip_nt tooltip_top_right"><span
                  className="tt_txt">{color.color}</span><span
                  className="swatch__value bg_color_white lazyloadt4sed" style={{background: `${color.color}`}}></span></span>)
                })}
                  {/* <span className="swatch__list--item pr ttip_nt tooltip_top_right"><span
                  className="tt_txt">White</span><span
                  className="swatch__value bg_color_white lazyloadt4sed"></span></span>
                  <span className="swatch__list--item pr ttip_nt tooltip_top_right"><span
                  className="tt_txt">White</span><span
                  className="swatch__value bg_color_white lazyloadt4sed"></span></span>
                  <span className="swatch__list--item pr ttip_nt tooltip_top_right"><span
                  className="tt_txt">White</span><span
                  className="swatch__value bg_color_white lazyloadt4sed"></span></span>
                  <span className="swatch__list--item pr ttip_nt tooltip_top_right"><span
                  className="tt_txt">White</span><span
                  className="swatch__value bg_color_white lazyloadt4sed"></span></span> */}
                  {/* <span
               className="swatch__list--item pr ttip_nt tooltip_top_right"><span className="tt_txt">Black</span><span
                  className="swatch__value bg_color_black lazyloadt4sed"></span></span><span
               className="swatch__list--item pr ttip_nt tooltip_top_right"><span className="tt_txt">Navy Blue</span><span
                  className="swatch__value bg_color_navy-blue lazyloadt4sed"></span></span><span
               className="swatch__list--item pr ttip_nt tooltip_top_right"><span className="tt_txt">Royal Blue</span><span
                  className="swatch__value bg_color_royal-blue lazyloadt4sed"></span></span><span
               className="swatch__list--item pr ttip_nt tooltip_top_right"><span className="tt_txt">Pastel Yellow</span><span
                  className="swatch__value bg_color_pastel-yellow lazyloadt4sed"></span></span> */}
                  </div>
      </div>
   </div>

    </div>
  )
}

export default TrendingProduct