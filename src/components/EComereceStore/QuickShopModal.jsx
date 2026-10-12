"use client"
import React, { useRef,useEffect } from 'react'
import Flickity from 'flickity'
import './QuickShopModal.scss'
import 'flickity/css/flickity.css'

function QuickShopModal() {
    const carousel = useRef(null);
        
    async function initFlickity() {
        if (typeof window !== 'undefined' && carousel.current) {
            new Flickity(carousel.current, {
                fade: false,
                cellSelector: '.qs_img_i',
                cellAlign: 'center',
                wrapAround: true,
                autoPlay: false,
                prevNextButtons: false,
                adaptiveHeight: true,
                imagesLoaded: false,
                lazyLoad: 0,
                dragThreshold: 0,
                pageDots: false,
                rightToLeft: false

            })
        }
    }
    useEffect(() => {
        initFlickity();
    }, []);

  return (
    <>
        <div className="mfp-bg mfp-move-vertical mfp-ready wrapper-quickshop-model" style={{position: 'fixed'}}></div>
        <div className="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-move-vertical mfp-ready" tabindex="-1" style={{top:'0',position:'absolute',height:'884px'}}>
            <div className="mfp-container mfp-s-ready mfp-inline-holder">
                <div className="mfp-content">
                    <div className="mfp-with-anim pp_qs" id="content_quickview">
                        <div className="wrap_qs_pr buy_qs_true" id="productqs-7686040879324">
                        <div className="qs_imgs_i row al_center mb__30">
                            <div className="col-auto cl_pr_img">
                                <div className="pr oh qs_imgs_wrap">
                                    <div ref={carousel} className="row equal_nt qs_imgs nt_slider nt_carousel_qs p-thumb_qs">
                                            <div data-mdid="29789454762204" className="col-12 js-sl-item qs_img_i nt_img_ratio nt_bg_lz is-selected lazyloadt4sed" data-vid="" id="imgqs_29789454762204" data-ratio="0.75" style={{paddingTop: '133.333%', backgroundImage: 'url(https://cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1080x.png?v=1654873704)'}}>
                                                <picture style={{display:'none'}}>
                                                <source data-srcset="//cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_180x.png?v=1654873704 180w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_360x.png?v=1654873704 360w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_540x.png?v=1654873704 540w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_720x.png?v=1654873704 720w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_900x.png?v=1654873704 900w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1080x.png?v=1654873704 1080w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1296x.png?v=1654873704 1296w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1512x.png?v=1654873704 1512w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1728x.png?v=1654873704 1728w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1950x.png?v=1654873704 1950w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_2100x.png?v=1654873704 2100w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_2260x.png?v=1654873704 2260w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_2450x.png?v=1654873704 2450w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_2700x.png?v=1654873704 2700w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_3000x.png?v=1654873704 3000w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_3350x.png?v=1654873704 3350w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_3750x.png?v=1654873704 3750w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_4100x.png?v=1654873704 4100w" sizes="90px" srcset="//cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_180x.png?v=1654873704 180w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_360x.png?v=1654873704 360w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_540x.png?v=1654873704 540w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_720x.png?v=1654873704 720w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_900x.png?v=1654873704 900w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1080x.png?v=1654873704 1080w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1296x.png?v=1654873704 1296w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1512x.png?v=1654873704 1512w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1728x.png?v=1654873704 1728w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_1950x.png?v=1654873704 1950w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_2100x.png?v=1654873704 2100w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_2260x.png?v=1654873704 2260w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_2450x.png?v=1654873704 2450w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_2700x.png?v=1654873704 2700w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_3000x.png?v=1654873704 3000w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_3350x.png?v=1654873704 3350w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_3750x.png?v=1654873704 3750w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/Kids-Tshirts-Snack-Monster-Mockup-1_4100x.png?v=1654873704 4100w"/>
                                                <img alt="" className="lazyautosizes lazyloadt4sed ls-is-cached" data-sizes="auto" data-ratio="0.75" data-parent-fit="cover" sizes="90px"/>
                                                </picture>
                                            </div>
                                            <div data-mdid="29736845967580" className="col-12 js-sl-item qs_img_i nt_img_ratio nt_bg_lz lazyloadt4sed" data-vid="" id="imgqs_29736845967580" data-ratio="1.3333333333333333" style={{paddingTop: '75%', backgroundImage: 'url(https://cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_180x.png?v=1654873704)'}} aria-hidden="true">
                                                <picture style={{display:'none'}}>
                                                <source data-srcset="//cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_180x.png?v=1654873704 180w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_360x.png?v=1654873704 360w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_540x.png?v=1654873704 540w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_720x.png?v=1654873704 720w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_900x.png?v=1654873704 900w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1080x.png?v=1654873704 1080w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1296x.png?v=1654873704 1296w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1512x.png?v=1654873704 1512w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1728x.png?v=1654873704 1728w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1950x.png?v=1654873704 1950w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_2100x.png?v=1654873704 2100w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_2260x.png?v=1654873704 2260w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_2450x.png?v=1654873704 2450w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_2700x.png?v=1654873704 2700w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_3000x.png?v=1654873704 3000w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_3350x.png?v=1654873704 3350w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_3750x.png?v=1654873704 3750w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_4100x.png?v=1654873704 4100w" sizes="90px" srcset="//cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_180x.png?v=1654873704 180w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_360x.png?v=1654873704 360w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_540x.png?v=1654873704 540w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_720x.png?v=1654873704 720w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_900x.png?v=1654873704 900w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1080x.png?v=1654873704 1080w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1296x.png?v=1654873704 1296w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1512x.png?v=1654873704 1512w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1728x.png?v=1654873704 1728w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_1950x.png?v=1654873704 1950w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_2100x.png?v=1654873704 2100w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_2260x.png?v=1654873704 2260w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_2450x.png?v=1654873704 2450w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_2700x.png?v=1654873704 2700w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_3000x.png?v=1654873704 3000w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_3350x.png?v=1654873704 3350w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_3750x.png?v=1654873704 3750w, //cdn.shopify.com/s/files/1/0613/5758/8700/products/KidsTshirts-SnackMonsterMockup2_4100x.png?v=1654873704 4100w"/>
                                                <img alt="" className="lazyautosizes lazyloadt4sed ls-is-cached" data-sizes="auto" data-ratio="1.3333333333333333" data-parent-fit="cover" sizes="90px"/>
                                                </picture>
                                            </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col cl_pr_title tc">
                                <h3 className="product-title pr fs__16 mg__0 fwm"><a className="cd chp" href="/collections/trending/products/snack-monster-funny-kids-tshirt">Snack Monster - Funny Kids’ Tshirt</a></h3>
                                <div id="price_qs"><span className="price ">Dhs. 85</span></div>
                            </div>
                        </div>
                        <div className="qs_info_i tc">
                            <div className="qs_swatch PR_no_pick_false">
                                <div id="callBackVariant_qs" className="nt_white nt1_2-years">
                                    <form method="post" action="/cart/add" id="cart-form_qs" accept-charset="UTF-8" className="nt_cart_form variations_form variations_form_qs" enctype="multipart/form-data">
                                    <input type="hidden" name="form_type" value="product"/>
                                    <input type="hidden" name="utf8" value="✓" />
                                    <select name="id" id="product-select_qs" className="product-select_pr product-form__variants hide hidden">
                                        <option selected="selected" value="42958172520668">White / 2 years</option>
                                        <option value="42958172553436">White / 4 years</option>
                                        <option value="42958172586204">White / 6 years</option>
                                        <option value="42958172618972">White / 8 years</option>
                                        <option value="42958172651740">Black / 2 years</option>
                                        <option value="42958172684508">Black / 4 years</option>
                                        <option value="42958172717276">Black / 6 years</option>
                                        <option value="42958172750044">Black / 8 years</option>
                                        <option value="42958172782812">Royal Blue / 2 years</option>
                                        <option value="42958172815580">Royal Blue / 4 years</option>
                                        <option value="42958172848348">Royal Blue / 6 years</option>
                                        <option value="42958172881116">Royal Blue / 8 years</option>
                                        <option value="42958172913884">Red / 2 years</option>
                                        <option value="42958172946652">Red / 4 years</option>
                                        <option value="42958172979420">Red / 6 years</option>
                                        <option value="42958173012188">Red / 8 years</option>
                                    </select>
                                    <div className="fimg_false variations mb__40 style__circle size_medium style_color des_color_1 remove_soldout_false">
                                        <div data-opname="color" className="nt_select_qs0  swatch is-color is-ntcolor" id="nt_select_qs_0">
                                            <h4 className="swatch__title"><span>Color: <span className="nt_name_current user_choose_js">White</span></span></h4>
                                            <ul className="swatches-select swatch__list_pr" data-id="0" data-size="2">
                                                <li data-swatch-itemt4="" data-index="0" data-value="white" className="ttip_nt tooltip_top_right nt-swatch swatch_pr_item bg_css_white is-selected" data-escape="White"><span className="tt_txt">White</span><span className="swatch__value_pr pr bg_color_white lazyloadt4sed"></span></li>
                                                <li data-swatch-itemt4="" data-index="1" data-value="black" className="ttip_nt tooltip_top nt-swatch swatch_pr_item bg_css_black " data-escape="Black"><span className="tt_txt">Black</span><span className="swatch__value_pr pr bg_color_black lazyloadt4sed"></span></li>
                                                <li data-swatch-itemt4="" data-index="2" data-value="royal-blue" className="ttip_nt tooltip_top nt-swatch swatch_pr_item bg_css_royal-blue " data-escape="Royal Blue"><span className="tt_txt">Royal Blue</span><span className="swatch__value_pr pr bg_color_royal-blue lazyloadt4sed"></span></li>
                                                <li data-swatch-itemt4="" data-index="3" data-value="red" className="ttip_nt tooltip_top nt-swatch swatch_pr_item bg_css_red " data-escape="Red"><span className="tt_txt">Red</span><span className="swatch__value_pr pr bg_color_red lazyloadt4sed"></span></li>
                                            </ul>
                                        </div>
                                        <div data-opname="size" className="nt_select_qs1 swatch is-label is-size" id="nt_select_qs_1">
                                            <h4 className="swatch__title"><span>Size: <span className="nt_name_current user_choose_js">2 years</span></span></h4>
                                            <ul className="swatches-select swatch__list_pr" data-id="1" data-size="2">
                                                <li data-swatch-itemt4="" data-index="0" data-value="2-years" className="nt-swatch swatch_pr_item pr bg_css_2-years is-selected" data-escape="2 years"><span className="swatch__value_pr">2 years</span></li>
                                                <li data-swatch-itemt4="" data-index="1" data-value="4-years" className="nt-swatch swatch_pr_item pr bg_css_4-years " data-escape="4 years"><span className="swatch__value_pr">4 years</span></li>
                                                <li data-swatch-itemt4="" data-index="2" data-value="6-years" className="nt-swatch swatch_pr_item pr bg_css_6-years " data-escape="6 years"><span className="swatch__value_pr">6 years</span></li>
                                                <li data-swatch-itemt4="" data-index="3" data-value="8-years" className="nt-swatch swatch_pr_item pr bg_css_8-years " data-escape="8 years"><span className="swatch__value_pr">8 years</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="variations_button in_flex column w__100">
                                        <div className="flex al_center column">
                                            <div className="quantity pr mb__15 order-1 qty__" id="sp_qty_qs" style={{display:'inline-block'}}>
                                                <input type="number" className="input-text qty tc qty_pr_js" step="1" min="1" max="100" name="quantity" value="1" size="4" pattern="[0-9]*" inputmode="numeric"/>
                                                <div className="qty tc fs__14" max="100" value="1"><button type="button" className="plus db cb pa pd__0 pr__15 tr r__0"><i className="facl facl-plus"></i></button><button type="button" className="minus db cb pa pd__0 pl__15 tl l__0"><i className="facl facl-minus"></i></button></div>
                                            </div>
                                            <a rel="nofollow" data-no-instant="" href="#" className="single_stt out_stock button pe_none order-2" id="out_stock_qs" style={{display:'none'}}>Out of stock</a>
                                            <button type="submit" className="single_add_to_cart_button button truncate js_frm_cart w__100 order-4"style={{display:'inline-block'}}>
                                                <span className="txt_add ">Add to cart</span><span className="txt_pre dn" style={{display:'none'}}>Pre-order</span>
                                            </button>
                                        </div>
                                        <div data-shopify="payment-button" data-has-selling-plan="false" data-has-fixed-selling-plan="false" className="shopify-payment-button" style={{display:'inline-block'}}>
                                                <div>
                                                    <button type="button" className="shopify-payment-button__button shopify-payment-button__button--unbranded BUz42FHpSPncCPJ4Pr_f jjzYeefyWpPZLH9pIgyw RWJ0IfBjxIhflh4AIrUw" data-testid="Checkout-button">Buy it now</button>
                                                </div>
                                                </div>
                                    </div>
                                    </form>
                                </div>
                            </div>
                            <a href="/collections/trending/products/snack-monster-funny-kids-tshirt" className="btn fwsb detail_link dib mt__15">View full details <i className="facl facl-right"></i></a>
                        </div>
                        </div>
                        <button title="Close (Esc)" type="button" className="mfp-close">×</button>
                    </div>
                </div>
                <div className="mfp-preloader">Loading...</div>
            </div>
            </div>

            
    </>
  )
}

export default QuickShopModal