"use client";
import React, { useRef, useEffect } from "react";
import Drift from "drift-zoom";
import "drift-zoom/src/css/drift-basic.css";
import { Variant, Image } from "@/libs/types";

type props = {
  medias: Image[] | null;
  selectedVariant: Variant | null;
  isChanged?: boolean;
};
function ImageGallery({ medias, selectedVariant, isChanged }: props) {
  const carousel = useRef(null);
  const navCarousel = useRef(null);
  const getSafeAspectRatio = (ratio: any) => {
    const numericRatio = Number(ratio);
    return Number.isFinite(numericRatio) && numericRatio > 0 ? numericRatio : 1;
  };

  async function initFlickity() {
    if (
      typeof window.Flickity !== "undefined" &&
      carousel.current &&
      navCarousel.current
    ) {
      if (!medias || medias.length === 0) return;
      const main = new window.Flickity(carousel.current, {
        initialIndex: ".media_id_" + medias[0]._id,
        fade: false,
        draggable: ">1",
        cellSelector: ".p-item:not(.is_varhide)",
        cellAlign: "center",
        wrapAround: true,
        autoPlay: false,
        prevNextButtons: false,
        adaptiveHeight: true,
        imagesLoaded: false,
        lazyLoad: 0,
        dragThreshold: 6,
        pageDots: false,
        rightToLeft: false,
      });

      new window.Flickity(navCarousel.current, {
        initialIndex: ".media_id_" + medias[0]._id,
        cellSelector: ".n-item:not(.is_varhide)",
        cellAlign: "left",
        asNavFor: ".p-thumb",
        wrapAround: true,
        draggable: ">1",
        autoPlay: 0,
        prevNextButtons: false,
        percentPosition: 1,
        imagesLoaded: 0,
        pageDots: 0,
        groupCells: true,
        rightToLeft: false,
        contain: 1,
        freeScroll: 0,
      });
    }
  }

  useEffect(() => {
    if (!medias || !medias?.length) return;
    initFlickity();
  }, [medias]);

  useEffect(() => {
    if (!medias?.length) return;
    setTimeout(() => {
      const paneContainer: any = document.querySelector(".dt_img_zoom");
      const demoTrigger: any = document.querySelectorAll(".img_ptw");
      [...demoTrigger].forEach((img) => {
        new Drift(img, {
          showWhitespaceAtEdges: false,
          paneContainer: paneContainer,
          inlinePane: 0,
          containInline: true,
          hoverBoundingBox: true,
          zoomFactor: 3,
          inlineOffsetX: 0,
          inlineOffsetY: 0,
        });
      });
    }, 2000);
  }, [medias]);

  useEffect(() => {
    if (isChanged && selectedVariant) {
      const mediaId = selectedVariant?.featured_image?._id;
      if (carousel.current && navCarousel.current && mediaId) {
        const flktyMain = window.Flickity.data(carousel.current);
        flktyMain.selectCell(`.media_id_${mediaId}`);
        const flktyNav = window.Flickity.data(navCarousel.current);
        flktyNav.selectCell(`.media_id_${mediaId}`);
      }
    }
  }, [selectedVariant, isChanged]);

  if (medias?.length === 0) {
    return (
      <>
        <div className="row theiaStickySidebar">
          <div className="col-12 col-lg col_thumb   rf--slider">
            {/* <img id="image-id" src={medias[0].src} data-width={medias[0].width} data-height={medias[0].height} loading="lazy" alt="I do what I want Rebel Cat - Funny Phone Cover"/> */}
            <div className="p-thumb fade_flick_1 p-thumb_ppr images sp-pr-gallery equal_nt nt_contain ratio_imgtrue position_2 nt_slider pr_carousel flickity-enabled is-draggable">
              <div
                className={`img_ptw p_ptw js-sl-item p-item sp-pr-gallery__img w__100 nt_bg_lz lazyloadt4sed is-selected`}
                style={{
                  position: "absolute",
                  paddingTop: 60 + "%",
                  backgroundImage: `url(//cdn.shopify.com/shopifycloud/shopify/assets/no-image-50-3d8cc48bd078edcd544c8d60f929ed2d8800a3fc52e0f602e84b1767e392bfcd_1728x.gif)`,
                }}
              >
                <noscript>
                  <img
                    src="//cdn.shopify.com/s/files/1/0613/5758/8700/products/Phone-Covers-Coffee-spill-Rebel-Cat-Mockup-1.png?v=1654378902"
                    loading="lazy"
                    alt="I do what I want Rebel Cat - Funny Phone Cover"
                  />
                </noscript>
              </div>
            </div>
            <span className="tc nt_labels pa pe_none cw"></span>
            <div className="p_group_btns pa flex">
              <button className="br__40 tc flex al_center fl_center bghp_ show_btn_pr_gallery ttip_nt tooltip_top_left">
                <i className="fa fa-expand-arrows-alt"></i>
                <span className="tt_txt">Click to enlarge</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="row theiaStickySidebar">
        <div className="col-12 col-lg col_thumb   rf--slider">
          {/* <img id="image-id" src={medias[0].src} data-width={medias[0].width} data-height={medias[0].height} loading="lazy" alt="I do what I want Rebel Cat - Funny Phone Cover"/> */}
          <div
            ref={carousel}
            className="p-thumb fade_flick_1 p-thumb_ppr images sp-pr-gallery equal_nt nt_contain ratio_imgtrue position_2 nt_slider pr_carousel flickity-enabled is-draggable"
          >
            {medias?.map((media: any) => {
              const safeRatio = getSafeAspectRatio(media?.aspect_ratio);
              // return  <img id={media._id} className={`img_ptw p_ptw js-sl-item p-item sp-pr-gallery__img w__100 nt_bg_lz media_id_${media._id} lazyloadt4sed is-selected`} data-mdid={media._id}
              // src={media.src} data-zoom={media.src} data-src={media.src} data-width={media.width} data-height={media.height} />
              return (
                <div
                  key={media?._id}
                  id={media?._id}
                  className={`img_ptw p_ptw js-sl-item p-item sp-pr-gallery__img w__100 nt_bg_lz media_id_${media._id} lazyloadt4sed is-selected`}
                  data-mdid={media?._id}
                  style={{
                    position: "absolute",
                    paddingTop: (1 / safeRatio) * 100 + "%",
                    backgroundImage: `url(${media?.src})`,
                  }}
                  data-zoom={media.src}
                  data-src={media?.src}
                  data-alt={media?.alt}
                  data-width={media?.width}
                  data-height={media?.height}
                  data-media-id={media?._id}
                >
                  <noscript>
                    <img
                      src="//cdn.shopify.com/s/files/1/0613/5758/8700/products/Phone-Covers-Coffee-spill-Rebel-Cat-Mockup-1.png?v=1654378902"
                      loading="lazy"
                      alt="I do what I want Rebel Cat - Funny Phone Cover"
                    />
                  </noscript>
                </div>
              );
            })}
          </div>
          <span className="tc nt_labels pa pe_none cw"></span>
          <div className="p_group_btns pa flex">
            <button className="br__40 tc flex al_center fl_center bghp_ show_btn_pr_gallery ttip_nt tooltip_top_left">
              <i className="fa fa-expand-arrows-alt"></i>
              <span className="tt_txt">Click to enlarge</span>
            </button>
          </div>
        </div>
        <div className="dt_img_zoom pa t__0 r__0 dib"></div>
        <div className="col-12 col-lg-auto col_nav nav_medium">
          <div
            ref={navCarousel}
            className="p-nav ratio_imgtrue row equal_nt nt_cover position_8 nt_slider pr_carousel flickity-enabled is-draggable p-nav-ready"
          >
            {medias?.map((media: any) => {
              const safeRatio = getSafeAspectRatio(media?.aspect_ratio);
              return (
                <div
                  key={media._id}
                  data-media-id={media._id}
                  className="col-lg-12 col-3 n-item js-sl-item is-nav-selected"
                >
                  <span
                    className="nt_bg_lz lazyloadt4sed"
                    style={{
                      paddingTop: (1 / safeRatio) * 100 + "%",
                      backgroundImage: `url(${media.src})`,
                    }}
                    data-alt={media?.alt}
                  >
                    <i className="hide"></i>
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Previous"
            className="btn_pnav_prev pe_none"
          >
            <i className="fa fa-angle-left"></i>
          </button>
          <button
            type="button"
            aria-label="Next"
            className="btn_pnav_next pe_none"
          >
            <i className="fa fa-angle-right"></i>
          </button>
        </div>
      </div>
    </>
  );
}

export default ImageGallery;
