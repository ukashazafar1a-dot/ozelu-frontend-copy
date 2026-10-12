"use client";
import React from "react";

const BlogHeader = ({ section }: any) => {
  return (
    <div className="section--header p-5 mb-5">
      <h1 className="text-center">
        {section?.settings?.title ? section?.settings?.title : "Blogs"}
      </h1>
    </div>
  );
};

export default BlogHeader;
