"use client";
import React, { useEffect, useState } from "react";
import ArticleHeader from "./ArticleHeader";
import "../style.css";
import ArticleSchema from "./ArticleSchema";
import SectionLoader from "@/components/Loader/SectionLoader";

const ArticlePage = ({ content }: any) => {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setArticle(content?.blog);
    setLoading(false);
  }, [content]);

  return (
    <div className="article--template py-5">
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          <div className="article-main_content">
            {article && <ArticleHeader article={article} />}
          </div>
          <ArticleSchema article={article} />
        </>
      )}
    </div>
  );
};

export default ArticlePage;
