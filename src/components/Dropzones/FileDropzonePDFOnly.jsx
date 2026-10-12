"use client";
import { isPortrait } from "@/helpers/generals";
import { checkFileSize, paperType, paperTypes } from "@/libs/utils";
import { sendGTMEvent } from "@next/third-parties/google";
import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import FsLightbox from "fslightbox-react";
import { getSignedUrl, removeFile, uploadFileToS3 } from "@/helpers/apiRequests";
import { trackFileUploaded, trackFileRemoved, getCheckoutSessionId } from "@/helpers/checkoutActivity";
import FileItem from "./PdfFileItem";
import useApp from "@/store/useApp";

const FileDropzonePDFOnly = ({
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
  orderType,
}) => {
  const dropboxRef = useRef(null);
  const uploadControllers = useRef({});
  const filesRef = useRef(files || []);
  const { sessionId: appSessionId } = useApp();
  const sessionId = getCheckoutSessionId(appSessionId) || appSessionId;
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const orderTypeRef = useRef(orderType);
  orderTypeRef.current = orderType;
  const resolveSessionId = () =>
    getCheckoutSessionId(null) || getCheckoutSessionId(sessionIdRef.current);
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1,
  });
  const [uploadProgress,setUploadProgress] = useState({}); // { filename: progress }
  const [previews, setPreviews] = React.useState([]);

  const commitFiles = (updater) => {
    const prev = filesRef.current || [];
    const next = typeof updater === "function" ? updater(prev) : updater;
    filesRef.current = next;
    setFiles(next);
  };
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      "application/pdf": [".pdf"]
    },
    multiple: true,
    onDrop: async (acceptedFiles) => {
    //   console.log("Files", acceptedFiles);
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
          const fileID = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
          const dimension = await isPortrait(fileInfo);
          // console.log("Thickness",thickness)
          let preview = '';
          if(fileInfo.type === 'image/heic'){
            preview = '/images/heic.png';
          }else if(fileInfo.type === "application/pdf"){
            preview = "/images/pdf.png";
          }else{
            preview = URL.createObjectURL(fileInfo);
          }
          return Object.assign(fileInfo, {
            id: fileID,
            url: null,
            preview,
            status: 'uploading',
            count: fileInfo.count || 1,
            print: dimension,
            finishing: finishings.length > 0 ? finishings[0].value : '',
            simpleType: types.length > 0 ? types[0] : '',
            paperType: paperTypes.length > 0 ? paperTypes[0] : '',
            thickness: thickness.length > 0 ? thickness[0].value : '',
            thicknessPrice: thickness.length > 0 ? thickness[0].price : 0
          });
        })
      );
    //   console.log("New Files",newFiles)
      commitFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach(async (fileInfo)=>{
        let preview = fileInfo.preview;
        let url,newKey,status = null;
        try {
          if (!activeSessionId) {
            throw new Error('Missing session id for upload');
          }
          const controller = new AbortController();
          uploadControllers.current[fileInfo.id] = controller;
          const signed = await getSignedUrl(fileInfo, activeSessionId);
          if (!signed?.uploadUrl || !signed?.key) {
            throw new Error('Failed to get signed upload URL');
          }
          const {uploadUrl,key} = signed;
          await uploadFileToS3(fileInfo,uploadUrl,(progress)=>{
              setUploadProgress((prev) => ({
                ...prev,
                [fileInfo.id]: progress,
              }))
          }, controller.signal)
          let publicUrl = uploadUrl.split('?')[0];
          if(fileInfo.type !== 'image/heic' && fileInfo.type !== 'application/pdf'){
            preview = publicUrl;
          }
          url = publicUrl;
          newKey = key;
          status = 'uploaded';
          if (activeOrderType && newKey) {
            trackFileUploaded({
              sessionId: activeSessionId,
              orderType: activeOrderType,
              pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
              file: { key: newKey, name: fileInfo.name, size: fileInfo.size, type: fileInfo.type },
            });
          }

        } catch (error) {
          console.log("Error",error)
          if(error?.message === 'aborted'){
            status = 'aborted';
          }else{
            status = 'failed';
          }
        } finally{
          if(status === 'aborted') return;
          commitFiles((prev) =>
              prev.map((f) =>{
                if(f.id === fileInfo.id){
                  return Object.assign(f, { preview,key: newKey,url,status});
                }else{
                  return f;
                }
              })
          );
        }

      })

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
      const { uploadUrl,key } = signed;
      await uploadFileToS3(file,uploadUrl,(progress)=>{
          setUploadProgress((prev) => ({
            ...prev,
            [file.id]: progress,
          }))
      })

      let publicUrl = uploadUrl.split('?')[0];
      preview = file.preview;
      // Replace preview for non-doc, non-pdf types
      const isDoc =
        file.type === "application/pdf" ||
        file.type === "image/heic";
      if (!isDoc) preview = publicUrl;
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
        commitFiles((prev) => prev.map((f) => {
          if (file.id == f.id){
            return Object.assign(f, {
              preview,
              key: newKey,
              url,
              status
            });
          }else{
            return f;
          }
        }));
    }
  }

  async function onRemove(e, file) {
    e.stopPropagation();
    try {
      const localId = file.id;
      const controller = uploadControllers.current[localId];
      if(controller){
        controller.abort(); // stops upload
        delete uploadControllers.current[localId];
      }


      //Revoke object URL to free memory
      if(file.preview && file.preview.startsWith("blob:")){
        URL.revokeObjectURL(file.preview);
      }

      commitFiles((prev) => prev.filter((f)=>f.id !== localId));


      setUploadProgress((prev)=>{
        const { [localId]: _ , ...rest} = prev;
        return rest;
      });
      if(file?.status === 'uploaded'){
        await removeFile(file.key,sessionId);
        if (orderType && file.key) {
          trackFileRemoved({
            sessionId,
            orderType,
            pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
            file: { key: file.key, name: file.name },
          });
        }
      }

    } catch (error) {
      console.error(error); 
    }
  }

  function setFileType(e, file, type) {
    e.preventDefault();
    let newFiles = filesRef.current.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { print: type });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    commitFiles(newFiles);
  }
  function setPaperType(e, file) {
    e.preventDefault();
    let newFiles = filesRef.current.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { paperType: e.target.value });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    commitFiles(newFiles);
  }

  function setFinishing(e, file) {
    e.preventDefault();
    let newFiles = filesRef.current.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { finishing: e.target.value });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    commitFiles(newFiles);
  }

  function setType(e, file) {
    e.preventDefault();
    let newFiles = filesRef.current.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { simpleType: e.target.value });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    commitFiles(newFiles);
  }

  function setThickness(e, file) {
    e.preventDefault();
    const selectedThickness = thickness.filter((item)=>item.value == e.target.value)[0];
    let newFiles = filesRef.current.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { 
          thickness: e.target.value,
          thicknessPrice: selectedThickness ? selectedThickness.price : 0
        });
      }
      return innerFile;
    });
    //console.log('files',newFiles)
    commitFiles(newFiles);
  }

  function setFileCounter(e, file, type) {
    e.preventDefault();
    let value = 1;
    let newFiles = filesRef.current.map((innerFile) => {
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
    commitFiles(newFiles);
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
  useEffect(() => {
    filesRef.current = files || [];
    renderPreviews(files);
  }, [files]);

  useEffect(() => {
    setFiles([
      ...files.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
    renderPreviews(files);
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
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
      <div className={`custom-dropzone selectForm img-dropzone ${files.length > 0 ? 'length-full' : ''} ${page}`}>
        
        {files.map((file,i)=>(
          <FileItem key={file.id}
            index={i}
            file={file}
            progress={uploadProgress[file.id] || 0}
            onRemove={onRemove}
            zoom={zoom}
            triggerZoom={triggerZoom}
            handleFilePicker={handleFilePicker}
            showCounters={showCounters}
            showPrint={showPrint}
            setFileCounter={setFileCounter}
            setFileType={setFileType}
            showPaper={showPaper}
            setPaperType={setPaperType}
            paperTypes={paperTypes}
            thickness={thickness}
            retryUpload={retryUpload}
            setThickness={setThickness}
            types={types}
            setType={setType}
            finishings={finishings}
            setFinishing={setFinishing}
            showThickness={showThickness}
          />
        ))}
        
        {/* {thumbs} */}
        <div
          {...getRootProps({
            className: "d-flex w-100 h-100 ",
          })} ref={dropboxRef}
        >
          <input {...getInputProps()} />
          {files.length <= 0 && (
            <div className="d-flex w-100 align-items-center justify-content-center m-3 text-center">
              <h2>Drop or browse files here</h2>
            </div>
          )}

          {files.length > 0 && (
            <div className="placeholder-thumb">
              <div className="title">
                <p className="font-secondary m-0">
                  Drop or browse <br />
                  files here
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

export default FileDropzonePDFOnly;
