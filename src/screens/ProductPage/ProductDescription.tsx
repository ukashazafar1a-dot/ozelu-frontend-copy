"use client";
import React, { useRef, useEffect, useState, useContext } from "react";
import "./styleProductPage.css";
import Counter from "../../components/EComereceStore/Counter";
import VariantSnippet from "./VariantSnippet";
import ImageGallery from "./ImageGallery";
import { useCart } from "../../components/CustomUseCart";
import AppContext from "../../store/AppContext";
import CGCUploadFile from "./components/CGCUploadFile";
import Link from "next/link";
import useApp from "@/store/useApp";
import {
  getSignedUrl,
  removeFile,
  uploadFileToS3,
} from "@/helpers/apiRequests";
import { trackFileUploaded } from "@/helpers/checkoutActivity";
import { useQueryParams } from "@/hooks/useQueryParams";

const ProductDescription = ({ product }: any) => {
  const { addItem } = useCart();
  const { getQueryParam, setQueryParam } = useQueryParams();
  const { setCartOpened, sessionId } = useApp();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [line_items, setLineItems] = useState<any>([]);
  const [uploadProgress, setUploadProgress] = useState<any>({});
  const [line_items_pics, setLineItemsPics] = useState<any>([]);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);

  function onLineItemChange(e: any) {
    setLineItems({ ...line_items, [e.target.name]: e.target.value });
  }

  function checkFilesValid(lineitemspics: any) {
    let isValid = true;
    const files = lineitemspics.map((pic: any) => {
      if (pic.size > 10 * 1024 * 1024) {
        isValid = false;
        return Object.assign(pic, {
          valid: false,
        });
      } else {
        return Object.assign(pic, {
          valid: true,
        });
      }
    });

    setLineItemsPics(files);
    setIsInvalid(!isValid);
  }

  async function uploadFile(file: any) {
    try {
      const { uploadUrl, key }: any = await getSignedUrl(file, sessionId);
      await uploadFileToS3(file, uploadUrl, (progress: any) => {
        setUploadProgress((prev: any) => ({
          ...prev,
          [file?.localId]: progress,
        }));
      });
      let publicUrl = uploadUrl.split("?")[0];
      file = Object.assign(file, { key, url: publicUrl });

      if (key) {
        trackFileUploaded({
          sessionId,
          orderType: "STORE_PRODUCT",
          pagePath: typeof window !== "undefined" ? window.location.pathname : "",
          file: { key, name: file.name, size: file.size, type: file.type },
        });
      }

      let allFiles = line_items_pics;
      const index = allFiles.findIndex((f: any) => f.field === file.field);
      // console.log("Index",index,file.field,allFiles)
      if (index !== -1) {
        // console.log("All Files",allFiles)
        setLineItemsPics((prev: any) =>
          prev.map((f: any) => {
            if (f.field === file.field) return file;
            return f;
          })
        );
      } else {
        setLineItemsPics((prev: any) => [...prev, file]);
      }
    } catch (error) {
      console.error(error);
      let allFiles = line_items_pics;
      const index = allFiles.findIndex((f: any) => f.field === file.field);
      if (index !== -1) {
        file = Object.assign(file, { valid: false });
        allFiles[index] = file;
        setLineItemsPics(allFiles);
      }
    }
  }

  async function onLineItemPicsChange(e: any) {
    let file = e.target.files[0];

    const localId = crypto.randomUUID().substring(0, 7);
    file = Object.assign(file, {
      id: selectedVariant ? selectedVariant._id : product._id,
      localId,
      field: e.target.name,
    });
    let allFiles = line_items_pics;
    const index = allFiles.findIndex(
      (file: any) => file.field === e.target.name
    );
    // console.log(index,allFiles)
    // if (index !== -1) {
    //   allFiles[index] = file;
    //   setLineItemsPics(allFiles);
    //   // checkFilesValid(allFiles);
    // } else {
    //   setLineItemsPics([...line_items_pics, file]);
    //   // checkFilesValid([...line_items_pics, file]);
    // }

    await uploadFile(file);

    setLineItems({ ...line_items, [e.target.name]: file.name });
  }

  async function onLineItemPicRemove(e: any) {
    let file = e.target.files[0];

    await removeFile(file.key, sessionId);
    // console.log("AAA",line_items_pics,file)
    let allFiles = line_items_pics;
    const index = allFiles.findIndex((f: any) => f.localId === file.localId);

    allFiles = allFiles.filter((f: any) => f.localId !== file.localId);

    // console.log("All Files>>>>",allFiles,index)
    setLineItemsPics(allFiles);
  }

  function changeVariant(option1: any, option2: any, option3: any) {
    //console.log("Changing variant to", option1, option2, option3);
    let variantIs = product?.variants.find((varinat: any) => {
      return (
        varinat?.option1 == option1 &&
        varinat?.option2 == option2 &&
        varinat?.option3 == option3
      );
    });
    //console.log("Selected variant is", variantIs);
    setSelectedVariant(variantIs);
    setIsChanged(true);
    //setQueryParam("variant", variantIs?._id);
  }

  function handleAddToCart(e: any) {
    e.preventDefault();
    let obj: any = {};
    if (!selectedVariant) return;
    obj.id = selectedVariant._id;
    obj.title = product?.title;
    obj.title_option = selectedVariant.title;
    obj.price = selectedVariant.price;
    obj.compare_at_price = selectedVariant.compare_at_price;
    obj.sku = selectedVariant.sku;
    obj.type = "variant";
    obj.image = product?.images ? product?.images[0] : {};
    obj.properties = line_items;
    obj.line_items_pics = line_items_pics;
    obj.last_updated = new Date();
    addItem(obj, quantity);
    setLineItems([]);
    setLineItemsPics([]);
    setCartOpened(true);
  }

  function renderFreeBenefit() {
    let testState = /benefit::delivery::time/g;
    let freetag = product?.tags.find((tag: any) => {
      if (testState.test(tag)) {
        return tag;
      }
    });
    if (product?.tags.includes("benefit::delivery") && freetag) {
      return (
        <div className="BenefitItem">
          <div className="BenefitItem__Icon">
            <img
              src={"/images/ecomerece/fast-delivery.png"}
              alt=""
              loading="lazy"
            />
          </div>
          <span className="BenefitItem__Text">
            Delivery within {freetag.split("::").pop()} Hours
          </span>
        </div>
      );
    }
  }

  useEffect(() => {
    //console.log(product);
    setSelectedVariant(product?.variants[0]);
  }, [product]);
  //console.log(selectedVariant);
  return (
    <div>
      <div className="ecomerece-services_wrapper wrapper__product-page">
        <div className="sp-single sp-single-1 des_pr_layout_1 mb__60">
          <div className="bgbl pt__20 pb__20 lh__1 breadcrumb_pr_wrap">
            <div className="container">
              <div className="row al_center">
                <div className="col">
                  <nav className="sp-breadcrumb">
                    <a href="/" className="dib">
                      Home
                    </a>

                    {product?.collection && (
                      <>
                        <i className="fa fa-angle-right mx-2"></i>
                        <Link
                          href={"/collections/" + product?.collection?.slug}
                        >
                          {product?.collection?.title}
                        </Link>
                      </>
                    )}
                    <i className="fa fa-angle-right"></i>
                    {product?.title}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container container_cat cat_default">
          <div className="row product mt__40">
            <div className="col-md-12 col-12 thumb_left">
              <div className="row mb__50 pr_sticky_content">
                <div className="col-md-6 col-12 pr product-images img_action_zoom pr_sticky_img">
                  <ImageGallery
                    medias={product?.images}
                    selectedVariant={selectedVariant}
                    isChanged={isChanged}
                  />
                </div>

                <div className="col-md-6 col-12 product-infors pr_sticky_su">
                  <div className="theiaStickySidebar">
                    <div
                      id="shopify-section-pr_summary"
                      className="shopify-section summary entry-summary mt__30"
                    >
                      <h1 className="product_title entry-title h2">
                        {product?.title}
                      </h1>
                      <div className="flex wrap fl_between al_center price-review">
                        {selectedVariant ? (
                          selectedVariant.compare_at_price >
                          selectedVariant.price ? (
                            <p className="price_range">
                              <del>AED {selectedVariant.compare_at_price}</del>
                              <ins>AED {selectedVariant.price}</ins>
                            </p>
                          ) : (
                            <p className="price_range">
                              AED {selectedVariant.price}
                            </p>
                          )
                        ) : product?.compare_at_price > product?.price ? (
                          <p className="price_range">
                            <del>AED {product?.compare_at_price}</del>
                            <ins>AED {product?.price}</ins>
                          </p>
                        ) : (
                          <p className="price_range">AED {product?.price}</p>
                        )}
                        <a href="#tab_pr_reivew" className="rating_sp_kl dib">
                          <span className="shopify-product-reviews-badge"></span>
                        </a>
                      </div>
                      <div className="product__policies rte cb"></div>
                      {/* <div className="pr_short_des rtet4">
                      <p className="mg__0">
                        "Not today. Or tomorrow. Or even next week. Feeling
                        Lazy? This design will support your Nopeness for as long
                        as you need." &nbsp; &nbsp; &nbsp;...
                      </p>
                    </div> */}
                      <div className="btn-atc atc-slide btn_full_false PR_no_pick_false btn_des_1 btn_txt_3">
                        <div className="nt_natural-beige nt1_38x42-cm nt2_">
                          <form className="nt_cart_form variations_form variations_form_ppr">
                            <input
                              type="hidden"
                              name="form_type"
                              value="product"
                            />
                            <input type="hidden" name="utf8" value="✓" />
                            <div></div>
                            <VariantSnippet
                              product={product}
                              selectedVariant={selectedVariant}
                              changeVariant={changeVariant}
                            />
                            <div className="nt_pr_js lazypreloadt4s op__0 lazyloadt4sed">
                              <script type="application/json">[]</script>
                              <script type="application/json"></script>
                            </div>
                            {/* New By RA */}
                            <CGCUploadFile
                              product={product}
                              line_items_pics={line_items_pics}
                              handleLineItemChange={onLineItemChange}
                              handleLineItemPicsChange={onLineItemPicsChange}
                              uploadProgress={uploadProgress}
                              onLineItemPicRemove={onLineItemPicRemove}
                            />
                            {/* New By RA Ends Here */}
                            <div className="variations_button in_flex column w__100 buy_qv_true">
                              <div className="flex">
                                {selectedVariant?.quantity > 0 && (
                                  <Counter
                                    quantity={quantity}
                                    setQuantity={setQuantity}
                                  />
                                )}
                                <button
                                  type="submit"
                                  data-time="6000"
                                  data-ani="shake"
                                  className={
                                    "single_add_to_cart_button button truncate js_frm_cart w__100 order-4 animated shake" +
                                    (selectedVariant?.quantity < 1
                                      ? " out_stock"
                                      : "")
                                  }
                                  onClick={handleAddToCart}
                                  disabled={isInvalid}
                                >
                                  <span className="txt_add ">
                                    {selectedVariant?.quantity > 0
                                      ? "Add to cart"
                                      : "Out Of Stock"}
                                  </span>
                                </button>
                              </div>
                              {/* <div
                              data-shopify="payment-button"
                              data-has-selling-plan="false"
                              data-has-fixed-selling-plan="false"
                              className="shopify-payment-button"
                            >
                              <div>
                                <div>
                                  <div>
                                    <button
                                      type="button"
                                      className="shopify-payment-button__button shopify-payment-button__button--unbranded BUz42FHpSPncCPJ4Pr_f jjzYeefyWpPZLH9pIgyw RWJ0IfBjxIhflh4AIrUw"
                                      data-testid="Checkout-button"
                                    >
                                      Buy it now
                                    </button>
                                    <button
                                      aria-disabled="true"
                                      aria-hidden="true"
                                      className="shopify-payment-button__more-options BUz42FHpSPncCPJ4Pr_f shopify-payment-button__button--hidden"
                                      type="button"
                                      data-testid="sheet-open-button"
                                    >
                                      More payment options
                                    </button>
                                    <div>
                                      <div></div>
                                    </div>
                                    <div></div>
                                  </div>
                                </div>
                              </div>
                            </div> */}
                            </div>
                          </form>
                          <div className="product--block mt-4">
                            <div className="tab-icon-wrapper">
                              {renderFreeBenefit()}
                              {product?.tags.includes(
                                "benefit::sameDayDelivery"
                              ) && (
                                <div className="BenefitItem">
                                  <div className="BenefitItem__Icon">
                                    <img
                                      src={"/images/ecomerece/same-day.png"}
                                      alt=""
                                      loading="lazy"
                                    />
                                  </div>
                                  <span className="BenefitItem__Text">
                                    Same Day Delivery
                                  </span>
                                </div>
                              )}
                              {product?.tags.includes(
                                "benefit::freeDelivery"
                              ) && (
                                <div className="BenefitItem">
                                  <div className="BenefitItem__Icon">
                                    <img
                                      src={
                                        "/images/ecomerece/free-shipping.png"
                                      }
                                      alt=""
                                      loading="lazy"
                                    />
                                  </div>
                                  <span className="BenefitItem__Text">
                                    Free Delivery
                                  </span>
                                </div>
                              )}
                              {product?.tags.includes("benefit::secured") && (
                                <div className="BenefitItem">
                                  <div className="BenefitItem__Icon">
                                    <img
                                      src={"/images/ecomerece/credit-card.png"}
                                      alt=""
                                      loading="lazy"
                                    />
                                  </div>
                                  <span className="BenefitItem__Text">
                                    Secured Payments
                                  </span>
                                </div>
                              )}
                              {product?.tags?.includes("benefit::authentic") && (
                                <div className="BenefitItem">
                                  <div className="BenefitItem__Icon">
                                    <img
                                      src={"/images/ecomerece/authentic.png"}
                                      alt=""
                                      loading="lazy"
                                    />
                                  </div>
                                  <span className="BenefitItem__Text">
                                    100% Authentic
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
