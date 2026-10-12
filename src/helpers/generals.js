import { traceDeprecation } from "process";
import React from "react";
import { notFound } from "next/navigation";
import { baseURL } from "@/libs/utils";

export const htmlDecode = function (input) {
  // Check if the code is running in the browser environment
  if (typeof document !== "undefined") {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = input;
    return textArea.value;
  }
  // If not running in the browser, return the input as is
  return input;
};
export const htmlEncode = function (input) {
  if (document) {
    const textArea = document?.createElement("textarea");
    textArea.innerText = input;
    return textArea.innerHTML.split("<br>").join("\n");
  } else {
    return input;
  }
};
export const sanitizeDescription = (input) => {
  // Decode HTML entities first
  const decoded = htmlDecode(input);
  // Remove all HTML tags using a regular expression
  const sanitized = decoded?.replace(/<[^>]*>/g, "");
  // Trim to the first 1000 characters
  return sanitized?.slice(0, 1000);
};

/** Normalize step body HTML so descriptions align (photo-printing uses single <p> blocks). */
export const normalizeStepBodyHtml = (input) => {
  if (!input || typeof input !== "string") return input || "";
  let html = htmlDecode(input).trim();
  if (!html) return "";

  html = html.replace(/<p\b[^>]*>\s*(?:<br\s*\/?>\s*)*<\/p>/gi, "");

  const divMatch = html.match(/^<div\b[^>]*>([\s\S]*?)<\/div>$/i);
  if (divMatch) {
    html = `<p>${divMatch[1].trim()}</p>`;
  }

  return html.trim();
};

/** Split step richtext into subtitle (first paragraph) and remaining body copy. */
export const splitStepContent = (input) => {
  if (!input || typeof input !== "string") {
    return { subtitle: "", content: "" };
  }
  const decoded = htmlDecode(input).trim();
  const match = decoded.match(/^(\s*<p\b[^>]*>[\s\S]*?<\/p>)([\s\S]*)$/i);
  if (match) {
    return { subtitle: match[1].trim(), content: match[2].trim() };
  }
  return { subtitle: "", content: decoded };
};
function generateCloudinarySrcset(imageSrc, widths) {
  // Split the provided widths string into an array of widths
  const widthArray = widths.split(",").map((width) => width.trim());

  // Generate the srcset string for each width
  const srcset = widthArray.map((width) => {
    // Add the width parameter to the Cloudinary URL
    const imageUrl = imageSrc.replace("/upload", `/upload/c_fill,w_${width}`);
    // Combine the URL with the width and add it to the srcset
    return `${imageUrl} ${width}w`;
  });

  // Join the srcset strings with commas
  return srcset.join(", ");
}

export const returnImage = function (
  image,
  optional = "image--class",
  width = 1200,
  loading = "lazy"
) {
  //console.log(image)
  if (image && image !== "undefined") {
    const availableWidths = [256, 512, 786, 1024, 1280];
    const srcset = availableWidths
      .map(
        (w) =>
          `${image?.src.replace(
            "upload/",
            `upload/f_auto,w_${w},c_fill/`
          )} ${w}w`
      )
      .join(",");
    const effectiveWidth = width || 1280;
    const nearestWidth = availableWidths.reduce((prev, curr) =>
      Math.abs(curr - effectiveWidth) < Math.abs(prev - effectiveWidth)
        ? curr
        : prev
    );
    const url = image?.src?.replace(
      "upload/",
      `upload/f_auto,w_${nearestWidth},c_fill/`
    );
    const nearestUrl = url
      ?.replace("http://", "https://")
      .replace("https://", "https://")
      .replace("httpss://", "https://");
    return (
      <img
        src={nearestUrl}
        data-src={nearestUrl}
        alt={image?.alt ? image?.alt : "Demo Print Shop"}
        loading={loading}
        width={width ? width : ""}
        height={""}
        className={`${optional ? optional : ""} lazyload`}
      />
    );
  } else {
    return (
      <img
        src="https://placehold.co/600x400?text=Demo"
        data-src="https://placehold.co/600x400?text=Demo"
        alt="Placholder for Images - Demo"
        loading={loading}
        width=""
        height=""
        className={`${optional ? optional : ""} lazyload`}
      />
    );
  }
};

export const NewlineText = function (props) {
  const text = props.text;
  return (
    <>
      {text.split("*").map((str, i) => {
        if (i === 0) return str;
        return (
          <React.Fragment key={i}>
            <br />
            {str}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const handleInnerMouseEnter = (e) => {
  const elem = e.currentTarget.querySelector(".dropdown-menu");
  if (!elem.classList.contains("show")) {
    elem.classList.add("show");
  }
};

export const handleInnerMouseLeave = (e) => {
  const elem = e.currentTarget.querySelector(".dropdown-menu");
  if (elem.classList.contains("show")) {
    elem.classList.remove("show");
  }
};

export const dateFormatter = (e) => {
  const date = new Date(e);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedDate = `${
    months[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;
  //console.log(formattedDate);
  return formattedDate;
};


const getAssetsRevalidate = () =>
  process.env.NODE_ENV === "development" ? 0 : 300;

export const getData = async (slug) => {
  try {
    // Next.js caches this fetch. In production (revalidate: 300) the page can
    // lag the API by up to ~5 minutes. In development, fetch fresh every time
    // so admin Customize changes show after a normal refresh.
    const res = await fetch(`${baseURL}/api/assets/page/settings/${slug}`,{
      next:{
        revalidate: getAssetsRevalidate(),
      }
    });
    const result = await res?.json();
    if (!result?.status) {
      console.log("request status", res?.status, result);
      return notFound();
    }
    return result;
  } catch (error) {
    console.log("Error in getData()", error);
    return notFound();
  }
};

export const isPortrait = (file) => {
  if(file.type === 'image/heic' || file.type === 'application/pdf') return new Promise((resolve) => {
    resolve('portrait');
  })
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // console.log("IMG",img)
      const { naturalWidth, naturalHeight } = img;
      const orientation =
        naturalWidth > naturalHeight ? "landscape" : "portrait";
      resolve(orientation);
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
};

export function checkFileSizeValidity(files) {
  let isValid = true;
  files.forEach((file) => {
    if (file.size > 10 * 1024 * 1024) isValid = false;
  });
  return isValid;
}

export function getFilesCalculatedPrice(files, fee) {
  let price = 0;
  const validFiles = getValidFiles(files);
  validFiles.forEach((item) => {
    price = price + item.count * item.pages * fee;
  });
  return price;
}

export function getFilesLaminationPrice(files, prices, type) {
  if (!["a3", "a4"].includes(type)) {
      throw new Error("Invalid type. Must be 'a3' or 'a4'.");
  }
  const validFiles = getValidFiles(files)

  // Filter out only valid laminations from the files
  const laminationData = validFiles.reduce((acc, file) => {
      const laminationType = file.lamination;

      if (laminationType) {
          // Calculate total pages for this file
          const totalPages = file.count * file.pages;

          // Add or update the lamination type in the accumulator
          if (!acc[laminationType]) {
              acc[laminationType] = { totalPages: 0, pricePerUnit: 0 };
          }

          acc[laminationType].totalPages += totalPages;
      }
      return acc;
  }, {});

  // Map lamination types to their prices
  const result = Object.entries(laminationData).map(([laminationType, data]) => {
      // Find the price for the current lamination type
      const priceData = prices.find(price => price.type === laminationType);
      if (priceData) {
          // Select the price based on the provided type (a3 or a4)
          const pricePerUnit = priceData[`${type}_price`] || 0;
          data.pricePerUnit = pricePerUnit;

          return {
              type,
              laminationType,
              totalPages: data.totalPages,
              pricePerUnit,
              totalPrice: data.totalPages * pricePerUnit,
          };
      }
      return null; // Skip laminations with no price data
  }).filter(Boolean); // Remove null entries

  return result;
}

function isDoubleSidedPrinting(duplex) {
  return duplex === true || duplex === "true";
}

/** Physical sheet count for binding: double-sided uses 2 pages per sheet. */
function getBindingSheetCount(pages, duplex) {
  const pageCount = Number(pages) || 0;
  if (pageCount < 1) return 0;
  return isDoubleSidedPrinting(duplex)
    ? Math.ceil(pageCount / 2)
    : pageCount;
}

export function getBindingPrices(files, bindings, type) {
  if (!["a3", "a4"].includes(type)) {
      throw new Error("Invalid type. Must be 'a3' or 'a4'.");
  }

  const validFiles = getValidFiles(files)

  // Filter out only valid bindings from the files
  const bindingData = validFiles.reduce((acc, file) => {
      const bindingType = file.binding;

      if (bindingType) {
          const priceData = bindings.find((binding) => binding.type === bindingType);
          const maxKey = type === 'a4' ? 'a4_max_pages' : 'a3_max_pages';
          let maxSheets = Number(priceData?.[maxKey]);
          if (!Number.isFinite(maxSheets) || maxSheets < 1) {
              maxSheets = 100;
          }

          const sheetCount = getBindingSheetCount(file.pages, file.duplex);
          const fileCount = file.count || 1; // Default to 1 if count is not specified
          const bindingMultiplier =
              sheetCount <= maxSheets ? 1 : Math.ceil(sheetCount / maxSheets);

          // Add or update the binding type in the accumulator
          if (!acc[bindingType]) {
              acc[bindingType] = { totalMultiplier: 0, pricePerUnit: 0 };
          }

          acc[bindingType].totalMultiplier += bindingMultiplier * fileCount; // Include file count in multiplier
      }
      return acc;
  }, {});

  // Map binding types to their prices
  const result = Object.entries(bindingData).map(([bindingType, data]) => {
      // Find the price for the current binding type
      const priceData = bindings.find(binding => binding.type === bindingType);
      if (priceData) {
          // Select the price based on the provided type (a3 or a4)
          const pricePerUnit = priceData[`${type}_price`] || 0;
          data.pricePerUnit = pricePerUnit;

          return {
              type,
              bindingType,
              totalMultiplier: data.totalMultiplier, // Total binding multipliers
              pricePerUnit,
              totalPrice: data.totalMultiplier * pricePerUnit,
          };
      }
      return null; // Skip bindings with no price data
  }).filter(Boolean); // Remove null entries

  return result;
}

function getPrice(pageSize, priceData) {
  let defaultPrice = 0;
  let selectedPrice = null;

  for (const item of priceData) {
      const range = item.range;

      // If range is null, set the default price
      if (range === null) {
          defaultPrice = item.price;
          continue;
      }

      // Handle simple ranges with "-" like "1-200"
      if (range.includes("-")) {
          const [low, high] = range.split("-").map(Number);
          if (pageSize >= low && pageSize <= high) {
              selectedPrice = { price: item.price };
          }
      } 
      // Handle ">" and ">="
      else if (range.startsWith(">")) {
          const isInclusive = range[1] === "=";
          const value = parseInt(range.substring(isInclusive ? 2 : 1), 10);
          if (isInclusive ? pageSize >= value : pageSize > value) {
            // choose the highest threshold that applies
            if(!selectedPrice || value > (selectedPrice._value || 0)){
              selectedPrice = { price: item.price, _value: value };
            }
          }
      } 
      // Handle "<" and "<="
      else if (range.startsWith("<")) {
          const isInclusive = range[1] === "=";
          const value = parseInt(range.substring(isInclusive ? 2 : 1), 10);
          if (isInclusive ? pageSize <= value : pageSize < value) {
              // Choose the lowest threshold that applies
              if(!selectedPrice || value < (selectedPrice._value || Infinity)){
                selectedPrice = { price: item.price, _value: value };
              }
          }
      }
  }

  // Return the best match or default
  return selectedPrice ? selectedPrice.price : defaultPrice;
}

export function getTheRangePrice(pricesObj,size,type,files){
  let selectedObj = pricesObj.filter((item)=>{
    return item.size === size && item.type === type;
  })

  if(selectedObj.length === 0) return 0;

  let pages = 0;
  files.forEach((item) => {
    pages = pages + item.count * item.pages;
  });

  return getPrice(pages,selectedObj[0].prices)

}

export function getMugUnitPrice(mugsPrices, mugTypeValue, quantity) {
  const row = (mugsPrices || []).find((m) => m.value === mugTypeValue);
  const qty = Number(quantity);
  if (!row || !Number.isFinite(qty) || qty < 1) return 0;
  return getPrice(qty, row.prices || []);
}

export function getMugLinePrice(mugsPrices, mugTypeValue, quantity) {
  const row = (mugsPrices || []).find((m) => m.value === mugTypeValue);
  const qty = Number(quantity);
  if (!row || !Number.isFinite(qty) || qty < 1) return 0;
  const unitPrice = getPrice(qty, row.prices || []);
  return parseFloat((unitPrice * qty).toFixed(2));
}

export function getTShirtUnitPrice(tShirtsPrices, printType, shirtTypeValue, quantity) {
  const row = (tShirtsPrices || []).find(
    (r) => r.print_type === printType && r.value === shirtTypeValue
  );
  const qty = Number(quantity);
  if (!row || !Number.isFinite(qty) || qty < 1) return 0;
  return getPrice(qty, row.prices || []);
}

export function getTShirtLinePrintPrice(tShirtsPrices, printType, shirtTypeValue, quantity) {
  const unit = getTShirtUnitPrice(tShirtsPrices, printType, shirtTypeValue, quantity);
  return parseFloat((unit * Number(quantity)).toFixed(2));
}

export function getPlacementUnitPrice(placements, placementValue, quantity = 1) {
  const row = (placements || []).find((p) => p.value === placementValue);
  if (!row) return 0;
  if (Array.isArray(row.prices) && row.prices.length) {
    return getPrice(Number(quantity) || 0, row.prices);
  }
  return Number(row.price) || 0;
}

export function getPlacementPrice(placements, placementValue) {
  return getPlacementUnitPrice(placements, placementValue, 1);
}

export function getTShirtBlockTotalQuantity(variants) {
  return (variants || []).reduce((sum, variant) => {
    const qty = Number(variant?.quantity);
    if (
      !variant?.shirt_size ||
      !Number.isFinite(qty) ||
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return sum;
    }
    return sum + qty;
  }, 0);
}

function getSelectedPlacementRows(placementRows) {
  return (placementRows || []).filter((row) => row?.placement);
}

export function calculateTShirtExtraPlacementTotal(
  placements,
  placementRows,
  variants
) {
  const blockQty = getTShirtBlockTotalQuantity(variants);
  if (blockQty < 1) return 0;

  const selected = getSelectedPlacementRows(placementRows);
  let total = 0;

  selected.forEach((row, index) => {
    if (index === 0) return;
    const unitPrice = getPlacementUnitPrice(placements, row.placement, blockQty);
    total += unitPrice * blockQty;
  });

  return parseFloat(total.toFixed(2));
}

export function getTShirtPlacementFeeLines(placements, placementRows, variants) {
  const blockQty = getTShirtBlockTotalQuantity(variants);
  const selected = getSelectedPlacementRows(placementRows);

  return selected.map((row, index) => {
    if (index === 0) {
      return {
        placement: row.placement,
        price: 0,
        included: true,
      };
    }

    const unitPrice = getPlacementUnitPrice(placements, row.placement, blockQty);
    return {
      placement: row.placement,
      price: parseFloat((unitPrice * blockQty).toFixed(2)),
      unitPrice,
      included: false,
    };
  });
}

function getCatalogEntry(catalog, shirtTypeValue) {
  if (!shirtTypeValue) return null;
  return (catalog || []).find((entry) => entry.value === shirtTypeValue) || null;
}

export function getColorsForShirtType(catalog, shirtTypeValue, fallbackColors = []) {
  const entry = getCatalogEntry(catalog, shirtTypeValue);
  if (!entry) return fallbackColors || [];
  if (entry.isActive === false) return [];
  if (entry.colors?.length) return entry.colors;
  return fallbackColors || [];
}

export function getSizesForShirtTypeAndColor(
  catalog,
  shirtTypeValue,
  colorValue,
  fallbackSizes = []
) {
  const entry = getCatalogEntry(catalog, shirtTypeValue);
  if (!entry) {
    return (fallbackSizes || []).map((s) => ({
      value: s.value,
      available: true,
      outOfStock: false,
    }));
  }
  if (entry.isActive === false) return [];
  if (!colorValue) return [];

  const colorEntry = (entry.colors || []).find((color) => color.value === colorValue);

  if (colorEntry?.size_stock?.length) {
    return colorEntry.size_stock.map((row) => ({
      value: row.value,
      quantity: row.quantity,
      available: Number(row.quantity) > 0,
      outOfStock: Number(row.quantity) === 0,
    }));
  }

  if (colorEntry?.sizes?.length) {
    return colorEntry.sizes.map((s) => ({
      value: s.value,
      available: true,
      outOfStock: false,
    }));
  }
  if (entry.sizes?.length) {
    return entry.sizes.map((s) => ({
      value: s.value,
      available: true,
      outOfStock: false,
    }));
  }
  return (fallbackSizes || []).map((s) => ({
    value: s.value,
    available: true,
    outOfStock: false,
  }));
}

/** Max qty before "Only X Left" / "N Left" dropdown labels. */
export const T_SHIRT_LOW_STOCK_MAX = 10;

/**
 * Tracked stock for a size option, or null when legacy (no size_stock).
 * @returns {number|null}
 */
export function getTrackedStockQuantity(sizeOption) {
  if (!sizeOption || sizeOption.quantity == null || sizeOption.quantity === "") {
    return null;
  }
  const q = Number(sizeOption.quantity);
  if (!Number.isFinite(q) || !Number.isInteger(q) || q < 0) return null;
  return q;
}

/** True when every size option is tracked and quantity === 0. */
export function isColorFullyOutOfStock(sizeOptions) {
  if (!Array.isArray(sizeOptions) || !sizeOptions.length) return false;
  const tracked = sizeOptions.filter(
    (s) => s && s.quantity != null && s.quantity !== ""
  );
  if (!tracked.length) return false;
  if (tracked.length !== sizeOptions.length) return false;
  return tracked.every((s) => Number(s.quantity) === 0);
}

/** Dropdown option label (menu). Closed control should still show size value only. */
export function formatSizeDropdownLabel(sizeOption) {
  const value = sizeOption?.value || "";
  const q = getTrackedStockQuantity(sizeOption);
  if (q == null) return value;
  if (q === 0) return `${value} - Out of Stock`;
  if (q <= T_SHIRT_LOW_STOCK_MAX) return `${value} - ${q} Left`;
  return value;
}

export function clampOrderQuantityToStock(requestedQty, sizeOption) {
  const q = getTrackedStockQuantity(sizeOption);
  const n = Math.max(0, Math.floor(Number(requestedQty) || 0));
  if (!Number.isFinite(n)) return 0;
  if (q == null) return n;
  return Math.min(n, q);
}

export function isShirtTypeActive(catalog, shirtTypeValue) {
  const entry = getCatalogEntry(catalog, shirtTypeValue);
  if (!entry) return true;
  return entry.isActive !== false;
}

export function getFilesPages(files) {
  let pages = 0;
  files.forEach((file) => {
    pages += file.pages * file.count;
  });
  return pages;
}

export function convertLength(value, unit) {
  if (unit.toLowerCase() === "cm") {
    // Convert from centimeters to inches
    return (value / 2.54).toFixed(1).replace(/\.0$/, "");
  } else if (unit.toLowerCase() === "in") {
    // Convert from inches to centimeters
    return value * 2.54;
  } else {
    // Handle invalid unit
    return "Invalid unit. Please use 'cm' or 'in'.";
  }
}

export function getClosestSize(pages, width, height) {
  // console.log(pages, width, height);
  // const filteredPages = pages.filter(
  //   (page) => page.width >= width && page.height >= height && !page.custom
  // );
  // New Logic to find original and rotated dimensions to find the closest match
  const filteredPages = pages.filter((page) => {
    // Check original dimensions
    const originalMatch = page.width >= width && page.height >= height;
    // Check rotated dimensions
    const rotatedMatch = page.height >= width && page.width >= height;
    return (originalMatch || rotatedMatch) && !page.custom;
  });
  if (filteredPages.length === 0) {
    return null;
  }
  const minWidthPage = filteredPages.reduce((minPage, currentPage) => {
    return currentPage.width < minPage.width ? currentPage : minPage;
  }, filteredPages[0]);
  if (!minWidthPage) return null;
  // Return the nearest page
  return minWidthPage;
}

export function getMaxSize(pages){
  // Find the maximum size of all widths and heights.
  pages = pages.filter((page) => !page.custom);
  const maxWidth = Math.max(...pages.map((page) => page.width));
  const maxHeight = Math.max(...pages.map((page) => page.height));

  return Math.max(maxWidth,maxHeight);
}

export function getSizesMaxDimenstions(pages) {
  // Find the maximum width and height
  pages = pages.filter((page) => !page?.custom);
  //console.log('here is the pages',pages)
  const maxWidth = Math.max(...pages.map((page) => page.width));
  const maxHeight = Math.max(...pages.map((page) => page.height));
  //nsole.log(maxWidth,maxHeight)
  return { maxWidth, maxHeight };
}

export const getAreaSet = (areas, areaName) => {
  var set = 0;
  areas?.find((obj) => {
    if (obj.name == areaName) {
      set = obj.areaset;
      return;
    }
  });
  return set;
};

export const getDeliveryCharges = (prices,area,areas) => {
    if(!area) return 0;
    let areaSet = getAreaSet(areas, area);

    //Calculate Delivery charges per areaset - Start
    let priceObj = prices?.filter((item) => {
      return item.areaset === areaSet;
    });
    if (priceObj.length > 0) {
      return priceObj[0]?.price;
    } else {
      return 0;
    }
}

export const checkFreeDelivery = (price,threshold) => {
  if(!threshold || threshold == 0) return false;
  if(price >= threshold) return true;
  return false;
}

/**
 * Resolve delivery-charge label for order forms / checkout.
 * Priority:
 * 1. Order ≥ backend free_delivery_threshold → "Free Delivery Above {N} AED"
 * 2. Selected area with 0 fee → "Free Delivery to Your Area"
 * 3. Otherwise → paid delivery amount
 */
export const resolveDeliveryChargeDisplay = ({
  areaCharge,
  orderPrice,
  threshold,
  hasArea = false,
}) => {
  const charge = Number(areaCharge) || 0;
  const thr = Number(threshold) || 0;
  const formatAmount = (n) => {
    const num = Number(n) || 0;
    return Number.isInteger(num) ? String(num) : String(parseFloat(num.toFixed(2)));
  };

  if (checkFreeDelivery(orderPrice, thr)) {
    return {
      mode: "threshold_free",
      strikeAmount: charge,
      message: `Free Delivery Above ${formatAmount(thr)} AED`,
    };
  }

  if (hasArea && charge === 0) {
    return {
      mode: "area_free",
      strikeAmount: 0,
      message: "Free Delivery to Your Area",
    };
  }

  return {
    mode: "paid",
    amount: charge,
    message: null,
  };
};

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export const extractCountriesFromPages = (pages) => {
  let countries = [];
  pages.forEach((page) => {
    if (!page?.country) return;
    if (!countries.includes(page.country)) {
      countries.push(page.country);
    }
  });
  countries.sort();
  countries = countries.map((country) => {
    return {
      value: country,
      label: country,
    };
  });
  return countries;
};

export const generateUniqueKey = () => {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

export const getValidFiles = (files) => {
  if (!Array.isArray(files)) return [];
  
  return files.filter(
    (file) => file && file.status !== 'failed'
  );
}

export function hasValidFiles(sizes) {
  if (!Array.isArray(sizes) || sizes.length === 0) return false;

  return sizes.some(
    (size) =>
      Array.isArray(size.files) &&
      size.files.some((file) => file && file.status !== 'failed')
  );
}

export function handleizeId(obj) {
  const parts = [
    obj.size,
    obj.type,
    obj.thickness ? `${obj.thickness}cm` : null,
    obj.frame,
    obj.design,
    obj.index
  ].filter(Boolean); // Remove null or undefined values

  const rawId = parts.join(" ");
  return rawId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "");     // Trim leading/trailing hyphens
}