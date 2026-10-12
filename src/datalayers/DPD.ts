import { sendGTMEvent } from "@next/third-parties/google";
import { getFormInfo } from "./dlTypes";
import {
  getCustomerInfo,
  getPaymentDetails,
  getPdpOrderSizes,
  Order,
} from "@/libs/orderTypes";

type FieldType =
  | "Service"
  | "First Name"
  | "Last Name"
  | "Email"
  | "Phone Number"
  | "Address"
  | "City"
  | "Area"
  | "Purpose"
  | "Size of Photo"
  | "Background Color"
  | "Number Of People"
  | "Number Of Photos Required Per Person"
  | "Any Comments"
  | "Privacy Preference"
  | "Custom Sizes"
  | "A4 Print"
  | "A3 Print";

export const pushDatalyer = (type: FieldType) => {
  try {
    sendGTMEvent({
      event: "form_field_interaction",
      ...getFormInfo("Documents Printing"),
      field_name: type,
    });
  } catch (error) {
    console.log("error in formFieldInteraction for Service Data Layer", error);
  }
};

export const cityAreaLayer = (type: string, value: any) => {
  if (typeof value == "boolean" || value == true) return;
  try {
    sendGTMEvent({
      event: "form_field_interaction",
      ...getFormInfo("Documents Printing"),
      field_name: type === "city" ? "City" : "Area",
    });
    sendGTMEvent({
      event: "dropdown_selection",
      ...getFormInfo("Documents Printing"),
      dropdown_name: type === "city" ? "City" : "Area",
      selected_option: value || "Dubai",
    });
  } catch (error) {
    console.log("error in city,area, datalayer", error);
  }
};

export const formSubmission = () => {
  try {
    sendGTMEvent({
      event: "form_submission_attempt",
      ...getFormInfo("Documents Printing"),
      form_status: "attempted",
    });
  } catch (error) {
    console.log("form submission start", error);
  }
};
export const formSubmissionError = (error: any) => {
  try {
    sendGTMEvent({
      event: "form_submission_error",
      ...getFormInfo("Documents Printing"),
      form_status: "error",
      error_fields: JSON.stringify(error),
    });
  } catch (error) {
    console.log("form submission start", error);
  }
};
const toUpperCase = (input: string) => {
  return input.toUpperCase();
};
const filterSizes = (data: any) => {
  try {
    const result = data.reduce((acc: any, item: any) => {
      const foundIndex = acc.findIndex(
        (accItem: any) =>
          accItem?.type === item?.type && accItem.size === item.size,
      );

      if (foundIndex !== -1) {
        acc[foundIndex].count += item.count;
      } else {
        acc.push({ ...item });
      }

      return acc;
    }, []);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const fileUploadingStart = (data: any) => {
  try {
    const values = filterSizes(data);
    values.forEach((data: any) => {
      sendGTMEvent({
        event: "file_upload",
        ...getFormInfo("Documents Printing"),
        upload_status: "started",
        upload_type: `${toUpperCase(data?.size)} ${data?.type}`,
        number_files: Number(data?.count),
      });
    });
  } catch (error) {
    console.log(error);
  }
};
export const fileUploadCompleted = (data: any) => {
  try {
    const values = filterSizes(data);
    values.forEach((data: any) => {
      sendGTMEvent({
        event: "file_upload",
        ...getFormInfo("Documents Printing"),
        upload_status: "completed",
        upload_type: `${toUpperCase(data?.size)} ${data?.type}`,
        number_files: Number(data?.count),
      });
    });
  } catch (error) {
    console.log(error);
  }
};
export const stripeStart = () => {
  try {
    sendGTMEvent({
      event: "payment_info_entered",
      ...getFormInfo("Documents Printing"),
      payment_stage: "started",
    });
  } catch (error) {
    console.log(error);
  }
};

export const privacyPreference = (value: string) => {
  try {
    sendGTMEvent({
      event: "dropdown_selection",
      ...getFormInfo("Documents Printing"),
      dropdown_name: "Privacy Preference",
      selected_option: value,
    });
  } catch (error) {
    console.log(error);
  }
};

export const commentDataLayer = () => {
  try {
    sendGTMEvent({
      event: "comments_added",
      ...getFormInfo("Documents Printing"),
    });
  } catch (error) {
    console.log(error);
  }
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const orderDataLayer = (order: Order) => {
  //console.log("Order>>>", order);
  try {
    if (order) {
      sendGTMEvent({
        event: "payment_complete",
        payment_status: "completed",
        ...getFormInfo("Documents Printing"),
      });
      sendGTMEvent({
        event: "form_submission_successful",
        form_status: "successful",
        ...getFormInfo("Documents Printing"),
      });
      sendGTMEvent({
        event: "purchase",
        ...getFormInfo("Documents Printing"),
        ...getPaymentDetails(order),
        purchase_details: {
          ...getCustomerInfo(order),
          ...getPdpOrderSizes(order),
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};
