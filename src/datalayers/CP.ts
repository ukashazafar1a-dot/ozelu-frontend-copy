import { sendGTMEvent } from "@next/third-parties/google";
import { FormFields, formIds, getFormInfo, SizeItem, FormNames } from "./dlTypes";
import { filterSizes } from "./PPD";
import {
  getCustomerInfo,
  getPaymentDetails,
  getPpdOrderSizes,
  getPspOrderService,
  getServicesOrderFiles,
  getServicesOrderPrices,
  Order,
} from "@/libs/orderTypes";

export const pushDatalyer = (
  name: FormNames,
  type: FormFields,
  formId?: (typeof formIds)[FormNames],
) => {
  try {
    console.log(name, type, getFormInfo(name));
    sendGTMEvent({
      event: "form_field_interaction",
      ...getFormInfo(name),
      field_name: type,
    });
  } catch (error) {
    console.log("error in form_field_interaction", error);
  }
};

export const cityAreaLayer = <T extends keyof typeof formIds>(
  name: T,
  type: string,
  value: string,
  formId?: (typeof formIds)[T],
) => {
  try {
    sendGTMEvent({
      event: "form_field_interaction",
      ...getFormInfo(name),
      field_name: type === "city" ? "City" : "Area",
    });
    sendGTMEvent({
      event: "dropdown_selection",
      ...getFormInfo(name),
      dropdown_name: type === "city" ? "City" : "Area",
      selected_option: value || "Dubai",
    });
  } catch (error) {
    console.log("error in city,area, datalayer", error);
  }
};

export const pushDropdownLayer = <T extends keyof typeof formIds>(
  name: T,
  type: FormFields,
  value: string,
  formId?: (typeof formIds)[T],
) => {
  try {
    sendGTMEvent({
      event: "dropdown_selection",
      ...getFormInfo(name),
      dropdown_name: type,
      selected_option: value,
    });
  } catch (error) {
    console.log(error);
  }
};

export const stripeStart = <T extends keyof typeof formIds>(
  name: T,
  formId?: (typeof formIds)[T],
) => {
  try {
    sendGTMEvent({
      event: "payment_info_entered",
      ...getFormInfo(name),
      payment_stage: "started",
    });
  } catch (error) {
    console.log(error);
  }
};

export const stripeComplete = <T extends keyof typeof formIds>(
  name: T,
  formId?: (typeof formIds)[T],
) => {
  try {
    sendGTMEvent({
      event: "payment_info_entered",
      ...getFormInfo(name),
      payment_stage: "completed",
    });
  } catch (error) {
    console.log(error);
  }
};

export const fileUploading = <T extends keyof typeof formIds>(
  name: T,
  data: any,
  status: "started" | "completed",
  formId?: (typeof formIds)[T],
) => {
  try {
    const values = filterSizes(data);
    values?.forEach((data: any) => {
      sendGTMEvent({
        event: "file_upload",
        ...getFormInfo(name),
        upload_status: status,
        upload_size: `${data?.size}`,
        number_files: Number(data?.count),
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const formSubmissionError = (error: any) => {
  try {
    sendGTMEvent({
      event: "form_submission_error",
      form_status: "error",
      form_id: "002",
      form_name: "Photos Printing",
      error_fields: JSON.stringify(error),
    });
  } catch (error) {
    console.log("form submission start", error);
  }
};

const formSubmitTypes = {
  form_submission_attempt: "attempted",
  form_submission_successful: "successful",
  form_submission_error: "error",
};

export const formSubmission = <T extends keyof typeof formIds>(
  name: T,
  event:
    | "form_submission_attempt"
    | "form_submission_successful"
    | "form_submission_error",
  error?: unknown,
  formId?: (typeof formIds)[T],
) => {
  try {
    let object = {
      event: event,
      ...getFormInfo(name),
      form_status: formSubmitTypes[event],
    } as any;
    if (error) {
      object.error_fields = JSON.stringify(error);
    }
    sendGTMEvent(object);
  } catch (error) {
    console.log("form submission start", error);
  }
};

/** Canonical print_type values → customer-facing labels (GTM purchase event only). */
const FLYER_PURCHASE_PRINTING_SIDES_LABELS: Record<string, string> = {
  "Single Side": "Single Sided Printing",
  "Double Side": "Double Sided Printing",
};

/**
 * Remap Flyers `items[].data.sizes[]` for the GTM `purchase` event only.
 * Does not change MongoDB / API order shape — analytics keys per client spec:
 * - `type` → `flyer_type`
 * - `print_type` → `printing_sides` (display labels)
 * - `size` → human-readable "A6 (10.5cmX14.8cm)" style; `name` omitted to avoid duplicate keys.
 */
function mapFlyersPurchaseSizesForDataLayer(sizes: unknown): any[] {
  if (!Array.isArray(sizes)) return [];
  return sizes.map((raw) => {
    const s =
      raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const type = s.type as string | undefined;
    const print_type = s.print_type as string | undefined;
    const name = s.name != null ? String(s.name) : "";
    const sizeDim = s.size != null ? String(s.size) : "";
    const {
      type: _omitType,
      print_type: _omitPrintType,
      name: _omitName,
      size: _omitSize,
      ...rest
    } = s;
    const combinedSize =
      name && sizeDim ? `${name} (${sizeDim})` : name || sizeDim || "";
    const printingSides =
      print_type != null && print_type !== ""
        ? FLYER_PURCHASE_PRINTING_SIDES_LABELS[String(print_type)] ||
          String(print_type)
        : null;
    return {
      ...rest,
      size: combinedSize,
      flyer_type: type ?? null,
      printing_sides: printingSides,
    };
  });
}

export const returnArrangeSize = <T extends keyof typeof formIds>(
  sizes: SizeItem[] | null,
  form: T,
) => {
  if (sizes) {
    return sizes.map((size) => {
      const { name, thickness, ...rest } = size;
      let object: any = {
        dimension: name,
        thickness,
        ...rest,
      };
      if (form == "Canvas Printing") {
        object.thickness = thickness + "cm deep";
      }
      return object;
    });
  }
};

export const pushOrderLayer = <T extends keyof typeof formIds>(
  name: T,
  order: Order,
  formId?: (typeof formIds)[T],
) => {
  //console.log(order);
  try {
    if (order) {
      stripeComplete(name);
      formSubmission(name, "form_submission_successful");
      let purchaseObject: { [key: string]: any } = {
        ...getCustomerInfo(order),

      };
      if (name == "Canvas Printing") {
        purchaseObject.sizes = getServicesOrderFiles(order, "CANVAS_PRINT");
      }
      if (name == "Foam Board Panels Printing") {
        purchaseObject.photoSizes = getServicesOrderFiles(order, "FOAM_BOARD");
        purchaseObject.prices = getServicesOrderPrices(order, "FOAM_BOARD");
      }
      if (name == "Certificates Printing") {
        purchaseObject.sizes = getServicesOrderFiles(
          order,
          "CERTIFICATE_PRINT",
        );
        purchaseObject.photos = getServicesOrderFiles(
          order,
          "CERTIFICATE_PRINT",
        );
      }
      if (name == "Stickers Printing") {
        purchaseObject.sizes = getServicesOrderFiles(order, "STICKER_PRINT");
        purchaseObject.photos = getServicesOrderFiles(order, "STICKER_PRINT");
      }
      if (name == "Business Cards Printing") {
        purchaseObject.sizes = getServicesOrderFiles(order, "BUSINESS_CARD");
      }
      if (name == "Flyers Printing") {
        purchaseObject.sizes = mapFlyersPurchaseSizesForDataLayer(
          getServicesOrderFiles(order, "FLYER_PRINT"),
        );
      }
      if (name == "Greeting Cards Printing") {
        purchaseObject.sizes = getServicesOrderFiles(
          order,
          "GREETING_CARD_PRINT",
        );
      }
      if (name == "Mugs Printing") {
        purchaseObject.sizes = getServicesOrderFiles(order, "MUG_PRINT");
      }
      if (name == "T-Shirts Printing") {
        purchaseObject.sizes = getServicesOrderFiles(order, "T_SHIRT_PRINT");
      }
      if (name == "Menu Printing") {
        purchaseObject.sizes = getServicesOrderFiles(order, "MENU_PRINT");
      }
      if (name == "Brochures Printing") {
        purchaseObject.sizes = getServicesOrderFiles(order, "BROCHURE_PRINT");
      }
      if (name == "Photos Printing") {
        purchaseObject = { ...getPpdOrderSizes(order), ...getCustomerInfo(order) };
      }
      if (name == "Passport Size Photos") {
        purchaseObject = {
          ...getPspOrderService(order),
          ...getCustomerInfo(order),
        };
      }
      if (name == 'Documents Printing') {
        purchaseObject = { ...getPpdOrderSizes(order), ...getCustomerInfo(order) };
      }
      sendGTMEvent({
        event: "purchase",
        ...getFormInfo(name),
        ...getPaymentDetails(order),
        purchase_details: purchaseObject,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
