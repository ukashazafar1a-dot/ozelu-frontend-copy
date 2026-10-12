import CustomizableProduct from "./CustomizableProduct";
import GreetingCardPrinting from "./GreetingCardPrinting";
import MugPrinting from "./MugPrinting";
import SingleComment from "./SingleComment";
import SingleTextField from "./SingleTextField";

const CGCUploadFile = ({
  handleLineItemChange,
  handleLineItemPicsChange,
  line_items_pics,
  product,
  uploadProgress,
  onLineItemPicRemove
}: any) => {
  // Here is the defined templates on the backend side.
  // const templates = [
  //   "custom-greeting-card-printing",
  //   "custom-mug-printing",
  //   "mug-products",
  //   "comment"
  // ];
  if (!product?.template) return <></>;

  switch (product?.template) {
    case "custom-greeting-card-printing":
      return (
        <>
          <GreetingCardPrinting
            line_items_pics={line_items_pics}
            handleLineItemChange={handleLineItemChange}
            handleLineItemPicsChange={handleLineItemPicsChange}
            uploadProgress={uploadProgress}
          />
          <SingleComment
            label={"Any Comments"}
            handleLineItemChange={handleLineItemChange}
            handleLineItemPicsChange={handleLineItemPicsChange}
          />
        </>
      );
    case "custom-mug-printing":
      return (
        <>
          <MugPrinting
            line_items_pics={line_items_pics}
            handleLineItemChange={handleLineItemChange}
            handleLineItemPicsChange={handleLineItemPicsChange}
            uploadProgress={uploadProgress}
          />
          <SingleComment
            label={"Any Comments"}
            handleLineItemChange={handleLineItemChange}
            handleLineItemPicsChange={handleLineItemPicsChange}
          />
        </>
      );
    case "comment":
      return (
        <>
          <SingleComment
            label={"Any Comments"}
            handleLineItemChange={handleLineItemChange}
            handleLineItemPicsChange={handleLineItemPicsChange}
          />
        </>
      );
    case "greeting-cards-photos":
      return (
        <>
          <SingleComment
            label="Customize Text"
            handleLineItemPicsChange={handleLineItemPicsChange}
            handleLineItemChange={handleLineItemChange}
            placeholder={true}
            placeholderText="Please mention anything in the Greeting Card that you would like to customize like the name etc."
            rows={4}

          />
          <CustomizableProduct
            product={product}
            handleLineItemChange={handleLineItemChange}
            line_items_pics={line_items_pics}
            handleLineItemPicsChange={handleLineItemPicsChange}
            uploadProgress={uploadProgress}
            onLineItemPicRemove={onLineItemPicRemove}
          />
        </>
      );
    default:
      return '';
  }
};

export default CGCUploadFile;
