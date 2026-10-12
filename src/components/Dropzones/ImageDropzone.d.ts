import type { ComponentType } from "react";

export type LaminationSelectOption = { value: string; label: string };

export interface ImageDropzoneProps {
  files: any;
  setFiles: any;
  showCounters?: boolean;
  showPrint?: boolean;
  showPaper?: boolean;
  zoom?: boolean;
  page?: string;
  types?: any[];
  finishings?: any[];
  paperTypes?: string[];
  thickness?: any[];
  showThickness?: boolean;
  allowPdf?: boolean;
  allowAllFileTypes?: boolean;
  showPhotoLamination?: boolean;
  laminationOptions?: LaminationSelectOption[];
  showFoamBoardDisplay?: boolean;
  displayOptions?: LaminationSelectOption[];
  showFoamBoardMounting?: boolean;
  mountingOptions?: LaminationSelectOption[];
  foamBoardOptionOrder?: boolean;
  showCaption?: boolean;
  maxCaptionLength?: number;
  orderType?: string;
}

declare const ImageDropzone: ComponentType<ImageDropzoneProps>;
export default ImageDropzone;
