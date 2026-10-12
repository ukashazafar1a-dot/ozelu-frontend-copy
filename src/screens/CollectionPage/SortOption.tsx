"use client";
import React from "react";

const SortOption = ({
  sortBy,
  sbOpened,
  setSbOpened,
  onSortByClick,
  sortings,
  onChangeSortBy,
  porductCount,
  selectedFilters,
}: any) => {
  //console.log(selectedFilters)
  return (
    <div className="sort--wrapper col text-right d-flex align-items-center justify-content-md-end justify-content-between gap-2 mt-md-0 mt-2">
      <div className="text-muted font-simple m-0">{porductCount} {porductCount > 0 ? 'Products': 'Product'}</div>
      <div
        className={
          sbOpened
            ? "cat_sortby cat_sortby_js opended"
            : "cat_sortby cat_sortby_js"
        }
        onClick={(e: any) => {
          e?.stopPropagation();
          setSbOpened(false);
        }}
      >
        <a
          className="in_flex fl_between al_center sortby_pick"
          rel="nofollow"
          data-no-instant=""
          href="#"
          onClick={(e) => onSortByClick(e)}
        >
          <span className="sr_txt dn">
            {sortBy?.label ? sortBy?.label : 'Recommended'}
          </span>
          <span className="sr_txt_mb">Sort by</span>
          <i className="ml__5 mr__5 fa fa-angle-down"></i>
        </a>
        <div className="nt_sortby dn">
          <svg
            className="ic_triangle_svg"
            viewBox="0 0 20 9"
            role="presentation"
          >
            <path
              d="M.47108938 9c.2694725-.26871321.57077721-.56867841.90388257-.89986354C3.12384116 6.36134886 5.74788116 3.76338565 9.2467995.30653888c.4145057-.4095171 1.0844277-.40860098 1.4977971.00205122L19.4935156 9H.47108938z"
              fill="#ffffff"
            ></path>
          </svg>
          <div className="h3 mg__0 tc cd tu ls__2 dn_lg db">
            Sort by<i className="pegk pe-7s-close fs__50 ml__5"></i>
          </div>
          <div className="nt_ajaxsortby wrap_sortby">
            {sortings?.map((sort: any, i: any) => {
              return (
                <a
                  key={sort?.value + i}
                  className={
                    sortBy?.value === sort?.value
                      ? "truncate selected"
                      : "truncate"
                  }
                  href="#"
                  onClick={(e) => onChangeSortBy(e, sort)}
                >
                  {sort?.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortOption;
