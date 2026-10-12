"use client"
import React from "react";
import { usePagination, DOTS } from "@/helpers/usePagination";

function CollectionFooter({ currentPage, totalCount, changePage }: any) {
  
  const paginationRange: any = usePagination({
    currentPage,
    totalCount,
    siblingCount: 2,
    pageSize: 700,
  });
  if (!totalCount || currentPage === 0 || paginationRange?.length < 2) {
    //console.log(currentPage, paginationRange.length);
    return null;
  }

  function renderNumberings() {
    return paginationRange?.map((pageNumber: any) => {
      // If the pageItem is a DOT, render the DOTS unicode character
      if (pageNumber === DOTS) {
        return (
          <li key={pageNumber}>
            <span className="page-numbers lh__1">…</span>
          </li>
        );
      }

      // Render our Page Pills
      return (
        <li key={pageNumber}>
          <a
            className={
              pageNumber === currentPage
                ? "page-numbers current"
                : "page-numbers"
            }
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changePage(pageNumber);
            }}
          >
            {pageNumber}
          </a>
        </li>
      );
    });
  }

  let lastPage = paginationRange[paginationRange?.length - 1];

  return (
    <div className="products-footer tc w-100">
      <nav className="nt-pagination w-100 tc paginate_ajax">
        <ul className="pagination-page page-numbers">
          <li style={{ display: currentPage === 1 ? "none" : "list-item" }}>
            <a
              className="page-numbers"
              href="#"
              onClick={(e) => {
                e?.preventDefault();
                changePage(currentPage - 1);
              }}
            >
              Prev
            </a>
          </li>
          {renderNumberings()}
          <li
            style={{ display: currentPage === lastPage ? "none" : "list-item" }}
          >
            <a
              href="#"
              className="page-numbers"
              onClick={(e) => {
                e?.preventDefault();
                changePage(currentPage + 1);
              }}
            >
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default CollectionFooter;
