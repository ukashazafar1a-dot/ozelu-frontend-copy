"use client";
import { dateFormatter, htmlDecode, returnImage } from "@/helpers/generals";
import Link from "next/link";
import React from "react";

const ArticleCard = ({ article, index }: any) => {
  //console.log(article);
  if (article) {
    return (
      <article className={`p-2 m-0 article-item item-${index}`}>
        <Link href={`/blog/${article?.category?.slug}/${article?.slug}`}>
          <div className="card border-0">
            <div className="d-flex align-items-center justify-content-center">
              {returnImage(article?.featured_image, "article-image")}
            </div>
            <div className="card-body px-0 py-md-3 pt-3 pb-0 text-break">
              <p className="card-text mb-2 text-capitalize category--title">
                {article?.category?.title}
              </p>
              <h5 className="card-title fw-bold h2 text-break two-lines">
                {article?.title}
              </h5>
              {article?.excerpt ? (
                <div
                  className="rte rte-settings two-lines mb-2"
                  dangerouslySetInnerHTML={{
                    __html: htmlDecode(article?.excerpt),
                  }}
                />
              ) : (
                <div
                  className="rte rte-settings two-lines mb-2"
                  dangerouslySetInnerHTML={{
                    __html: htmlDecode(article?.body_html),
                  }}
                />
              )}
              <div className="readmore-link">
                <p className="font-simple mb-2">
                  <span className="mr-2 fw-medium">Read More</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </p>
              </div>
              <p className="card-text mt-1">
                <span className="mr-2 text-grey">
                  <span className="author--title">
                    {article?.author ? article?.author : "Demo Print Shop"}
                  </span>
                  {" on " +
                    dateFormatter(article?.posted_on) +
                    " - " +
                    article?.read_time +
                    " Min Read"}
                </span>
              </p>
            </div>
          </div>
        </Link>
      </article>
    );
  } else {
    return <></>;
  }
};

export default ArticleCard;
