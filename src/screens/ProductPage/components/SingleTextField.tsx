import React from "react";

const SingleTextField = ({
  handleLineItemChange,
  label,
  handleLineItemPicsChange,
}: any) => {
  return (
    <div className="mb-3 cgc--wrap-main">
      <label htmlFor="text" className="form-label">
        {label}
      </label>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          name="text"
          onChange={handleLineItemChange}
        />
      </div>
    </div>
  );
};

export default SingleTextField;
