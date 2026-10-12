export type FormFields =
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
 | "A3 Print"
 
  | (string & {});

export type FormNames =
  | "Canvas Printing"
  | "Foam Board Panels Printing"
  | "Business Cards Printing"
  | "Certificates Printing"
  | "Stickers Printing"
  | "Passport Size Photos"
  | "Photos Printing"
  | "Documents Printing"
  | "Flyers Printing"
  | "Greeting Cards Printing"
  | "Mugs Printing"
  | "T-Shirts Printing"
  | "Menu Printing"
  | "Brochures Printing"
  | (string & {});

export type FormIds = {
  [key in FormNames]: string;
};

export const formIds: FormIds = {
  "Passport Size Photos": "001",
  "Photos Printing": "002",
  "Documents Printing": "003",
  "Canvas Printing": "004",
  "Foam Board Panels Printing": "005",
  "Business Cards Printing": "006",
  "Certificates Printing": "007",
  "Stickers Printing": "008",
  "Flyers Printing": "010",
  "Greeting Cards Printing": "011",
  "Mugs Printing": "012",
  "T-Shirts Printing": "013",
  "Menu Printing": "014",
  "Brochures Printing": "015",
} as const;

export interface PhotoItem {
  name: string;
  path: string;
  id: string;
  count: number;
  size: string;
  sizeId: string;
  dimension: string;
}

export interface SizeItem {
  _id: string;
  name: string;
  type: string;
  thickness: string | null;
  frame: string | null;
  design: string | null;
  count: number;
  price: number;
  framePrice: number;
  photos: PhotoItem[];
}

export type OrderObject = {
  _id: string;
  orderNumber: string;
  transactionNumber: string;
  currency: string;
  photos: PhotoItem[];
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  area: string;
  city: string;
  address: string;
  privacy: string;
  comments: string;
  sizes: SizeItem[];
  price: string;
  delivery_charges: number;
  free_delivery: boolean;
  status: "CAPTURED" | "PENDING" | "FAILED" | string;
  fulfillment_status:
    | "FULFILLED"
    | "UNFULFILLED"
    | "PARTIALLY_FULFILLED"
    | string;
  fulfilled_at: string | null;
  receipt_number: string | null;
  chg_id: string;
  token: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  photoSizes?: any;
  prices?: any;
};

// get the form id and name
export const getFormInfo = (name: FormNames) => {
  return {
    form_id: formIds[name],
    form_name: name,
  };
};
