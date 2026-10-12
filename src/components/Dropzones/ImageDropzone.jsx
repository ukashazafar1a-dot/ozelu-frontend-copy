"use client";
import { isPortrait } from "@/helpers/generals";
import { checkFileSize, paperType, paperTypes } from "@/libs/utils";
import { sendGTMEvent } from "@next/third-parties/google";
import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import ImageItem from "./ImageItem";
import FsLightbox from "fslightbox-react";
import { getSignedUrl, removeFile, uploadFileToS3 } from "@/helpers/apiRequests";
import { trackFileUploaded, trackFileRemoved, getCheckoutSessionId } from "@/helpers/checkoutActivity";
import useApp from "@/store/useApp";

const ImageDropzone = ({
  files,
  setFiles,
  showCounters = false,
  showPrint = false,
  showPaper = false,
  zoom = false,
  page='default',
  types = [],
  finishings = [],
  paperTypes = [],
  thickness = [],
  showThickness = false,
  allowPdf = false,
  allowAllFileTypes = false,
  showPhotoLamination = false,
  laminationOptions = [],
  showFoamBoardDisplay = false,
  displayOptions = [],
  showFoamBoardMounting = false,
  mountingOptions = [],
  foamBoardOptionOrder = false,
  showCaption = false,
  maxCaptionLength = 50,
  orderType,
}) => {
  const {sessionId: appSessionId} = useApp();
  const sessionId = getCheckoutSessionId(appSessionId) || appSessionId;
  // useDropzone may keep a stale onDrop; always read the latest session id.
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const orderTypeRef = useRef(orderType);
  orderTypeRef.current = orderType;
  const dropboxRef = useRef(null);
  const uploadControllers = useRef({});
  const [localFiles,setLocalFiles] = useState([]);
  const [uploadProgress,setUploadProgress] = useState({}); // { filename: progress }
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1,
  });
  const [previews, setPreviews] = React.useState([]);
  const resolveSessionId = () =>
    getCheckoutSessionId(null) || getCheckoutSessionId(sessionIdRef.current);
  const acceptMap = allowAllFileTypes
    ? {
        "image/*": [],
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        "image/tiff": [".tif", ".tiff"],
        "image/heic": [".heic"],
        "image/svg+xml": [".svg"],
        "application/postscript": [".ai", ".eps"],
        "image/vnd.adobe.photoshop": [".psd"],
        "application/octet-stream": [".ai", ".psd", ".eps"],
      }
    : allowPdf
      ? {
          "image/*": [],
          "application/pdf": [".pdf"],
        }
      : {
          "image/*": [],
        };
  const { getRootProps, getInputProps } = useDropzone({
    accept: acceptMap,
    multiple: true,
    onDrop: async (acceptedFiles) => {
      //console.log("Files", files);
      try {
        sendGTMEvent({
          event: "file_upload",
          upload_status: "started",
        });
      } catch (error) {
        console.log("error in datalayer", error);
      }
      const activeSessionId = resolveSessionId();
      const activeOrderType = orderTypeRef.current;
      let newFiles = await Promise.all(
        acceptedFiles.map(async (fileInfo) => {
          const localId = crypto.randomUUID().substring(0,7);
          const dimension = await isPortrait(fileInfo);
          // console.log("Thickness",thickness)
          let preview = '';
          if(fileInfo.type === 'image/heic'){
            preview = '/images/heic.png'
          }else if(fileInfo.type === 'application/pdf'){
            preview = '/images/pdf.png'
          }else{
            preview = URL.createObjectURL(fileInfo);
          }
          return Object.assign(fileInfo, {
            status: 'uploading',
            preview,
            localId,
            count: fileInfo.count || 1,
            print: dimension,
            finishing: finishings.length > 0 ? finishings[0].value : '',
            simpleType: types.length > 0 ? types[0] : '',
            paperType: paperTypes.length > 0 ? paperTypes[0] : '',
            lamination: showPhotoLamination && laminationOptions.length > 0 ? '' : undefined,
            display: showFoamBoardDisplay && displayOptions.length > 0 ? '' : undefined,
            mounting: showFoamBoardMounting && mountingOptions.length > 0 ? '' : undefined,
            caption: showCaption ? '' : undefined,
            thickness: thickness.length > 0 ? thickness[0].value : '',
            thicknessPrice: thickness.length > 0 ? thickness[0].price : 0
          });
        })
      );
      setLocalFiles([...localFiles, ...newFiles]);

      for (const fileInfo of newFiles){
        (async ()=>{
            try {
              if (!activeSessionId) {
                throw new Error('Missing session id for upload');
              }
              const signed = await getSignedUrl(fileInfo, activeSessionId);
              if (!signed?.uploadUrl || !signed?.key) {
                throw new Error('Failed to get signed upload URL');
              }
              const {uploadUrl,key} = signed;
              const controller = new AbortController();
              uploadControllers.current[fileInfo.localId] = controller;
              await uploadFileToS3(fileInfo,uploadUrl,(progress)=>{
                  setUploadProgress((prev) => ({
                    ...prev,
                    [fileInfo.localId]: progress,
                  }))
              }, controller.signal);

              let publicUrl = uploadUrl.split('?')[0];
              let preview = fileInfo.preview;
              // Keep static preview icons for HEIC/PDF
              const shouldKeepStaticPreview =
                fileInfo.type === "image/heic" ||
                fileInfo.type === "application/pdf";
              if (!shouldKeepStaticPreview) preview = publicUrl;
              setLocalFiles((prev)=>prev.map((f)=>
                f.localId === fileInfo.localId 
                ? Object.assign(fileInfo,{status: "uploaded",preview, key, url: publicUrl })
                : f
              ))
              if (activeOrderType && key && activeSessionId) {
                trackFileUploaded({
                  sessionId: activeSessionId,
                  orderType: activeOrderType,
                  pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
                  file: { key, name: fileInfo.name, size: fileInfo.size, type: fileInfo.type },
                });
              }
              return ;
            } catch (error) {
              console.log("Error",error)
              if(error?.message === 'aborted'){
                return null;
              }
              setLocalFiles((prev)=>prev.map((f)=>
                f.localId === fileInfo.localId 
                ? Object.assign(fileInfo,{status: "failed", key:null, url: null })
                : f
              ))
            }
        })();
      }

      try {
        sendGTMEvent({
          event: "file_upload",
          upload_status: "completed",
        });
      } catch (error) {
        console.log("error in datalayer", error);
      }
    },
  });

  async function retryUpload(file) {
    setLocalFiles((prev)=>prev.map((f)=>
      f.localId === file.localId 
        ? Object.assign(f,{status:'uploading'})
        : f
    ));

    let preview = file.preview;
    let newKey,url,status = null;
    const activeSessionId = resolveSessionId();
    const activeOrderType = orderTypeRef.current;
    try {
      if (!activeSessionId) {
        throw new Error('Missing session id for upload');
      }
      const signed = await getSignedUrl(file, activeSessionId);
      if (!signed?.uploadUrl || !signed?.key) {
        throw new Error('Failed to get signed upload URL');
      }
      const {uploadUrl,key} = signed;
      await uploadFileToS3(file,uploadUrl,(progress)=>{
          setUploadProgress((prev) => ({
            ...prev,
            [file.localId]: progress,
          }))
      })

      let publicUrl = uploadUrl.split('?')[0];
      preview = file.preview;
      // Keep static preview icons for HEIC/PDF
      const shouldKeepStaticPreview =
        file.type === "image/heic" ||
        file.type === "application/pdf";
      if (!shouldKeepStaticPreview) preview = publicUrl;
      newKey = key;
      url = publicUrl;
      status = "uploaded";
      if (activeOrderType && newKey) {
        trackFileUploaded({
          sessionId: activeSessionId,
          orderType: activeOrderType,
          pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
          file: { key: newKey, name: file.name, size: file.size, type: file.type },
        });
      }
    } catch (error) {
      status = "failed";
    } finally{
        const newFiles = localFiles.map((f) => {
          if (file.localId == f.localId){
            return Object.assign(f, {
              preview,
              key: newKey,
              url,
              status
            });
          }else{
            return f;
          }
        });
        setLocalFiles(newFiles);
    }
  }

  async function onRemove(e, file) {
    e.stopPropagation();
    //console.log("i am here");    
    try {
      const localId = file.localId;
      const controller = uploadControllers.current[localId];
      if(controller){
        controller.abort(); // stops upload
        delete uploadControllers.current[localId];
      }

      //Revoke object URL to free memory
      if(file.preview && file.preview.startsWith("blob:")){
        URL.revokeObjectURL(file.preview);
      }

      // Remove file immutably from state
      const newFiles = localFiles.filter((f)=>f.localId !== localId);
      setLocalFiles(newFiles);

      setUploadProgress((prev)=>{
        const { [localId]: _ , ...rest} = prev;
        return rest;
      });
      if(file?.status === 'uploaded'){
        const activeSessionId = resolveSessionId();
        await removeFile(file.key, activeSessionId);
        if (orderTypeRef.current && file.key) {
          trackFileRemoved({
            sessionId: activeSessionId,
            orderType: orderTypeRef.current,
            pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
            file: { key: file.key, name: file.name },
          });
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  function setFileType(e, file, type) {
    e.preventDefault();
    let newFiles = localFiles.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { print: type });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    setLocalFiles(newFiles);
  }
  function setPaperType(e, file) {
    e.preventDefault();
    let newFiles = localFiles.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { paperType: e.target.value });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    setLocalFiles(newFiles);
  }

  function setLamination(e, file) {
    e.preventDefault();
    const newFiles = localFiles.map((innerFile) => {
      if (file === innerFile) {
        return Object.assign(innerFile, { lamination: e.target.value });
      }
      return innerFile;
    });
    setLocalFiles(newFiles);
  }

  function setDisplay(e, file) {
    e.preventDefault();
    const newFiles = localFiles.map((innerFile) => {
      if (file === innerFile) {
        return Object.assign(innerFile, { display: e.target.value });
      }
      return innerFile;
    });
    setLocalFiles(newFiles);
  }

  function setMounting(e, file) {
    e.preventDefault();
    const newFiles = localFiles.map((innerFile) => {
      if (file === innerFile) {
        return Object.assign(innerFile, { mounting: e.target.value });
      }
      return innerFile;
    });
    setLocalFiles(newFiles);
  }

  function setCaption(e, file, value) {
    e.preventDefault();
    const newFiles = localFiles.map((innerFile) => {
      if (file === innerFile) {
        return Object.assign(innerFile, {
          caption: String(value ?? "").slice(0, maxCaptionLength),
        });
      }
      return innerFile;
    });
    setLocalFiles(newFiles);
  }

  function setFinishing(e, file) {
    e.preventDefault();
    let newFiles = localFiles.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { finishing: e.target.value });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    setLocalFiles(newFiles);
  }

  function setType(e, file) {
    e.preventDefault();
    let newFiles = localFiles.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { simpleType: e.target.value });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    setLocalFiles(newFiles);
  }

  function setThickness(e, file) {
    e.preventDefault();
    const selectedThickness = thickness.filter((item)=>item.value == e.target.value)[0];
    let newFiles = localFiles.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { 
          thickness: e.target.value,
          thicknessPrice: selectedThickness ? selectedThickness.price : 0
        });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    setLocalFiles(newFiles);
  }

  function setFileCounter(e, file, type) {
    e.preventDefault();
    let value = 1;
    let newFiles = localFiles.map((innerFile) => {
      if (file == innerFile) {
        value = parseInt(file.count);
        if (type == "plus") {
          return Object.assign(innerFile, { count: value + 1 });
        } else {
          if (value > 1) return Object.assign(innerFile, { count: value - 1 });
        }
      }
      return innerFile;
    });
    setLocalFiles(newFiles);
  }
  const triggerZoom = (i) => {
    setLightboxController((prev) => ({
      toggler: !prev.toggler, // Flip the toggler
      slide: i + 1, // Set the current slide
    }));
  };

  {/* Add error-image class to bellow both divs to check files size condition checkFileSize(file).
  // if you need to show file size error*/}
  const renderPreviews = (images) => {
    const objects = images?.map((image) => image?.preview) || [];
    setPreviews(objects);
  };

  const previewForFile = (file) => {
    if (!file) return "";
    if (file.preview) return file.preview;
    if (file instanceof Blob) {
      if (file.type === "image/heic") return "/images/heic.png";
      if (file.type === "application/pdf") return "/images/pdf.png";
      return URL.createObjectURL(file);
    }
    if (file.url) return file.url;
    if (file.path) return file.path;
    if (file.type === "application/pdf") return "/images/pdf.png";
    if (file.type === "image/heic") return "/images/heic.png";
    return "";
  };

  useEffect(()=>{
    setFiles(localFiles)
    renderPreviews(localFiles);
  }, [localFiles])

  useEffect(() => {
    setLocalFiles(
      (files || []).map((file) => {
        const preview = previewForFile(file);
        if (file instanceof Blob) {
          return Object.assign(file, { preview });
        }
        return { ...file, preview };
      })
    );
    renderPreviews(files);
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () =>
      localFiles.forEach((file) => {
        if (file?.preview?.startsWith?.("blob:")) {
          URL.revokeObjectURL(file.preview);
        }
      });
  }, []);
  // console.log(lightboxController)
  // console.log(thickness)

  function handleFilePicker(e){
    e.stopPropagation();
    if(!dropboxRef.current) return;
    dropboxRef.current.click();
  }

  return (
    <>
      <div className={`custom-dropzone selectForm img-dropzone ${localFiles.length > 0 ? 'length-full' : ''} ${page}${foamBoardOptionOrder ? ' foam-board-dropzone' : ''}`}>
        {localFiles.map((file,i)=>(
          <ImageItem
              key={file?.localId || i}
              page={page}
              index={i}
              file={file}
              progress={uploadProgress[file.localId] || 0}
              onRemove={onRemove}
              zoom={zoom}
              triggerZoom={triggerZoom}
              handleFilePicker={handleFilePicker}
              showCounters={showCounters}
              showPrint={showPrint}
              setFileCounter={setFileCounter}
              setFileType={setFileType}
              showPaper={showPaper}
              paperTypes={paperTypes}
              thickness={thickness}
              retryUpload={retryUpload}
              setPaperType={setPaperType}
              showPhotoLamination={showPhotoLamination}
              laminationOptions={laminationOptions}
              setLamination={setLamination}
              showFoamBoardDisplay={showFoamBoardDisplay}
              displayOptions={displayOptions}
              setDisplay={setDisplay}
              showFoamBoardMounting={showFoamBoardMounting}
              mountingOptions={mountingOptions}
              setMounting={setMounting}
              foamBoardOptionOrder={foamBoardOptionOrder}
              showCaption={showCaption}
              maxCaptionLength={maxCaptionLength}
              setCaption={showCaption ? setCaption : undefined}
              showThickness={showThickness}
              setThickness={setThickness}
              types={types}
              setType={setType}
              finishings={finishings}
              setFinishing={setFinishing}
          />
        ))}

        <div
          {...getRootProps({
            className: `d-flex w-100 h-100${foamBoardOptionOrder ? " foam-board-dropzone-browse" : ""}`,
          })} ref={dropboxRef}
        >
          <input {...getInputProps()} />
          {localFiles.length <= 0 && (
            <div className="d-flex w-100 align-items-center justify-content-center m-3 text-center">
              <h2>Drop or Browse Files Here</h2>
            </div>
          )}

          {localFiles.length > 0 && (
            <div className="placeholder-thumb">
              <div className="title">
                <p className="font-secondary m-0">
                  Drop or Browse <br />
                  Files Here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {zoom && (
        <>
          <FsLightbox
            toggler={lightboxController.toggler}
            sources={previews}
            slide={lightboxController.slide}
          />
        </>
      )}
    </>
  );
};

export default ImageDropzone;
