"use client";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

type props = {
  handleFileChange: any;
  uploadProgress: any;
  onLineItemPicRemove: any;
};

const totalLength = 295; // your full circle length

const FileUploader = ({ handleFileChange,uploadProgress,onLineItemPicRemove }: props) => {
  const [files, setFiles] = useState<any>([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    // Maximum 10 MB File Size
    // maxSize: 10 * 1024 * 1024,
    onDrop: async (acceptedFiles, rj, event) => {
      //console.log("Files", files);
      let newFiles = await Promise.all(
        acceptedFiles.map(async (fileInfo) => {
          return Object.assign(fileInfo, {
            preview: URL.createObjectURL(fileInfo),
          });
        })
      );

      if (newFiles && newFiles?.length > 0) {
        // Do something with the files
        newFiles?.forEach((file: any,index:number) => {
          const event = {
            target: {
              files: [file],
              name: `line-item-no-${files.length + index + 1}`,
            },
          };
          // console.log(event)
          handleFileChange(event);
        });
      }

      setFiles([...files, ...newFiles]);
    },
  });

  function onRemove(e: any, eventfile: any) {
    e.stopPropagation();
    // Filter out the removed file
    const filteredFiles = files.filter((file: any) => file !== eventfile);

    const event = {
      target: {
        files: [eventfile]
      }
    }

    onLineItemPicRemove(event)

    // Cleanup URL
    URL.revokeObjectURL(eventfile.preview);
    setFiles(filteredFiles);
  }

  const thumbs = files?.map((file: any) => {
    const progress = uploadProgress[file?.localId] || 0;
    return (
    <div className="pp-page-thumb thumb--img" key={file.localId}>
      <div className={`thumb--img-item position-relative `}>
        <img src={file?.preview} alt={file?.name} loading="lazy" />
        {(progress < 100 && progress > 0) && <div className="thumb--img-item__progressbar">
            <svg width="114" height="114" viewBox="-14.25 -14.25 142.5 142.5" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{transform:"rotate(-90deg)"}}>
                <circle r="47" cx="57" cy="57" fill="transparent" stroke="#e0e0e0" strokeWidth="11"></circle>
                <circle r="47" cx="57" cy="57" stroke="var(--primary-color)" strokeWidth="12" strokeLinecap="round" strokeDashoffset={(totalLength - (progress / 100) * totalLength) +"px"} fill="transparent" strokeDasharray="295.16px"></circle>
                <text x="36px" y="70px" fill="var(--primary-color)" fontSize="40px" fontWeight="bold" style={{transform:"rotate(90deg) translate(0px, -110px)"}}>{progress}</text>
            </svg>
        </div>}
      </div>
      <div className="file--title truncate one-lines">{file?.name}</div>
      <div
        className="badge d-flex align-items-center justify-content-center remove-btn"
        onClick={(e) => onRemove(e, file)}
      >
        <svg style={{ height: "10px", width: "10px" }}>
          <line
            style={{ stroke: "#fff", strokeWidth: "2px" }}
            x1="0"
            y1="0"
            x2="10"
            y2="10"
          ></line>
          <line
            style={{ stroke: "#fff", strokeWidth: "2px" }}
            x1="0"
            y1="10"
            x2="10"
            y2="0"
          ></line>
        </svg>
      </div>
    </div>
  )
});



  return (
    <>
      <div
        className={`custom-dropzone img-dropzone product-page ${
          files && files?.length > 0 ? "has-files" : ""
        }`}
      >
        {thumbs}
        <div
          {...getRootProps({
            className: "d-flex w-100 h-100",
          })}
        >
          <input {...getInputProps()} />
          {!files ||
            (files?.length <= 0 && (
              <div className="d-flex w-100 align-items-center justify-content-center m-3 text-center">
                <h3>Drop or browse files here</h3>
              </div>
            ))}

          {files && files?.length > 0 && (
            <div className="placeholder-thumb">
              <div className="title my-auto">
                <p className="font-secondary m-0">
                  Drop or browse <br />
                  files here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FileUploader;
