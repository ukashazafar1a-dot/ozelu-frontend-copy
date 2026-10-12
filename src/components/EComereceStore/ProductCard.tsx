"use client";
import React, { useContext, useEffect, useState } from "react";
import slugify from "slugify";
import { useCart } from "react-use-cart";
import "./ProductCard.scss";
import AppContext from "../../store/AppContext";
import Link from "next/link";
import _ from 'lodash';
import { returnImage } from "@/helpers/generals";

const posColors = ["color", "colors", "colour", "colours"];
const posSizes = ["size", "sizes"];

interface IProductCard {
  sizeD?: any;
  sizeT?: any;
  sizeM?: any;
  product: any;
}

function ProductCard({ sizeD, sizeT, sizeM, product }: IProductCard) {
  const { addItem } = useCart();
  const { setCartOpened } = useContext(AppContext);
  const [sizeClasses, setSizeClasses] = useState("");
  const [variant,setVariant] = useState<any>({});
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  function handleAddToCart(e: any) {
    e.preventDefault();
    if(_.isEmpty(variant)) return;
    let obj: any = {};
    obj.id = variant?._id;
    obj.title = product?.title;
    obj.title_option = variant?.title;
    obj.price = variant?.price;
    obj.compare_at_price = variant?.compare_at_price;
    obj.sku = variant?.sku;
    obj.type = "variant";
    obj.image = product?.images ? product?.images[0] : {};
    obj.last_updated = new Date();
    addItem(obj, 1);
    setCartOpened(true);
  }

  function renderImage(product: any) {
    let media = null;
    if(product?.images && product?.images[0]){
      media = product.images.find((img:any)=>img.position === 1);
      if(!media) media = product.images[0]
    }
    if (media) {
      return (
        <Link className="db" href={"/products/" + product?.slug}>
          <div className="product-image---wrapper">
            {returnImage(media,'product--image',460)}
          </div>
        </Link>
      );
    } else {
      return (
        <Link className="db" href={"/products/" + product?.slug}>
          <div className="product-image---wrapper">
            <img
              src="https://ozelu.s3.eu-north-1.amazonaws.com/Assets/placeholder-image.png"
              alt="Placeholder - Ozelu"
              loading="lazy"
            />
          </div>
        </Link>
      );
    }
  }

  useEffect(() => {
    let classes =
      "desgin__1 got_offset done nt_pr product pr_list_item pr_animated mt-5 pr_grid_item swatch_style_rounded swatch_list_size_small";
    switch (sizeD) {
      case 2:
        classes += " col-lg-6";
        break;
      case 3:
        classes += " col-lg-4";
        break;
      case 4:
        classes += " col-lg-3";
        break;
      case 5:
        classes += " col-lg-15";
        break;
      case 6:
        classes += " col-lg-2";
        break;
    }
    switch (sizeT) {
      case 2:
        classes += " col-md-6";
        break;
      case 3:
        classes += " col-md-4";
        break;
      case 4:
        classes += " col-md-3";
        break;
    }
    switch (sizeM) {
      case 1:
        classes += " col-12";
        break;
      case 2:
        classes += " col-6";
        break;
    }
    setSizeClasses(classes);
  }, [sizeD, sizeM, sizeT]);

  useEffect(() => {
    product?.options?.map((option: any) => {
      if (posColors?.includes(option?.name.toLowerCase())) {
        setColors(option?.values);
      } else if (posSizes?.includes(option?.name.toLowerCase())) {
        setSizes(option?.values);
      }
    });
    //console.log("variant",product.variants[0])
    if(product?.variants && product?.variants[0]) setVariant(product.variants[0])
  }, [product]);

  return (
    <div
      className={
        sizeClasses
          ? sizeClasses
          : "col-lg-3 col-md-3" + " w-100 overflow-hidden"
      }
    >
      <div className="product-inner position-relative">
        <div className="product-image pr oh lazyloadt4sed">
        <div className="product-badge">
          <span className="badge-item badge-sale d-none">-10%</span>
          {variant.quantity < 1 && <span className="badge-item badge-soldout">Sold out</span>}
        </div>
          <span className="tc nt_labels pa pe_none cw"></span>
          {renderImage(product)}
          {/* <div className="nt_add_w ts__03 pa d-none">
                    <a href="/collections/children/products/apologize-in-advance-funny-kids-tshirt" data-no-instant="" data-id="7686034489564" className="wishlistadd cb chp ttip_nt tooltip_right" rel="nofollow">
                        <span className="tt_txt">Add to Wishlist</span><i className="facl facl-heart-o"></i>
                    </a>
                </div> */}
          <div className="hover_button op__0 tc pa flex column ts__03 des_btns_pr_1 has_sizelistt4_true has_2btnst4_pr">
            {/* <a className="pr nt_add_qv js_add_qv cd br__40 pl__25 pr__25 bgw tc dib ttip_nt tooltip_top_left" href="/collections/children/products/apologize-in-advance-funny-kids-tshirt" data-id="7686034489564" rel="nofollow">
                        <span className="tt_txt">Quick view</span><i className="iccl iccl-eye"></i><span>Quick view</span>
                    </a> */}
            {variant.quantity > 0 && <a
              href="#"
              onClick={handleAddToCart}
              className="pr pr_atc cd br__40 bgw tc dib js__qs cb chp ttip_nt tooltip_top_left"
            >
              <span className="tt_txt">Add To Cart</span>
              <i className="fa fa-cart-shopping"></i>
              <span>Add To Cart</span>
            </a>}
          </div>
          {sizes && (
            <div className="product-attr pa ts__03 cw op__0 tc pe_none">
              <p className="truncate mg__0 w__100">
                {sizes.map((size: any, i: any) => {
                  if (i == 0) return size;
                  return ", " + size;
                })}
              </p>
            </div>
          )}
        </div>
        <div className="product-info mt-3 overflow-hidden">
          <div className="product-info__inner">
            <h3 className="product-title pr fs__14 mg__0 fwm">
              <Link className="cd chp" href={`/products/${product.slug}`}>
                {product.title}
              </Link>
            </h3>
            {variant?.compare_at_price > variant?.price ? (
              <span className="price dib mb__5">
                <del>AED {variant?.compare_at_price}</del>
                <ins>AED {variant?.price}</ins>
              </span>
            ) : (
              <span className="price dib mb__5">AED {variant?.price}</span>
            )}

            <div className="rte dn">
              <p className="mb-5">
                &ldquo;It&lsquo;s never too early to start mastering the art of
                apologizing! Start them young with this clever Tshirt.&ldquo;
                Additional Information: Our Punny Tshirts are made of 100%
                Premium Soft Cotton...
              </p>
            </div>
            <div
              className="shopify-product-reviews-badge star-rating"
              data-id="7686034489564"
            ></div>
            {colors && (
              <div className="swatch__list_js swatch__list lh__1 nt_swatches_on_grid lazyloadt4sed">
                {colors.map((color: any, i: any) => {
                  return (
                    <span
                      key={i}
                      className="swatch__list--item pr ttip_nt tooltip_top_right"
                    >
                      <span className="tt_txt">{color}</span>
                      <span
                        className={`swatch__value bg_color_${slugify(
                          color.toLowerCase()
                        )} lazyloadt4sed`}
                      ></span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="product-info__btns flex column mt__20">
            <a
              className="pr nt_add_qv js_add_qv cd br__40 pl__25 pr__25 bgw tc dib ttip_nt_"
              href="/collections/children/products/apologize-in-advance-funny-kids-tshirt"
              data-id="7686034489564"
              rel="nofollow"
            >
              <span className="tt_txt">Quick view</span>
              <i className="fa fa-eye"></i>
              <span>Quick view</span>
            </a>
            <a
              href="/collections/children/products/apologize-in-advance-funny-kids-tshirt"
              data-id="7686034489564"
              className="pr pr_atc cd br__40 bgw tc dib js__qs cb chp ttip_nt_"
              rel="nofollow"
            >
              <span className="tt_txt">Quick Shop</span>
              <i className="fa fa-cart"></i>
              <span>Quick Shop</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
