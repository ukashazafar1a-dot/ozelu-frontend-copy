import React from "react";
import SingleFileInput from "./SingleFileInput";

const GreetingCardPrinting = ({
  handleLineItemChange,
  line_items_pics,
  handleLineItemPicsChange,
  uploadProgress
}: any) => {


  return (
    <div className="cgc--wrap-main">
      <div className="rte mb-3">Upload Images Below (If Want To Leave Any Page Blank Then Don’t Upload Anything For It)</div>
      <SingleFileInput
        label="Upload Image for Front"
        name="Front View"
        value={line_items_pics.find((file:any)=>file.field==='Front View')}
        handleLineItemPicsChange={handleLineItemPicsChange}
        uploadProgress={uploadProgress}
      />
      <SingleFileInput
        label="Upload Image for Inside Left Page"
        name="Left Page"
        value={line_items_pics.find((file:any)=>file.field==='Left Page')}
        handleLineItemPicsChange={handleLineItemPicsChange}
        uploadProgress={uploadProgress}
      />
      <SingleFileInput
        label="Upload Image for Inside Right Page"
        name="Right Page"
        value={line_items_pics.find((file:any)=>file.field==='Right Page')}
        handleLineItemPicsChange={handleLineItemPicsChange}
        uploadProgress={uploadProgress}
      />
      <SingleFileInput
        label="Upload Image for Back"
        name="Back View"
        value={line_items_pics.find((file:any)=>file.field==='Back View')}
        handleLineItemPicsChange={handleLineItemPicsChange}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};

export default GreetingCardPrinting;
