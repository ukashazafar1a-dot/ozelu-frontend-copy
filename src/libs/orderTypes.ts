/* =========================
   ORDER TYPES
========================= */

export type OrderType =
  | "PASSPORT_PHOTO"
  | "DOCUMENT_PRINT"
  | "PHOTO_PRINT"
  | "FOAM_BOARD"
  | "CERTIFICATE_PRINT"
  | "STICKER_PRINT"
  | "CANVAS_PRINT"
  | "BUSINESS_CARD"
  | "FLYER_PRINT"
  | "GREETING_CARD_PRINT"
  | "MUG_PRINT"
  | "T_SHIRT_PRINT"
  | "MENU_PRINT"
  | "BROCHURE_PRINT"
  | "STORE_PRODUCT";

export type PaymentStatus = "CAPTURED" | "PENDING" | "FAILED";

export type FulfillmentStatus = "UNFULFILLED" | "FULFILLED";

/* =========================
   MAIN ORDER
========================= */

export interface Order {
  _id: string;
  id: string;
  seq: number;

  orderNumber: string;
  transactionNumber: string;
  currency: string;
  order_type: OrderType;

  customer: Customer;
  payment: Payment;
  fulfillment: Fulfillment;
  totals: Totals;

  items: OrderItem[];

  deletedAt: string | null;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;

  __v: number;
}

/* =========================
   CUSTOMER
========================= */

export interface Customer {
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  area: string | null;
  city: string | null;
  address: string | null;
  comments: string | null;
  privacy?: string | null; // NEW
  country: string | null;
  apartment: string | null;
}

/* =========================
   PAYMENT
========================= */

export interface Payment {
  status: PaymentStatus;
  chg_id: string;
  token: string;
  receipt_number: string | null;
}

/* =========================
   FULFILLMENT
========================= */

export interface Fulfillment {
  status: FulfillmentStatus;
  fulfilled_at: string | null;
}

/* =========================
   TOTALS
========================= */

export interface Totals {
  price: string;
  delivery_charges: number | null; // UPDATED
  free_delivery: boolean | null; // UPDATED
  min_order_price: string | null;
  items: unknown[] | null;
}

/* =========================
   ITEMS (Discriminated Union)
========================= */

export type OrderItem = PassportPhotoItem | DocumentPrintItem | PhotoPrintItem;

/* =========================
   PASSPORT PHOTO ITEM
========================= */

export interface PassportPhotoItem {
  type: "PASSPORT_PHOTO";
  price: string;
  files: BasicFileItem[];
  template: string | null;
  data: {
    service: string;
    purpose: string;
    numberOfPeople: string;
    number_of_photos_required_per_person?: string;
  };
}

/* =========================
   DOCUMENT PRINT ITEM
========================= */

export interface DocumentPrintItem {
  type: OrderType;
  price: string | null;
  files: BasicFileItem[];
  template: string | null;
  data: {
    prices: unknown[];
    sizes: unknown[];
  };
}

/* =========================
   PHOTO PRINT ITEM (NEW)
========================= */

export interface PhotoPrintItem {
  type: "PHOTO_PRINT";
  price: string;
  files: PhotoPrintFileItem[];
  template: string | null;
  data: {
    prices: PhotoPrintPrice[];
    sizes: unknown[];
  };
}

/* =========================
   FILE TYPES
========================= */

export interface BasicFileItem {
  name: string;
  path: string;
  id: string;
}

export interface PhotoPrintFileItem extends BasicFileItem {
  count: number;
  size: string;
  dimension: string;
  paperType: string;
  lamination?: string;
  laminationUnitPrice?: number;
}

/* =========================
   PHOTO PRINT PRICE
========================= */

export interface PhotoPrintPrice {
  size: string;
  count: number;
  unitPrice: number;
  price: number;
  compare_at_price: number;
  lamination_total?: number;
}

/* =========================
   HELPERS
========================= */

// PASSPORT PHOTO SERVICE INFO
export const getPspOrderService = (order: Order) => {
  const service = order?.items?.find(
    (item): item is PassportPhotoItem => item.type === "PASSPORT_PHOTO",
  );

  return {
    service: service?.data?.service || "",
    number_of_people: service?.data?.numberOfPeople || "",
    number_of_photos_required_per_person:
      service?.data?.number_of_photos_required_per_person || "",
    purpose: service?.data?.purpose || "",
  };
};

// CUSTOMER INFO
export const getCustomerInfo = (order: Order) => {
  return {
    first_name: order?.customer?.firstname || "",
    last_name: order?.customer?.lastname || "",
    email: order?.customer?.email || "",
    phone: order?.customer?.phone || "",
    area: order?.customer?.area || "",
    city: order?.customer?.city || "",
    address: order?.customer?.address || "",
    any_comments: order?.customer?.comments || "",
    privacy_preference: order?.customer?.privacy || "",
    country: order?.customer?.country || "",
    apartment: order?.customer?.apartment || "",
  };
};

export const getPaymentDetails = (order: Order) => {
  const obj = {
    order_id: order?.id,
    order_number: order?.orderNumber,
    transaction_id: order?.transactionNumber,
    currency: order?.currency,
    value: Number(order?.totals?.price),
    shipping: order?.totals?.free_delivery
      ? 0
      : order?.totals?.delivery_charges
        ? Number(order?.totals?.delivery_charges)
        : 0,
  };
  return obj;
};

export const getPpdOrderSizes = (order: Order) => {
  const photo_print_item = order?.items?.find(
    (item): item is PhotoPrintItem => item.type === "PHOTO_PRINT",
  );
  return {
    photo_sizes: photo_print_item?.data?.prices,
  };
};

export const getPdpOrderSizes = (order: Order) => {
  const document_print_item = order?.items?.find(
    (item): item is DocumentPrintItem => item.type === "DOCUMENT_PRINT",
  );
  return {
    upload_types: document_print_item?.data?.prices,
  };
};

export const getServicesOrderPrices = (order: Order, type: OrderType) => {
  const service = order?.items?.find(
    (item): item is DocumentPrintItem => item.type === type,
  );
  return service?.data?.prices;
};

export const getServicesOrderFiles = (order: Order, type: OrderType) => {
  const service = order?.items?.find(
    (item): item is DocumentPrintItem => item.type === type,
  );
  return service?.files
    ? service?.files
    : service?.data?.sizes
      ? service?.data?.sizes
      : [];
};
