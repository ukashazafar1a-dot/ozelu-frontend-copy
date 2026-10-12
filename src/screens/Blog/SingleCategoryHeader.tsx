import React from "react";

type props = {
  title?: any;
};

const SingleCategoryHeader = ({ title }: props) => {
  return (
    <div className="section--header p-5 mb-5">
      <h1 className="text-center">{title ? title : "Blog"}s</h1>
    </div>
  );
};

export default SingleCategoryHeader;
