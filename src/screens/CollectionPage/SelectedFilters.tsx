"use client";
import React from "react";

const SelectedFilters = ({ newparams, clear, autoCapture }: any) => {
  const excludeKeys = ["page", "sort_by"];
  let hasAutoCapture = false;
  let hasAnyParams = false;
  if (newparams) {
    hasAnyParams = Object.keys(newparams)
      .filter((key) => !excludeKeys.includes(key))
      .some(
        (value) => newparams[value] !== null && newparams[value] !== undefined
      );
  }
  if (autoCapture) {
    hasAutoCapture = autoCapture && Object.keys(autoCapture).length > 0;
  }
  return (
    <div className="selection--filters mb-2 w-100">
      {(hasAnyParams || hasAutoCapture) && (
        <div className="chips--flex d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="chip-btn font-primary"
            onClick={clear}
          >
            <span>Clear Filters</span>
            <span aria-hidden="true" className="close-btn">
              &times;
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectedFilters;
