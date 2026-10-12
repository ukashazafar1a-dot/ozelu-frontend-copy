"use client";
import React from "react";

const FilterBtn = ({ CloseSidebar, hide }: any) => {
  return (
    <div className={`cat_filter col p-0 ${hide ? "visible" : "invisible"}`}>
      <button
        type="button"
        className="btn_filter filter--btn"
        onClick={CloseSidebar}
      >
        <i className="fa-solid fa-filter"></i>
        <span>Filter</span>
      </button>
    </div>
  );
};

export default FilterBtn;
