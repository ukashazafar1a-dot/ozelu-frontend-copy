"use client";
import React, { useEffect, useState } from "react";

type props = {
  handleLineItemPicsChange: any;
  label?: string;
  name: string;
  value: any;
  uploadProgress: any;
};

const SingleFileInput = ({
  label,
  handleLineItemPicsChange,
  name,
  value,
  uploadProgress
}: props) => {
  const [file, setFile] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [progress,setProgress] = useState<any>(0);

  const handleFileChange = (e: any) => {
    handleLineItemPicsChange(e);
    const file = e.target.files[0];
    setFile(file);
  };

  useEffect(() => {
    // Check if a file is selected
    if (value) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader?.result);
      };

      // Read the selected file as a data URL
      reader.readAsDataURL(value);
    } else {
      // Reset image preview if no file is selected
      setImagePreview(null);
    }
  }, [value]);

  useEffect(()=>{
    setProgress(uploadProgress[file?.field] || 0)
  },[uploadProgress])
  return (
    <div className="file-upload-wrapper">
      <label htmlFor="formFile" className="form-label d-block">
        {label ? label : "Upload Image"}
      </label>
      <div className="d-flex gap-2 align-items-center">
        <div className="file-input-wrapper">
          {!imagePreview ? (
            <i className="fa-regular fa-image upload-icon"></i>
          ) : (
            <img
              className="image-thumbnail"
              src={imagePreview}
              loading="lazy"
              alt="newly"
            />
          )}
          <input
            className="form-control file-input-btn"
            name={name}
            type="file"
            id="formFile"
            onChange={handleFileChange}
            required
          />
          {(progress > 0 && progress < 100) && <progress className="progress-bar" value={uploadProgress[file?.field] || 0} max={100}/>}
          {value?.valid === false && (
            <div className="inputError mt-1">
              <div className="arrow-up"></div>
              <span>
                <img className="errorImage" src={"/images/images/error.jpeg"} />
              </span>{" "}
              File size should not exceed 10MB.
            </div>
          )}
        </div>
        {/* {file && <p className="m-0 p-0 font-primary truncate">{file?.name}</p>} */}
      </div>
    </div>
  );
};

export default SingleFileInput;
