/** Supported file types shown under upload dropzones (matches dropzone accept rules per flow). */
/** Standard order: PDF, DOC, DOCX (when applicable), then JPG, JPEG, PNG, HEIC, TIF, TIFF. */

/** FileDropzone: documents printing, certificates */
export const DOCUMENT_FILE_TYPES =
  "PDF, DOC, DOCX, JPG, JPEG, PNG, HEIC, TIF, TIFF";

/** ImageDropzone allowAllFileTypes (flyers) */
export const FLYERS_SUPPORTED_TYPES =
  "PDF, DOC, DOCX, JPG, JPEG, PNG, HEIC, TIF, TIFF";

/** ImageDropzone allowAllFileTypes (menu printing) — same as flyers */
export const MENU_SUPPORTED_TYPES = FLYERS_SUPPORTED_TYPES;

/** FileDropzone on passport page (document prints) */
export const PASSPORT_DOCUMENT_PRINT_TYPES =
  "PDF, DOC, DOCX, JPG, JPEG, PNG, HEIC, TIF, TIFF";

/** FileDropzonePDFOnly — passport photo upload */
export const PASSPORT_PHOTO_FILE_TYPES = "PDF, JPG, JPEG, PNG";

/** ImageDropzone default — photos, canvas, foam board, stickers */
export const IMAGE_PRINT_TYPES =
  "JPG, JPEG, PNG, HEIC, TIF, TIFF";

/** ImageDropzone with allowPdf — business cards */
export const BUSINESS_CARD_FILE_TYPES =
  "PDF, JPG, JPEG, PNG, HEIC, TIF, TIFF";

/** Polaroid / photo uploads */
export const POLAROID_IMAGE_TYPES = IMAGE_PRINT_TYPES;

/** Photo retouching services (extra formats after standard photo list) */
export const RETOUCHING_IMAGE_TYPES =
  "JPG, JPEG, PNG, HEIC, GIF, TIF, TIFF, PSD";
