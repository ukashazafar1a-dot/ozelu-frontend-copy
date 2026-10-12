"use client";
import { htmlDecode, scrollToTop } from "@/helpers/generals";
import Link from "next/link";
import React from "react";
import ReqTable from "./ReqTable";

const PageContent = ({ section }: any) => {
  return (
    <section className="d-block container">
      <div className="title-main pt-5 pb-0 px-0 text-center mb-3">
        <h1 className="h1 fw-bold mb-4">{section?.settings?.title}</h1>
        {section?.settings?.content && (
          <div
            className="rte mb-3 text-left"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.content),
            }}
          />
        )}
      </div>
      <ReqTable content={section}/>
      <div className="main-actions d-flex justify-content-center align-items-center mb-3">
        <Link
          href={"/passport-size-photos"}
          onClick={scrollToTop}
          className="btn--primary-new rounded-pill btn--green"
        >
          Place Order Now
        </Link>
      </div>
    </section>
  );
};

export default PageContent;
