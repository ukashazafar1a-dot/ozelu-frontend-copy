import {
  getCustomerInfo,
  getPaymentDetails,
  getPspOrderService,
  Order,
} from "@/libs/orderTypes";
import { sendGTMEvent } from "@next/third-parties/google";
import { getFormInfo } from "./dlTypes";

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
  | "A4 Print"
  | "A3 Print";

export const pushDatalyer = (type: FieldType) => {
  try {
    sendGTMEvent({
      event: "form_field_interaction",
      ...getFormInfo("Passport Size Photos"),
      field_name: type,
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
      ...getFormInfo("Passport Size Photos"),
      field_name: type === "city" ? "City" : "Area",
    });
    sendGTMEvent({
      event: "dropdown_selection",
      ...getFormInfo("Passport Size Photos"),
      dropdown_name: type === "city" ? "City" : "Area",
      selected_option: value || "Dubai",
    });
  } catch (error) {
    console.log("error in city,area, datalayer", error);
  }
};

export const purposeDataLayer = (value: string) => {
  try {
    sendGTMEvent({
      event: "form_field_interaction",
      field_name: "Purpose",
      ...getFormInfo("Passport Size Photos"),
    });
    sendGTMEvent({
      event: "dropdown_selection",
      dropdown_name: "Purpose",
      ...getFormInfo("Passport Size Photos"),
      selected_option: value || "USA Visa (51x51mm/White)",
    });
  } catch (error) {
    console.log(error);
  }
};

type peopleType = "Number Of People" | "Number Of Photos Required Per Person";

export const peopleDatalayer = (type: peopleType, value: string) => {
  try {
    sendGTMEvent({
      event: "dropdown_selection",
      dropdown_name: type,
      ...getFormInfo("Passport Size Photos"),
      selected_option: value,
    });
  } catch (error) {
    console.log(error);
  }
};

export const serviceDataLayer = (value: string) => {
  try {
    sendGTMEvent({
      event: "dropdown_selection",
      dropdown_name: "Service",
      ...getFormInfo("Passport Size Photos"),
      selected_option: value || "Soft Copy By Email",
    });
  } catch (error) {
    console.log(error);
  }
};

export const commentDataLayer = () => {
  try {
    sendGTMEvent({
      event: "comments_added",
      ...getFormInfo("Passport Size Photos"),
    });
  } catch (error) {
    console.log(error);
  }
};
export const formSubmission = () => {
  try {
    sendGTMEvent({
      event: "form_submission_attempt",
      ...getFormInfo("Passport Size Photos"),
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
      ...getFormInfo("Passport Size Photos"),
      error_fields: JSON.stringify(error),
    });
  } catch (error) {
    console.log("form submission start", error);
  }
};

export const stripeStart = () => {
  try {
    sendGTMEvent({
      event: "payment_info_entered",
      ...getFormInfo("Passport Size Photos"),
      payment_stage: "started",
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
        ...getFormInfo("Passport Size Photos"),
      });
      sendGTMEvent({
        event: "form_submission_successful",
        form_status: "successful",
        ...getFormInfo("Passport Size Photos"),
      });
      sendGTMEvent({
        event: "purchase",
        ...getFormInfo("Passport Size Photos"),
        ...getPaymentDetails(order),
        purchase_details: {
          ...getPspOrderService(order),
          ...getCustomerInfo(order),
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};
