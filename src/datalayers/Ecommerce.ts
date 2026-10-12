import { getCustomerInfo, getPaymentDetails, Order } from "@/libs/orderTypes";
import { sendGTMEvent } from "@next/third-parties/google";

function transformItems(items: any[]) {
  return items.map((item) => ({
    item_id: item?.data?.sku || "",

    item_name: item?.data?.title || "",

    item_variant: item?.data?.title_option || "",

    price: Number(item?.price ?? item?.data?.subTotal ?? 0),

    quantity: item?.data?.quantity ?? 0,
  }));
}

export const orderDataLayer = (order: Order) => {
  //console.log(order);
  try {
    if (order) {
      sendGTMEvent({
        event: "purchase",
        form_id: "004",
        form_name: "E-Commerce Store",
        tax: 0,
        ...getPaymentDetails(order),
        purchase_details: {
          ...getCustomerInfo(order),
        },
        items: [...transformItems(order?.items)],
      });
    }
  } catch (error) {
    console.log(error);
  }
};
