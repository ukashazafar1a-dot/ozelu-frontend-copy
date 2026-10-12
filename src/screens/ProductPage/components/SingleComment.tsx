import React from "react";
type props = {
  label: string;
  handleLineItemChange: any;
  handleLineItemPicsChange: any;
  placeholder?: boolean;
  placeholderText?: string;
  rows?:number;
};
const SingleComment = ({
  handleLineItemChange,
  label,
  handleLineItemPicsChange,
  placeholder = true,
  rows=6,
  placeholderText
}: props) => {
  return (
    <div className="mb-3 cgc--wrap-main">
      <label htmlFor="basic-url" className="form-label mb-3">
        {label}
      </label>
      <div className="input-group">
        <textarea
          className="form-control"
          name="comment"
          aria-label="With textarea"
          placeholder={
            placeholder
              ? placeholderText ? placeholderText : "If you have any comments regarding when you would prefer to deliver and any details about the occasion, you can put them here and we would try our best to accommodate."
              : ""
          }
          onChange={handleLineItemChange}
          rows={rows}
        />
      </div>
    </div>
  );
};

export default SingleComment;
