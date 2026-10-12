import React from "react";
import SingleFileInput from "./SingleFileInput";

const MugPrinting = ({
  handleLineItemChange,
  line_items_pics,
  handleLineItemPicsChange,
  uploadProgress
}: any) => {
  return (
    <div className="cgc--wrap-main">
      <div className="rte mb-3">Upload Images Below (If Want To Leave Any Side Blank Then Don’t Upload Anything For It). You Can Either Upload A 21x9cm File And We Print That On The Mug Or Upload For Each Side Separately And We Will Handle The Rest.</div>
      <SingleFileInput
        label="Upload Design File In 21x9 cm"
        name="File 21x9cm"
        value={line_items_pics.find((file:any)=>file.field==='File 21x9cm')}
        handleLineItemPicsChange={handleLineItemPicsChange}
        uploadProgress={uploadProgress}
      />
      <p className="mb-2 or--title">OR</p>
      <SingleFileInput
        label="Upload Image for Front"
        name="Front View"
        value={line_items_pics.find((file:any)=>file.field==='Front View')}
        handleLineItemPicsChange={handleLineItemPicsChange}
        uploadProgress={uploadProgress}
      />
      <SingleFileInput
        label="Upload Image for Middle"
        name="Middle Page"
        value={line_items_pics.find((file:any)=>file.field==='Middle Page')}
        handleLineItemPicsChange={handleLineItemPicsChange}
        uploadProgress={uploadProgress}
      />
      {/* <SingleFileInput
        label="Upload Image for Inside Right Page"
        name="Right Page"
        handleLineItemPicsChange={handleLineItemPicsChange}
      /> */}
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

export default MugPrinting;
