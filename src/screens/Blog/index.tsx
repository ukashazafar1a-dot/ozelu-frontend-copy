"use client";
import React, { useEffect, useState } from "react";
import ArticleGrid from "./ArticleGrid";
import BlogHeader from "./BlogHeader";
import "./style.css";
import SectionLoader from "@/components/Loader/SectionLoader";

type props = {
  articles?: any;
  content?: any;
};
const BlogPage = ({ articles, content }: props) => {
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
          <BlogHeader
            section={
              sections && sections.pageBanner ? sections.pageBanner : null
            }
          />
          <ArticleGrid data={blogs} />
        </div>
      )}
    </>
  );
};

export default BlogPage;
