"use client";
import { htmlDecode } from "@/helpers/generals";
import React, { useState } from "react";

type props = {
  content: string;
  title?: string;
};

const SizeChartModel = ({ content, title }: props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sizechart-wrapper">
      <div className="sizechart-btn" onClick={() => setOpen(!open)}>
        {title ? title : "Size Chart"}
      </div>
      {open && (
        <div className="model-overlay">
          <span></span>
        </div>
      )}
      {open ? (
        <style>{`
          body {
            overflow: hidden;
          }
        `}</style>
      ) : (
        <></>
      )}
      <div
        className={`sizechart-model modal modal-fullscreen-sm-down fade ${
          open ? "model-show show" : "hide"
        }`}
        id="exampleModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable ">
          <div className="modal-content">
            <div className="close--btn-main" onClick={() => setOpen(!open)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="14"
                width="14"
                viewBox="0 0 384 512"
              >
                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
              </svg>
            </div>
            <div className="modal-body p-1">
              <div
                className="rte"
                dangerouslySetInnerHTML={{ __html: htmlDecode(content) }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModel;
