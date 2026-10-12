"use client";
import React, { useEffect, useState } from "react";
import ArticleGrid from "./ArticleGrid";
import "./style.css";
import SectionLoader from "@/components/Loader/SectionLoader";
import SingleCategoryHeader from "./SingleCategoryHeader";

type props = {
  articles?: any;
  content?: any;
};

const SingleCategoryPage = ({ articles, content }: props) => {
    const [blogs, setBlogs] = useState<any>(null);
    const [sections, setSections] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      setBlogs(articles?.blogs);
      setSections(content?.settings?.sections);
      setLoading(false);
    }, [articles, content]);
    //console.log("articles", articles, "sections", sections);
    return (
      <>
        {loading ? (
          <SectionLoader />
        ) : (
          <div className="blog--template">
            <SingleCategoryHeader/>
            <ArticleGrid data={blogs} />
          </div>
        )}
      </>
    );
}

export default SingleCategoryPage