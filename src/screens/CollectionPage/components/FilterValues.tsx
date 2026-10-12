import { doesValueExist } from "@/helpers/CollectionHelper";
import React from "react";

const FilterValues = ({ filter, selected, filterChange, autoCapture,annoyFilter }: any) => {
  const sortedValues = filter?.values?.sort();
  //console.log("inside the filters values", selected, filter, autoCapture);
  return (
    <ul className="nav flex-column mb-2">
      {sortedValues?.map((val: any, i: any) => {
        let isChecked = false;
        const valueExists = doesValueExist(
          filter.source,
          val?.value,
          selected,
          autoCapture
        );
        isChecked = valueExists;
        return (
          <li
            key={i}
            className={`nav-item mb-2 d-flex align-items-center justify-content-start gap-2 w-100 cursor-pointer ${
              (val?.count && val?.count > 0) || isChecked
                ? "searchable"
                : "nav-item-not-disable"
            }`}
          >
            <input
              type="radio"
              id={`${filter?.source}-${val?.value}`}
              name={`${filter?.label}`}
              value={val?.value}
              checked={isChecked}
              data-now={isChecked}
              onChange={(e: any) =>
                filterChange(
                  e,
                  filter?.label,
                  filter?.source,
                  val?.value,
                  isChecked
                )
              }
            />
            <label
              htmlFor={`${filter?.source}-${val?.value}`}
              style={{textTransform:'capitalize'}}
              className="m-0 flex-grow-1 font-simple text-wrap"
            >
              {val?.value}
            </label>
            <p className="fw-medium m-0 font-simple">{val?.count}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default FilterValues;
