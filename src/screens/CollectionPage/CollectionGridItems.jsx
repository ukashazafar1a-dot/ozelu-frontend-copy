"use client";
import React, { useState } from "react";
// import "./CollectionGridItems.css";
// import ProductsGrid from "@/pages/CollectionPage/ProductsGrid";
// import FilterSidebar from "@/pages/CollectionPage/FilterSidebar";
// import SortBar from './Sortbar'
// const sortings = [
//   {
//     label: "Alphabetically, A-Z",
//     value: "title-ascending",
//   },
//   {
//     label: "Alphabetically, Z-A",
//     value: "title-descending",
//   },
//   {
//     label: "Price, low to high",
//     value: "price-ascending",
//   },
//   {
//     label: "Price, high to low",
//     value: "price-descending",
//   },
//   {
//     label: "Date, old to new",
//     value: "created-ascending",
//   },
//   {
//     label: "Date, new to old",
//     value: "created-descending",
//   },
// ];

function CollectionGridItems({
  collection,
  changeSort,
  filterChange,
  SmallLoader,
}) {
  // const [productsPerLineD, setProductsPerLineD] = useState(4);
  // const [productsPerLineT, setProductsPerLineT] = useState(3);
  // const [productsPerLineM, setProductsPerLineM] = useState(2);

  // //Sidebar
  // const [openbar, setOpenbar] = useState(false);

  // const [sortBy, setSortBy] = useState(sortings[0]);
  

  // function setViewSizeD(e, size) {
  //   e.preventDefault();
  //   setProductsPerLineD(size);
  // }

  // function setViewSizeT(e, size) {
  //   e.preventDefault();
  //   setProductsPerLineT(size);
  // }

  // function setViewSizeM(e, size) {
  //   e.preventDefault();
  //   setProductsPerLineM(size);
  // }

  // function onSortByClick(e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setSbOpened(!sbOpened);
  // }

  // function onChangeSortBy(e, sort) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setSortBy(sort);
  //   changeSort(sort.value);
  //   setSbOpened(false);
  // }
  // const CloseSidebar = () => {
  //   setOpenbar(!openbar);
  // };
  return (
    <></>
    // <>
    //   <SortBar 
    //     CloseSidebar={CloseSidebar}
    //     productsPerLineD={productsPerLineD}
    //     setViewSizeD={setViewSizeD}
    //     productsPerLineT={productsPerLineT}
    //     setViewSizeT={setViewSizeT}
    //     productsPerLineM={productsPerLineM}
    //     setViewSizeM={setViewSizeM}
    //     onChangeSortBy={onChangeSortBy}
    //     sortBy={sortBy}
    //     onSortByClick={onSortByClick}
    //     sortings={sortings}
    //   />
    //   <div className="container-fluid products--grid">
    //     <div className="d-flex">
    //       <FilterSidebar
    //         open={openbar}
    //         closeClick={CloseSidebar}
    //         collection={collection}
    //         filterChange={filterChange}
    //       />
    //         <ProductsGrid
    //           products={collection?.products}
    //           desktopPerLine={productsPerLineD}
    //           mobilePerLine={productsPerLineM}
    //           tabletPerLine={productsPerLineT}
    //         />
        
    //     </div>
    //   </div>
    // </>
  );
}

export default CollectionGridItems;
