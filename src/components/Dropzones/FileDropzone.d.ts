import type { ComponentType } from "react";
import type { LaminationSelectOption } from "./ImageDropzone";

export type { LaminationSelectOption };

export interface FileDropzoneProps {
  files: any;
  setFiles: any;
  pages?: any;
  setPages?: any;
  showCounters?: boolean;
  showPaper?: boolean;
  showDuplex?: boolean;
  showStapling?: boolean;
  zoom?: boolean;
  types?: any[];
  finishings?: any[];
  showCertificateLamination?: boolean;
  laminationOptions?: LaminationSelectOption[];
  data?: any;
  orderType?: string;
}

declare const FileDropzone: ComponentType<FileDropzoneProps>;
export default FileDropzone;
