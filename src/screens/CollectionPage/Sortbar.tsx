"use client";
import React, { useState } from "react";
import FilterBtn from "./FilterBtn";
import GridBtns from "./GridBtns";
import SortOption from "./SortOption";

const SortBar = ({
  CloseSidebar,
  productsPerLineD,
  setViewSizeD,
  setViewSizeM,
  productsPerLineT,
  setViewSizeT,
  productsPerLineM,
  onSortByClick,
  onChangeSortBy,
  sortBy,
  sortings,
  setSbOpened,
  sbOpened,
}: any) => {
  return (
    <div className="filter--bar p-3">
      {/* <div className="row align-items-center justify-content-center mx-0 filter--toolbar flex-column flex-md-row">
        <FilterBtn CloseSidebar={CloseSidebar}/>
        <GridBtns
        productsPerLineD={productsPerLineD}
        productsPerLineM={productsPerLineM}
        productsPerLineT={productsPerLineT}
        setViewSizeD={setViewSizeD}
        setViewSizeT={setViewSizeM}
        setViewSizeM={setViewSizeT}/>
        <SortOption/>
      </div> */}
    </div>
  );
};

export default SortBar;