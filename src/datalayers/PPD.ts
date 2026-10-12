import {
  getCustomerInfo,
  getPaymentDetails,
  getPpdOrderSizes,
  Order,
} from "@/libs/orderTypes";
import { sendGTMEvent } from "@next/third-parties/google";
import { getFormInfo } from "./dlTypes";

type PredefinedFieldType =
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
  | string;

type FieldType = PredefinedFieldType | string;

export const pushDatalyer = (type: FieldType) => {
  try {
    sendGTMEvent({
      event: "form_field_interaction",
      ...getFormInfo("Photos Printing"),
      field_name: `${type}`,
    });
  } catch (error) {
    console.log(
      "error in form_field_interaction for Service Data Layer",
      error,
    );
  }
};

export const cityAreaLayer = (type: string, value: string) => {
  try {
    sendGTMEvent({
      event: "form_field_interaction",
      ...getFormInfo("Photos Printing"),
      field_name: type === "city" ? "City" : "Area",
    });
    sendGTMEvent({
      event: "dropdown_selection",
      ...getFormInfo("Photos Printing"),
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
      ...getFormInfo("Photos Printing"),
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
      form_status: "error",
      ...getFormInfo("Photos Printing"),
      error_fields: JSON.stringify(error),
    });
  } catch (error) {
    console.log("form submission start", error);
  }
};

export const filterSizes = (data: any) => {
  try {
    const result = data.reduce((acc: any, item: any) => {
      const foundIndex = acc.findIndex(
        (accItem: any) =>
          accItem.size === item.size && accItem.dimension === item.dimension,
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
    values?.forEach((data: any) => {
      sendGTMEvent({
        event: "file_upload",
        ...getFormInfo("Photos Printing"),
        upload_status: "started",
        upload_size: `${data?.size}`,
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
    values?.forEach((data: any) => {
      sendGTMEvent({
        event: "file_upload",
        ...getFormInfo("Photos Printing"),
        upload_status: "completed",
        upload_size: `${data?.size}`,
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
      ...getFormInfo("Photos Printing"),
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
      ...getFormInfo("Photos Printing"),
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
      ...getFormInfo("Photos Printing"),
    });
  } catch (error) {
    console.log(error);
  }
};

export const orderDataLayer = (order: Order) => {
  //console.log(order)
  try {
    if (order) {
      sendGTMEvent({
        event: "payment_complete",
        payment_stage: "completed",
        ...getFormInfo("Photos Printing"),
      });
      sendGTMEvent({
        event: "form_submission_successful",
        form_status: "successful",
        ...getFormInfo("Photos Printing"),
      });
      sendGTMEvent({
        event: "purchase",
        ...getFormInfo("Photos Printing"),
        ...getPaymentDetails(order),
        purchase_details: {
          ...getCustomerInfo(order),
          ...getPpdOrderSizes(order),
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};
