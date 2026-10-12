// import React from "react";
// import "../../screens/Home/Services/styleEComerecServices.scss";

// const Product = 
//   {
//     image: "https://cdn.shopify.com/s/files/1/0613/5758/8700/products/WomenTshirts-BitterLemonMockup3_360x.png?v=1654278025",
//     name: "Bitter Lemon Food Pun – Funny Women’s Tshirt",
//     price:"Dhs. 95",
//     colors: [{color: "red"}, {color: "green"}, {color: "blue"}, {color: "black"}]
//   }


// const TrendingProductCard = () => {
//   return (
//     <div className="wrapper_e-comerece" style={{background:"white"}}>
//       <div class="product-inner pr">
//         <div class="product-image pr oh lazyloadt4sed">
//           <span class="tc nt_labels pa pe_none cw"></span>
//           <a
//             class="db"
//             href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt"
//           >
//             <div
//               class="pr_lazy_img main-img nt_img_ratio nt_bg_lz lazyloadt4sed"
//               style={{backgroundImage: `url(${Product.image})`}}
//             >
//               <img
//                 alt=""
//                 class="lazyautosizes lazyloadt4sed"
//                 data-sizes="auto"
//                 data-ratio="1.0"
//                 sizes="270px"
//               />
//             </div>
//           </a>
//           <div class="nt_add_w ts__03 pa ">
//             <a
//               href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt"
//               data-no-instant=""
//               data-id="7692006949084"
//               class="wishlistadd cb chp ttip_nt tooltip_right"
//               rel="nofollow"
//             >
//               <span class="tt_txt">Add to Wishlist</span>
//               <i class="facl facl-heart-o"></i>
//             </a>
//           </div>
//           <div class="hover_button op__0 tc pa flex column ts__03 des_btns_pr_1 has_sizelistt4_true has_2btnst4_pr">
//             <a
//               class="pr nt_add_qv js_add_qv cd br__40 pl__25 pr__25 bgw tc dib ttip_nt tooltip_top_left"
//               href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt"
//               data-id="7692006949084"
//               rel="nofollow"
//             >
//               <span class="tt_txt">Quick view</span>
//               <i class="iccl iccl-eye"></i>
//               <span>Quick view</span>
//             </a>
//             <a
//               href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt"
//               data-id="7692006949084"
//               class="pr pr_atc cd br__40 bgw tc dib js__qs cb chp ttip_nt tooltip_top_left"
//               rel="nofollow"
//             >
//               <span class="tt_txt">Quick Shop</span>
//               <i class="iccl iccl-cart"></i>
//               <span>Quick Shop</span>
//             </a>
//           </div>
//           <div class="product-attr pa ts__03 cw op__0 tc pe_none">
//             <p class="truncate mg__0 w__100">S, M, L, XL, XXL</p>
//           </div>
//         </div>
//         <div class="product-info mt__15">
//           <h3 class="product-title pr fs__14 mg__0 fwm">
//             <a
//               class="cd chp"
//               href="/collections/trending/products/bitter-lemon-food-pun-funny-women-s-tshirt"
//             >
//               {Product.name}
//             </a>
//           </h3>
//           <span class="price dib mb__5">{Product.price}</span>
//           <div
//             class="shopify-product-reviews-badge star-rating"
//             data-id="7692006949084"
//           ></div>
//           <div
//             class="swatch__list_js swatch__list lh__1 nt_swatches_on_grid lazyloadt4sed"
//             style={{display:"flex", justifyContent:"space-evenly", width:"70%", alignItems:"center", margin:"auto"}}
            
//             >
//             {Product.colors.map(color=>{
//               return(
//             <span class="swatch__list--item pr ttip_nt tooltip_top_right" >
//             <span  style={{height:"16px", width:"16px", background:`${color.color}`, borderRadius:"50%", display:"flex", border: "2px solid #ddd"}}></span>
//             <span class="swatch__value bg_color_white lazyloadt4sed"></span>
//             </span>
//               )
//             })
//             }
//             {/* <span class="swatch__list--item pr ttip_nt tooltip_top_right">
//               <span class="tt_txt" >Black</span>
//               <span class="swatch__value bg_color_black lazyloadt4sed" style={{background:"black"}}></span>
//             </span>
//             <span class="swatch__list--item pr ttip_nt tooltip_top_right">
//               <span class="tt_txt">Navy Blue</span>
//               <span class="swatch__value bg_color_navy-blue lazyloadt4sed"></span>
//             </span>
//             <span class="swatch__list--item pr ttip_nt tooltip_top_right">
//               <span class="tt_txt">Royal Blue</span>
//               <span class="swatch__value bg_color_royal-blue lazyloadt4sed"></span>
//             </span>
//             <span class="swatch__list--item pr ttip_nt tooltip_top_right">
//               <span class="tt_txt">Pastel Yellow</span>
//               <span class="swatch__value bg_color_pastel-yellow lazyloadt4sed"></span>
//             </span> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TrendingProductCard;
