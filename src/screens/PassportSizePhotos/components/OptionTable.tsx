"use client";
import { htmlDecode } from "@/helpers/generals";
import React, { useEffect, useState } from "react";

const OptionTable = ({ content, onLayoutChange }: any) => {
  const [expend, setExpend] = useState(false);

  useEffect(() => {
    onLayoutChange?.();
  }, [expend, onLayoutChange]);

  return (    <div
      className={`mini-table-inside mb-3 position-relative ${
        expend ? "expend" : ""
      }`}
    >
      <table className="photoSize photo-chart-table table text-left mb-0">
        <thead>
          <tr>
            <th scope="col" className="small-column">
              Requirements
            </th>
            <th scope="col" className="large-column">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {content
            ? content.map((requirement: any, index: any) => {
                return (
                  <tr key={index}>
                    <td className="small-column">{requirement.key}</td>
                    <td className="large-column">
                      <div
                        className="rte"
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(requirement.value),
                        }}
                      />
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
      <div className="expand-btn py-2 px-2 position-absolute d-flex align-items-center justify-content-center">
        <button
          className={`py-1 px-2 border-0 d-flex align-items-center justify-content-center gap-2 ${
            expend ? "active" : ""
          }`}
          onClick={() => setExpend((prev) => !prev)}
        >
          <span className="sr-only">{expend ? "Collapse" : "Click to Expand"}</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: '20px',
              height: '20px'
            }}
          >
            <path
              d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OptionTable;
