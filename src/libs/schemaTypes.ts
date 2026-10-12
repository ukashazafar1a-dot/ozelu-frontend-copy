// Generalized structure for any image data
export interface Image {
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
  createdAt?: string;
  updatedAt?: string;
}

// General settings object with dynamic keys
export interface SectionSettings {
  [key: string]: any;
}

// A single block inside a section, supporting different types and settings
export interface SectionBlock {
  type: string; // e.g., "card", "list", etc.
  settings: SectionSettings; // Flexible settings specific to the block
}

// The main section type
export interface Section {
  settings: SectionSettings; // General settings for the section
  blocks: SectionBlock[]; // A list of dynamic blocks
}

type SectionNames =
  | "coverPhoto"
  | "heroBanner"
  | "richtext"
  | "types"
  | "displayoptions"
  | "mountingoptions"
  | "benefits"
  | "sizechart"
  | "measurementchart"
  | "delivery"
  | "collection"
  | "framesCollection"
  | "faqs"
  | (string & {}); // Extendable for future sections

export type SectionsObject = {
  [K in SectionNames]?: Section;
};

