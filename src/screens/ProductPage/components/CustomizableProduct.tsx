import { Product } from "@/libs/types";
import React from "react";
import FileUploader from "./FileUploader";

type Props = {
  product: Product;
  handleLineItemChange: any;
  handleLineItemPicsChange: any;
  line_items_pics: any;
  uploadProgress: any;
  onLineItemPicRemove: any;
};

const CustomizableProduct = ({
  product,
  handleLineItemChange,
  handleLineItemPicsChange,
  line_items_pics,
  uploadProgress,
  onLineItemPicRemove
}: Props) => {
  return (
    <div className="mb-3">
      <label className="form-label mb-3">Upload Images</label>
      <FileUploader handleFileChange={handleLineItemPicsChange} uploadProgress={uploadProgress} onLineItemPicRemove={onLineItemPicRemove}/>
    </div>
  );
};

export default CustomizableProduct;
