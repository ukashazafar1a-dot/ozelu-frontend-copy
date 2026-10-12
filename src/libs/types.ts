export type Image = {
  _id: string;
  alt: string;
  src: string;
  media_type: string;
  public_id: string;
  height: number;
  width: number;
  aspect_ratio: number;
  position: number;
  __v: number;
};

export type Variant = {
  title: string;
  price: number;
  compare_at_price: number;
  featured_image: Image;
  options: any[]; // You could add a more specific type here if needed.
  option1: string | null;
  option2: string | null;
  option3: string | null;
  quantity: number;
  _id: string;
  sku: string | undefined;
};

export type Collection = {
  _id: string;
  isActive: boolean;
  title: string;
  body_html: string;
  slug: string;
  tags: string[];
  page_title: string;
  meta_description: string;
  __v: number;
  featured_image: Image;
  totalProducts: number;
  id: string;
};

export type Product = {
  _id: string;
  isActive: boolean;
  title: string;
  description: string;
  template: string;
  quantity: number;
  taxable: boolean;
  type: string | null;
  vendor: string | null;
  price: number;
  compare_at_price: number;
  tags: string[];
  options: any[]; // You could add a more specific type for the options.
  sales: number;
  images: Image[];
  variants: Variant[];
  page_title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  featured_image: string;
  meta_description: string | undefined;
  size_chart: string;
  sku: string | undefined;
  collection: Collection;
};

// Photo Requirement Page
export interface Requirement {
  key: string;
  value: string | null;
  position: number;
  _id: string;
}

export interface RequirementImage {
  _id: string;
  name: string;
  format: string;
  size: number;
  alt: string;
  src: string;
  media_type: string;
  public_id: string;
  height: number;
  width: number;
  aspect_ratio: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PhotoRequirements {
  _id: string;
  isActive: boolean;
  country: string;
  title: string;
  requirements: Requirement[] | null;
  before_image: RequirementImage | null;
  after_image: RequirementImage | null;
  slug: string;
  page_title: string;
  meta_description: string;
  __v: number;
}

export interface PageDataOption {
  size: string;
  type: string;
  price: number;
  _id: string;
}

export type DocumentSpecs = {
  type: string;
  a3_price: number;
  a4_price: number;
  a4_max_pages?: number;
  a3_max_pages?: number;
  _id: string;
};

export type PrintPriceRange = {
  price: number; // The price for the range
  range: string; // The range string (e.g., "1-200", ">1000")
  _id: string; // The unique identifier for the range
};

export type PhotoPrintDiscount = {
  percentage: number;
  range: string;
};

export type PhotoPrintSizeType = {
  name: string;
  width: number;
  height: number;
  width_in_inches: number;
  height_in_inches: number;
  price: number;
  discounts: PhotoPrintDiscount[];
  _id: string;
};

export type MugPriceTier = {
  range: string;
  price: number;
};

export type MugPriceType = {
  value: string;
  image?: string;
  prices: MugPriceTier[];
  _id?: string;
};

export type TShirtPriceRow = {
  print_type: string;
  value: string;
  prices: MugPriceTier[];
  _id?: string;
};

export type TShirtColor = { value: string; image?: string | { src?: string } };
export type TShirtPlacement = {
  value: string;
  price?: number;
  prices?: { range: string; price: number }[];
};
export type TShirtSize = { value: string };

export type TShirtSizeStock = {
  value: string;
  quantity: number;
};

export type TShirtTypeCatalogColor = {
  value: string;
  image?: string | { src?: string };
  sizes?: TShirtSize[];
  /** Per-size stock: omit size = unavailable; 0 = out of stock; >0 = qty */
  size_stock?: TShirtSizeStock[];
};

export type TShirtTypeCatalogEntry = {
  value: string;
  label?: string;
  isActive?: boolean;
  sizes?: TShirtSize[];
  colors?: TShirtTypeCatalogColor[];
};

export type TShirtSizeOption = {
  value: string;
  quantity?: number;
  available?: boolean;
  outOfStock?: boolean;
};

export type VolumePriceType = {
  type: string; // Type of print (e.g., "Black & White Print")
  size: string; // Size of the print (e.g., "A4")
  prices: PrintPriceRange[]; // Array of price ranges
  _id: string; // Unique identifier for the print type
};

export type FbsThick = {
  value: number;
  price: number;
  _id: string;
};
export type FoadBoardSize = {
  name: string;
  width: number;
  height: number;
  width_in_inches: number;
  height_in_inches: number;
  thicknesses: FbsThick[];
  _id: string;
};

export type FoamBoardOptionMatrixRow = {
  type: string;
  prices: Record<string, number>;
  _id?: string;
};

// Stickers Printing Types
export type StickerDiscount = {
  percentage: number;
  range: string;
  _id: string;
};

export type StickerShape = {
  value: string;
  price: number;
  discounts: StickerDiscount[];
  _id: string;
};

export type StickerMaterial = {
  type: string;
  shapes: StickerShape[];
  _id: string;
};

export type StickerFinishingType = {
  value: string;
  price: number;
  _id: string;
};

// Certificate Printing Types
export type PrintingDiscount = {
  price: number;
  range: string;
  _id: string;
};

export type CertificatePrintType = {
  value: string;
  price: number;
  discounts: PrintingDiscount[];
  _id: string;
};

export type CertificatePrintSize = {
  name: string;
  width: number;
  height: number;
  types: CertificatePrintType[];
  _id: string;
};

// Business card types
export type CardQuantity = {
  price: number;
  value: number;
  _id: string;
};

export type BusinessCardType = {
  value: string;
  price: number;
  quantities: CardQuantity[];
  _id: string;
};

export type BusinessCardSize = {
  name: string;
  width: number;
  height: number;
  types: BusinessCardType[];
  _id: string;
};

export type GreetingCardDiscount = {
  percentage: number;
  range: string;
};

export type GreetingCardType = {
  value: string;
  price: number;
  discounts?: GreetingCardDiscount[];
  _id?: string;
};

export type GreetingCardSize = {
  name: string;
  width: number;
  height: number;
  width_in_inches?: number;
  height_in_inches?: number;
  types: GreetingCardType[];
  _id: string;
};

// Flyers printing types
export type FlyerQuantity = {
  value: number;
  single_side_price: number;
  double_side_price: number;
  _id: string;
};

export type FlyerType = {
  value: string;
  price: number;
  quantities: FlyerQuantity[];
  _id: string;
};

export type FlyerSize = {
  name: string;
  width: number;
  height: number;
  types: FlyerType[];
  _id: string;
};

// Menu printing types
export type MenuQuantityPrice = {
  value: number;
  price: number;
};

export type MenuPriceColumn = {
  key: string;
  label: string;
  width_cm?: number;
  height_cm?: number;
  open_size_label?: string;
  quantities: MenuQuantityPrice[];
};

/** @deprecated Legacy nested shape — storefront/admin now use flat `columns`. */
export type MenuPaperType = {
  value: string;
  label: string;
  columns: MenuPriceColumn[];
};

export type MenuPrice = {
  value: string;
  label: string;
  columns?: MenuPriceColumn[];
  /** Legacy only — prefer `columns` after flatten. */
  paper_types?: MenuPaperType[];
};

export type BrochureQuantityPrice = {
  value: number;
  price: number;
};

export type BrochurePriceColumn = {
  key: string;
  label: string;
  quantities: BrochureQuantityPrice[];
};

export type BrochurePrice = {
  value: string;
  label: string;
  kind: string;
  format: string;
  columns: BrochurePriceColumn[];
};

export type MenuFinishingType = {
  key: string;
  label: string;
  is_none?: boolean;
};

export type MenuLaminationQuantity = {
  value: number;
  not_laminated?: number;
  gloss?: number | null;
  matte?: number | null;
  [finishKey: string]: number | null | undefined;
};

export type MenuLaminationPrice = {
  menu_type_value: string;
  column_key: string;
  quantities: MenuLaminationQuantity[];
};

// Canvas printing types
export type CanvasPrintingType = {
  _id: string;
  name: string;
  image: Image | null;
  hasThickness: boolean;
  hasFrame: boolean;
}

export type CanvasPrintingSize = {
  _id: string;
  name: string;
  width: number;
  height: number;
}

export type CanvasPrintingThickness = {
  _id: string;
  value: number;
  image: Image | null;
}

export type CanvasPrintingFrame = {
  _id: string;
  name: string;
  image: Image | null;
}

export type CanvasPrintingDesign = {
  _id: string;
  name: string;
  image: Image | null;
}

export type CanvasFramingType = {
  _id: string;
  name: string;
  image: Image | null;
}

export interface PageData {
  _id: string;
  isActive: boolean;
  slug: string;
  sizes?: any[]; // Replace `any` with a specific type if you know the structure of the `sizes` array
  options?: any[]; // Replace `any` with a specific type if you know the structure of the `options` array
  __v: number;
  meta_description: string;
  page_title: string;
  min_price: number;
  free_delivery_threshold?: number;
  alert_message?: string | null;
  document_bindings?: DocumentSpecs[];
  document_laminations?: DocumentSpecs[];
  document_volume_prices?: VolumePriceType[];
  passportsize_page_cities?: string[];
  collections?: any;
  collections_positions?: any;
  foam_board_sizes?: FoadBoardSize[];
  foam_board_display_options?: FoamBoardOptionMatrixRow[];
  foam_board_mounting_options?: FoamBoardOptionMatrixRow[];
  foam_board_laminations?: FoamBoardOptionMatrixRow[];
  stickers_a4_sheet_size?: {
    width: number;
    height: number;
  };
  stickers_prices?: StickerMaterial[];
  stickers_finishing_types?: StickerFinishingType[];
  certificates_prices: CertificatePrintSize[];
  business_cards_prices: BusinessCardSize[];
  business_cards_finishing_types: StickerFinishingType[];
  flyers_prices?: FlyerSize[];
  flyers_finishing_types?: StickerFinishingType[];
  menu_prices?: MenuPrice[];
  menu_lamination_prices?: MenuLaminationPrice[];
  menu_finishing_types?: MenuFinishingType[];
  brochure_prices?: BrochurePrice[];
  greeting_cards_prices?: GreetingCardSize[];
  greeting_cards_finishing_types?: StickerFinishingType[];
  greeting_cards_featured_collection?: {
    products?: any[];
    products_positions?: any[];
  };
  mugs_prices?: MugPriceType[];
  t_shirts_prices?: TShirtPriceRow[];
  t_shirts_colors?: TShirtColor[];
  t_shirts_print_placements?: TShirtPlacement[];
  t_shirts_sizes?: TShirtSize[];
  t_shirts_type_catalog?: TShirtTypeCatalogEntry[];
  mugs_featured_collection?: {
    products?: any[];
    products_positions?: any[];
  };
  photos_featured_collection?: {
    products?: any[];
    products_positions?: any[];
  };
  //Canvas printing fields
  print_types?: CanvasPrintingType[];
  edge_designs?: CanvasPrintingDesign[];
  framing_types?: CanvasFramingType[];
  frames?: CanvasPrintingFrame[];
  thicknesses?: CanvasPrintingThickness[];
  frame_prices?: any[];
  prices?: any[];
  photo_laminations?: any[];
  photo_polaroid_styles?: any[];
  paper_types?: string[];
}

export type DeliveryArea = {
  _id: string;
  name: string;
  areaset: number;
  __v: number;
  city: string;
};
