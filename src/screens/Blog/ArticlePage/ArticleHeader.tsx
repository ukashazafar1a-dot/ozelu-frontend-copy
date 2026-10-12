"use client";
import { dateFormatter, htmlDecode, returnImage } from "@/helpers/generals";
import Link from "next/link";
import React from "react";
import ArticleShare from "./ArticleShare";

const ArticleHeader = ({ article }: any) => {
  //console.log(article)
  if (article) {
    return (
      <div className="d-flex justify-content-start flex-column">
        <div className="article--header w-100">
          <div className="h3 mb-2 fw-normal">{article?.category?.title}</div>
          <h1 className="h1 fw-bold pb-2">{article?.title}</h1>
          <div className="d-flex justify-content-start align-items-center gap-3 mb-3">
            <img
              src="http://res.cloudinary.com/dvk4zgeh4/image/upload/v1704809970/assets/ozelu-logo-transparent.png"
              style={{ width: "50px" }}
              alt="Auther icon"
              className=""
              loading="lazy"
              width=""
              height=""
            />
            <div className="author-block">
              <p className="fw-bold m-0">{article?.author}</p>
              <p className="m-0">
                {" "}
                {dateFormatter(article?.posted_on)} - {article?.read_time} Min
                Read
              </p>
            </div>
          </div>
        </div>
        <div className="image_wrapper mt-5 d-flex justify-content-center align-items-center bg-faq">
          {returnImage(article?.featured_image)}
        </div>
        <div className="article-content my-5">
          {article?.body_html ? (
            <>
              <div
                className="rte rte-settings"
                dangerouslySetInnerHTML={{
                  __html: htmlDecode(article?.body_html),
                }}
              />
            </>
          ) : (
            <div
              className="rte rte-settings"
              dangerouslySetInnerHTML={{ __html: htmlDecode(article?.excerpt) }}
            />
          )}
        </div>
        <ArticleShare article={article}/>
        <div className="text-center d-flex align-items-center justify-content-center ">
          <Link href={"/blog"} className="btn--primary-new">
            <i className="fa-solid fa-arrow-left mr-2"></i>
            <span>Back to Blogs</span>
          </Link>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default ArticleHeader;
