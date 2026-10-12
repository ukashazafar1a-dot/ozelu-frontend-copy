"use client";
import React from "react";

type ActionBtnProps = {
  btnBgClr?: string;
  btnTextClr?: string;
};

const ActionBtn = ({ btnBgClr, btnTextClr }: ActionBtnProps) => {
  function scroll() {
    const form = document.getElementById("printing-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Drive .btn--primary-new CSS variables so hover/focus stay in sync.
  const style: React.CSSProperties & Record<string, string> = {};
  if (btnBgClr) {
    style["--btnPrimaryNewBackground"] = btnBgClr;
    style.background = btnBgClr;
    style.backgroundColor = btnBgClr;
  }
  if (btnTextClr) {
    style["--btnPrimaryNewText"] = btnTextClr;
    style.color = btnTextClr;
  }

  return (
    <button
      type="button"
      className="btn--primary-new"
      onClick={scroll}
      style={Object.keys(style).length ? style : undefined}
    >
      Place Your Order
    </button>
  );
};

export default ActionBtn;
