"use client";
import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import PageLoader from "../../components/Loader/PageLoader";
import { htmlDecode } from "../../helpers/generals";

function Index({ content }: any) {
  const [page, setPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setPage(content);
    setIsLoading(false);
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  }, [content]);
  if (isLoading) return <PageLoader />;
  if (!page) return notFound();
  return (
    <div className="container my-5">
      <div className="section--header">
        <div className="section__heading-wrap">
          <h1 className="my-5 text-center">{page.title}</h1>
        </div>
      </div>
      <div
        className="rte rte-settings my-5"
        dangerouslySetInnerHTML={{ __html: htmlDecode(page.body_html) }}
      ></div>
    </div>
  );
}

export default Index;
