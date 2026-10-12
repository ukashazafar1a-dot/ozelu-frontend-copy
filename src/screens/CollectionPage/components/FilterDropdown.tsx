"use client";
import React, { useState } from "react";
import FilterValues from "./FilterValues";

const FilterDropdown = ({ filter, filterChange, selection,autoCapture,annoyFilter }: any) => {
  const [isDropdownOpen, setDropdownOpen] = useState(true);
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  return (
    <div className="filter_item pt-2 pb-1" key={filter?._id}>
      <h6
        className="sidebar-heading d-flex justify-content-between align-items-center mb-3"
        onClick={toggleDropdown}
      >
        <span>{filter?.label}</span>
        <div className="icon--wrapper">
          <i
            className={`fa-solid fa-chevron-${isDropdownOpen ? "up" : "down"}`}
          ></i>
        </div>
      </h6>
      {isDropdownOpen && filter?.values && filter?.values?.length > 0 && (
        <FilterValues
          filter={filter}
          selected={selection}
          filterChange={filterChange}
          autoCapture={autoCapture}
          annoyFilter={annoyFilter}
        />
      )}
    </div>
  );
};

export default FilterDropdown;
