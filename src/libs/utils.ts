import {
  Image,
  PhotoPrintSizeType,
  Requirement,
} from "./types";

export const maxImageSize = 10 * 1024 * 1024; // 10MB
export const paperType = "Lustre Paper";
export type paperType = "Glossy Paper" | "Lustre Paper" | "Matt Paper";
export const paperTypes: paperType[] = [
  "Glossy Paper",
  "Lustre Paper",
  "Matt Paper",
];
export const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const returnTagName = (text: string): string => {
  // Split the string by "::"
  const parts = text.split("::").pop();
  if (!parts) return text;
  // Replace "-" with spaces, and capitalize each word
  const formattedTagName = parts
    .replace(/-/g, " ") // Replace all '-' with space
    .split(" ") // Split by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(" "); // Join the words back with space
  return formattedTagName;
};

export const checkFileSize = (file: File): boolean => {
  if (!file) {
    throw new Error("File is required");
  }
  if (typeof maxImageSize !== "number" || maxImageSize <= 0) {
    throw new Error("maxImageSize must be a positive number");
  }
  return file.size > maxImageSize;
};

export const getRequirementValue = (
  key: string,
  requirements: Requirement[] | null
) => {
  if (key && requirements) {
    const requirement = requirements?.find(
      (requirement) => requirement?.key === key
    );
    return requirement ? requirement.value : null;
  } else {
    return null;
  }
};

export const sortArrayAlphabetically = (array: any[]) => {
  const sortedAreas = array?.sort((a: any, b: any) => {
    if (a?.name < b?.name) {
      return -1;
    }
    if (a?.name > b?.name) {
      return 1;
    }
    return 0;
  });
  return sortedAreas;
};

/**
 * Generate Cloudinary URLs for responsive images
 */
export const generateImageSources = (image: Image) => {
  if (!image.src || !image.height || !image.width) {
    throw new Error(
      "Invalid image object. Ensure src, height, and width are defined."
    );
  }

  const baseUrl = image.src.split("/upload/"); // Split the URL at the 'upload/' part
  if (baseUrl.length !== 2) {
    return {
      dataSrc: image?.src,
      srcSet: []
    }
    // throw new Error("Invalid Cloudinary URL format.");
  }

  const [cloudinaryRoot, imagePath] = baseUrl;

  const cloudinaryRootWithHttps = cloudinaryRoot
    ?.replace("http://", "https://")
    .replace("https://", "https://")
    .replace("httpss://", "https://");

  // Define common breakpoints for responsive images
  const breakpoints = [240, 320, 480, 640, 800, 1024, 1600, 1920];

  const srcSet = breakpoints
    .map((width) => {
      const height = Math.round((width / image.width) * image.height);
      const transformedUrl = `${cloudinaryRootWithHttps}/upload/w_${width},h_${height},c_fill/${imagePath}`;
      return `${transformedUrl} ${width}w`;
    })
    .join(", ");

  // Generate a default src
  const defaultWidth = 800;
  const defaultHeight = Math.round((defaultWidth / image.width) * image.height);
  const dataSrc = `${cloudinaryRootWithHttps}/upload/w_${defaultWidth},h_${defaultHeight},c_fill/${imagePath}`;

  return {
    dataSrc,
    srcSet,
  };
};

export const getUniqueRanges = (
  printTypes: Array<{ prices?: { range: string }[] }> | null | undefined
): string[] => {
  if (!printTypes) return [];
  const uniqueRanges: Set<string> = new Set();
  // Iterate through the list and add ranges to the set
  printTypes.forEach((printType) => {
    printType?.prices?.forEach((priceRange) => {
      if (!uniqueRanges.has(priceRange.range)) {
        uniqueRanges.add(priceRange.range);
      }
    });
  });

  // Return the ranges in the order they were encountered
  return Array.from(uniqueRanges);
};

export const getUniqueDiscounts = (sizes: PhotoPrintSizeType[]): number[] => {
  if (!sizes) return [];
  const uniqueDiscounts: Set<number> = new Set();
  // Iterate through the list and add ranges to the set
  sizes.forEach((size) => {
    size?.discounts.forEach((discount) => {
      if (!uniqueDiscounts.has(discount.percentage)) {
        uniqueDiscounts.add(discount.percentage);
      }
    });
  });

  // Return the ranges in the order they were encountered
  return Array.from(uniqueDiscounts);
};

export class SentryCustomError extends Error {
  constructor(message:any, context= {}){
    super(message);
    this.name = "Custom Error";
    this.cause = context;
  }
}

export const toggleAccordian = (event: any) => {
  const element = event.target;
  if (element.classList.contains("active-btn")) {
    element.classList.remove("active-btn");
  } else {
    element.classList.add("active-btn");
  }
  const panel = element.nextElementSibling;
  const parent = element.parentElement;
  if (parent.classList.contains("active-panel")) {
    parent.classList.remove("active-panel");
  } else {
    parent.classList.add("active-panel");
  }
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
    panel.classList.remove("active-panel");
  } else {
    panel.classList.add("active-panel");
    panel.style.maxHeight = "100%";
  }
};
