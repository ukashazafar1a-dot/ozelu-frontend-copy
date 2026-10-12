import React from "react";
import Link from "next/link";

function CollectionCard({ collection }) {
  function renderImage() {
    if (collection?.featured_image) {
      let media = collection?.featured_image;
      return (
        <div
          className="lazyload pr_lazy_img main-img nt_img_ratio lazyloadt4sed"
          data-ratio={media?.ratio}
          // style={{ backgroundImage: `url(${media?.src})` }}
          data-bg={media?.src}
        >
          <span></span>
        </div>
      );
    } else {
      return (
        <div
          className="pr_lazy_img main-img nt_img_ratio lazyloadt4sed"
          data-parent-fit="width"
          data-wiis=""
          data-ratio="0.6732117812061711"
          style={{
            backgroundImage: `url(https://ozelu.s3.eu-north-1.amazonaws.com/Assets/placeholder-image.png)`,
          }}
        >
          <span></span>
        </div>
      );
    }
  }
  return (
    <div className={" w-100"}>
      <div className="collection-inner pr">
        <div className="collection-image pr oh lazyloadt4sed testing-card">
          <span className="tc nt_labels pa pe_none cw"></span>
          <Link className="db" href={"/collections/" + collection.slug} title={collection?.title}>
            {/* <div className='bg-circle'></div> */}
            {renderImage()}
          </Link>
        </div>
        <div className="collection-info">
          <div className="collection-info__inner">
            <h3 className="collection-title pr mg__0 text-center">
              <Link className="cd chp" href={"/collections/" + collection.slug} title={collection?.title}>
                {collection.title}
              </Link>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionCard;
