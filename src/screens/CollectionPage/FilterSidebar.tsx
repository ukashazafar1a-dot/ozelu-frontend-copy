"use client";
import React, { useEffect, useState } from "react";
import FilterDropdown from "./components/FilterDropdown";
import SelectedFilters from "./SelectedFilters";

type filter = {
  _id?: string;
  source?: string;
  type?: string;
  label?: string;
  values?: Array<{ value?: string; count?: string | number }>;
  __v?: 0;
};

const FilterSidebar = ({
  open,
  closeClick,
  collection,
  filterChange,
  searchedParams,
  clearFilter,
  autoCapture,
  annoyFilter
}: any) => {
  const [filters, setFilters] = useState<any>(null);
  const [filtersPosition, setFiltersPosition] = useState<any>(null);
  const [sortedFilters, setSortedFilters] = useState<any>(null);
  //console.log("filter sidebar");
  useEffect(() => {
    setFilters(collection?.filters);
    setFiltersPosition(collection?.filters_positions);
    // const newly = modifyFilters(
    //   collection?.filters,
    //   collection?.filters_positions
    // );
    setSortedFilters(collection?.filters);
  }, [collection]);
  //console.log("filter", sortedFilters);
  //console.log("when slug changes", buttons);
  return (
    <>
      {open && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
      <div className={`filter-sidebar--overlay ${open ? "open-now" : "nothing-here"}`} onClick={closeClick}>
          <span></span>
        </div>
      <div className={`filter--sidebar ${open ? "open-now" : "nothing-here"} `}>
        
        <div className="main-content-sidebar p-3 border border-grey rounded text-black">
          <div className="sidebar--header d-flex align-items-center justify-content-end w-100 mb-3">
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={closeClick}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <SelectedFilters clear={clearFilter} newparams={searchedParams} autoCapture={autoCapture}/>
          <div className="filter-lists">
            {sortedFilters && sortedFilters?.length > 0 ? (
              sortedFilters.map((filter: filter) => {
                return (
                  <FilterDropdown
                    filter={filter}
                    filterChange={filterChange}
                    selectedFilters={searchedParams}
                    key={filter?._id}
                    selection={searchedParams}
                    autoCapture={autoCapture}
                    annoyFilter={annoyFilter}
                  />
                );
              })
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
