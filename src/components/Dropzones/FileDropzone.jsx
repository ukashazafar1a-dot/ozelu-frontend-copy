"use client";
import { isPortrait } from "@/helpers/generals";
import {getEvenPages, getOddPages, isValidPageRange, parsePageRanges} from "@/helpers/files"
import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as PDFJS from "pdfjs-dist/build/pdf";
import pdfjsworker from "pdfjs-dist/build/pdf.worker.entry";
import { baseURL, checkFileSize, paperTypes } from "@/libs/utils";
import FsLightbox from "fslightbox-react";
import FileItem from './FileItem';
import { getSignedUrl, removeFile, uploadFileToS3 } from "@/helpers/apiRequests";
import { trackFileUploaded, trackFileRemoved, getCheckoutSessionId } from "@/helpers/checkoutActivity";
import useApp from "@/store/useApp";

const FileDropzone = ({
  files,
  setFiles,
  pages,
  setPages,
  showCounters,
  showPaper = false,
  showDuplex = false,
  showStapling = true,
  zoom = false,
  types = [],
  finishings = [],
  showCertificateLamination = false,
  laminationOptions = [],
  data,
  orderType,
}) => {
  // const [PDFJS, setPDFJS] = useState(null);
  const { sessionId: appSessionId } = useApp();
  const sessionId = getCheckoutSessionId(appSessionId) || appSessionId;
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const orderTypeRef = useRef(orderType);
  orderTypeRef.current = orderType;
  const resolveSessionId = () =>
    getCheckoutSessionId(null) || getCheckoutSessionId(sessionIdRef.current);
  const dropboxRef = useRef(null);
  const uploadControllers = useRef({});
  const [localFiles,setLocalFiles] = useState([]);
  const [thumbs, setThumbs] = useState(null);
  const [uploadProgress,setUploadProgress] = useState({}); // { filename: progress }
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1,
  });
  const [previews, setPreviews] = useState([]);

  const updateLocalFiles = (updater) => {
    setLocalFiles((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  };

  async function getPagesForDocuments(newFiles) {
    try {
      const formData = new FormData();
      newFiles.forEach((f) => {
        formData.append("files", f);
        formData.append("localIds", f.localId);
      });

      formData.append("session_id", resolveSessionId());

      const res = await fetch(baseURL + "/api/files/getmeta", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to fetch results");

      const data = await res.json();
      const { results } = data;

      let updatedFiles = [...newFiles]; // existing files state

      results.forEach((r) => {
        if (r.success) {
          // update pages for that file
          updatedFiles = updatedFiles.map((f) => {
            if (f.localId !== r.id) return f;
            const serverPages = parseInt(r.pages, 10);
            const clientPages = parseInt(f.pages, 10);
            const isPdf = f.type === "application/pdf";
            // Do not replace a valid in-browser PDF.js count with 0 when getmeta fails silently
            const useClient =
              isPdf &&
              (!Number.isFinite(serverPages) || serverPages <= 0) &&
              Number.isFinite(clientPages) &&
              clientPages > 0;
            const pages = useClient ? clientPages : serverPages > 0 ? serverPages : clientPages || 0;
            const totalPages = useClient
              ? f.totalPages || clientPages
              : serverPages > 0
                ? serverPages
                : f.totalPages || clientPages || 0;
            return Object.assign(f, {
              loading: false,
              pages,
              totalPages,
            });
          });
        } else {
          // remove just this file
          updatedFiles = updatedFiles.filter((f) => f.localId !== r.id);
        }
      });

      // for (const fileInfo of newFiles){
      //   (async ()=>{
      //       try {
      //         const {uploadUrl,key} = await getSignedUrl(fileInfo,sessionId);
      //         const controller = new AbortController();
      //         uploadControllers.current[fileInfo.localId] = controller;
      //         await uploadFileToS3(fileInfo,uploadUrl,(progress)=>{
      //             setUploadProgress((prev) => ({
      //               ...prev,
      //               [fileInfo.localId]: progress,
      //             }))
      //         }, controller.signal);

      //         let publicUrl = uploadUrl.split('?')[0];
      //         let preview = fileInfo.preview;
      //         // Replace preview for image/heic type
      //         const isHeic = fileInfo.type === "image/heic";
      //         if (!isHeic) preview = publicUrl;
      //         setLocalFiles((prev)=>prev.map((f)=>
      //           f.localId === fileInfo.localId 
      //           ? Object.assign(fileInfo,{status: "uploaded",preview, key, url: publicUrl })
      //           : f
      //         ))
      //         return ;
      //       } catch (error) {
      //         console.log("Error",error)
      //         if(error?.message === 'aborted'){
      //           return null;
      //         }
      //         setLocalFiles((prev)=>prev.map((f)=>
      //           f.localId === fileInfo.localId 
      //           ? Object.assign(fileInfo,{status: "failed", key:null, url: null })
      //           : f
      //         ))
      //       }
      //   })();
      // }

      // Process all results in parallel
      results.forEach(async (r) => {
        if (!r.success) {
          // If upload failed, skip this file
          return null;
        }

        // Find matching file in updatedFiles
        const file = updatedFiles.find((f) => f.localId === r.id);
        if (!file) return null;

        let preview = file.preview;
        let url, key ,status = null;
        try {
          const controller = new AbortController();
          uploadControllers.current[file.localId] = controller;
          // Upload to S3 with progress tracking
          await uploadFileToS3(file, r.uploadUrl, (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.localId]: progress,
            }));
          }, controller.signal);

          // Build final URLs
          const publicUrl = r.uploadUrl.split("?")[0];

          // Replace preview for non-doc, non-pdf types
          const isDoc =
            file.type === "application/pdf" ||
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.type === "application/msword" ||
            file.type === "image/heic";

          if (!isDoc) preview = publicUrl;

          url = publicUrl;
          key = r.key;
          status = "uploaded";
          if (orderTypeRef.current && key) {
            trackFileUploaded({
              sessionId: resolveSessionId(),
              orderType: orderTypeRef.current,
              pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
              file: { key, name: file.name, size: file.size, type: file.type },
            });
          }
        } catch (error) {
          if(error?.message === 'aborted'){
            status = 'aborted';
          }else{
            status = "failed";
          }
        }finally{
          if(status === 'aborted') return null;
          // Return updated file object
          setLocalFiles((prev)=>prev.map((f)=>
            f.localId === file.localId
            ? Object.assign(file,{
              preview,
              key,
              url,
              status
            })
            : f
          ))
        }
      })

      // Filter out nulls (failed uploads)
      // const successfulFiles = processedFiles.filter(Boolean);

      // setLocalFiles([...localFiles,...successfulFiles]);
    } catch (error) {
      console.error("Error in getPagesForDocuments:", error);
      // remove all newly added files if error
      updateLocalFiles((prevFiles) =>
        prevFiles.filter((f)=>!newFiles.some((nf)=>nf.localId === f.localId))
      )
      // setFiles((prev) =>
      //   prev.filter((f) => !newFiles.some((nf) => nf.localId === f.localId))
      // );
    }
  }

  async function getPages(fileInfo) {
    let result = await (function (fileInfo) {
      return new Promise(async (resolve, reject) => {
        if (fileInfo) {
          const localId = crypto.randomUUID().substring(0,7);
          if (fileInfo.type === "application/pdf") {
            // Read the file as an ArrayBuffer
            const arrayBuffer = await fileInfo.arrayBuffer();
            // Initialize PDFJS with the ArrayBuffer
            const pdfDocument = await PDFJS.getDocument(arrayBuffer).promise;
            // Get the total number of pages
            const totalPageCount = pdfDocument.numPages;
            resolve(Object.assign(fileInfo, { localId, loading: true, range: 'all',rangeValue: '', pages: totalPageCount,totalPages: totalPageCount }));
          }else if(fileInfo.type === 'application/msword' || fileInfo.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
            resolve(Object.assign(fileInfo, { localId, loading: true, range: 'all',rangeValue: '', pages: 1,totalPages: 1 }));
          }
          else {
            resolve(Object.assign(fileInfo, { localId, loading: false, range: 'all',rangeValue: '', pages: 1,totalPages: 1 }));
          }
        }
      });
    })(fileInfo);
    return result;
  }

  async function getFilesObject(files) {
    // console.log("Files....",files)
    return await Promise.all(
      files.map(async (file) => {
        //console.log(dimension)
        const count = file.count || 1;
        const print = "portrait";
        const simpleType = types.length > 0 ? types[0] : '';
        const finishing = finishings.length > 0 ? finishings[0].value : '';
        const lamination =
          showCertificateLamination && laminationOptions.length > 0 ? "" : undefined;
        const binding = "", duplex = false, stapling = "No";
        const status = "uploading";
        if (file.type === "application/pdf") {
          return Object.assign(file, {
            preview: "/images/pdf.png",
            count,print,simpleType,finishing,lamination,
            binding,duplex,stapling,status
          });
        }else if(file.type === "image/heic"){
          const dimension = await isPortrait(file);
          
          return Object.assign(file, {
            preview: "/images/heic.png",
            count,
            print: dimension,
            simpleType,finishing,lamination,
            binding,duplex,stapling,status
          });
        }
        else if(file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
            return Object.assign(file,{
                preview: '/images/docx.png',
                count,print,simpleType,finishing,
                lamination,binding,duplex,stapling,status
            })
        }
        else {
          const dimension = await isPortrait(file);
          
          return Object.assign(file, {
            preview: URL.createObjectURL(file),
            count,
            print: dimension,
            simpleType,finishing,lamination,binding,
            duplex,stapling,status
          });
        }
      })
    );
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      let newFiles = acceptedFiles.map(async (fileInfo) => {
        return await getPages(fileInfo);
      });

      
      Promise.all(newFiles).then(async (items) => {
        //console.log("New items", items);
        const creFiles = await getFilesObject(items);
        updateLocalFiles((prev) => [...prev, ...creFiles]);
        await getPagesForDocuments(items);
      });
      // setFiles([...files,...getFilesObject(acceptedFiles)])
    },
  });

  async function retryUpload(file) {

    updateLocalFiles((prev)=>prev.map((f)=>
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
      const { uploadUrl,key } = signed;
      await uploadFileToS3(file,uploadUrl,(progress)=>{
          setUploadProgress((prev) => ({
            ...prev,
            [file.localId]: progress,
          }))
      })

      let publicUrl = uploadUrl.split('?')[0];
      preview = file.preview;
      // Replace preview for non-doc, non-pdf types
      const isDoc =
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword" ||
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
        updateLocalFiles((prev) => prev.map((f) => {
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
        }));
    }
  }

  async function onRemove(e, file) {
    e.stopPropagation();

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

      updateLocalFiles((prev) => prev.filter((f)=>f.localId !== localId));


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
      console.error(error)
    }
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
    //console.log('files',newFiles)
    setLocalFiles(newFiles);
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

  const setFileValue = (file,name,value) => {
    let newFiles = localFiles.map((innerFile) => {
      if (file == innerFile) {
        return Object.assign(innerFile, { [name]: value });
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

  const setFileBinding = (e, file) => {
    e.preventDefault();
    setFileValue(file,e.target.name,e.target.value)
  };

  const setFileRangeValue = (e, file) => {
    e.preventDefault();
    let totalPages = file?.totalPages;
    const newValue = parsePageRanges(e.target.value,totalPages)
    setFileValue(file,'rangeValue',e.target.value);
    if(newValue.length === 0){
      setFileValue(file,'pages',totalPages)
    }else{
      setFileValue(file,'pages',newValue.length)
    }
  }

  const validateRangeValue = (e, file) => {
    let totalPages = file?.totalPages;
    const value = e.target.value;
    if (!isValidPageRange(value,totalPages)) {
      // Invalid or empty, reset to 1-n
      setFileValue(file, 'rangeValue', `1-${totalPages}`);
      setFileValue(file, 'pages', totalPages);
    }
  };

  const setFilePages = (e,file) => {
    e.preventDefault();
    let totalPages = file?.totalPages;
    let pages = file?.pages;

    if(e.target.name === 'range'){
      switch (e.target.value) {
        case 'all':
        case 'customized':
          pages = totalPages;
          break;
        case 'even':
          pages = getEvenPages(totalPages).length;
          break;
        case 'odd':
          pages = getOddPages(totalPages).length;
          break;
        default:
          break;
      }
      setFileValue(file,e.target.name,e.target.value) //set 'range'
      setFileValue(file,'pages',pages) //set pages
      setFileValue(file,'rangeValue','') //reset 'rangeValue'
    }else{
      setFileValue(file,e.target.name,e.target.value)
    }

  }

  const triggerZoom = (file) => {
    const index = previews?.findIndex((preview) => preview === file?.preview);
    if (index !== -1) {
      // If file preview exists in the previews list, trigger the lightbox
      setLightboxController((prev) => ({
        toggler: !prev.toggler, // Flip the toggler
        slide: index + 1, // Update to the correct slide (1-based index)
      }));
    } else {
      //console.warn("File preview not found in previews list.");
      setLightboxController((prev) => ({
        toggler: !prev.toggler, // Flip the toggler
        slide: 1, // Update to the correct slide (1-based index)
      }));
    }
  };

  function renderPagesField(file){
    let totalPages = file?.totalPages;
    let pages = file?.pages;
    let even = getEvenPages(totalPages).length;
    let odd = getOddPages(totalPages).length;
    return <>
      <div className="d-flex align-items-center justify-content-between paper-wrapper" style={{borderTop:'1px solid black'}}>
        <span style={{paddingRight:'4px'}}>Pages</span>
        <select
          name="range"
          id="range"
          onChange={(e) => setFilePages(e, file)}
          disabled={totalPages < 2}
          className="form-select custom-dropbox-select custom-dropbox-select--pages"
        >
          <option value="all">All({totalPages})</option>
          {totalPages > 1 && <option value="odd">Odd pages({odd})</option>}
          {totalPages > 1 && <option value="even">Even pages({even})</option>}
          {totalPages > 1 && <option value="customized">Customized{file?.range == 'customized' ? `(${pages})` : ''}</option>}
        </select>
      </div>
      {file?.range == 'customized' && <div className="d-flex align-items-center justify-content-between paper-wrapper" style={{borderTop:'1px solid black'}}>
        <input 
          type="text" 
          style={{border:'none',background:'none',padding:'5px',color:  (file?.rangeValue != '' && !isValidPageRange(file?.rangeValue,file?.totalPages)) ? 'red':'inherit' }}
          name="rangeValue" 
          autoFocus={true}
          id="rangeValue"
          onChange={(e) => setFileRangeValue(e,file)}
          onBlur={(e) => validateRangeValue(e,file)}
          value={file?.rangeValue} 
          placeholder="e.g. 1-5, 8, 11-13"
        />
      </div>}
    </>
  }

  async function prepareFiles(files) {
    const filesWithPreviews = await Promise.all(
      files.map(async (file) => {
        const preview = URL.createObjectURL(file);
        return Object.assign(file, {
          preview,
        });
      })
    );
    setLocalFiles(filesWithPreviews);
  }
  const renderPreviews = async (images) => {
    if (!images || !images.length) {
      console.warn("No images available for previews.");
      return;
    }
    const validPreviews = await images
      ?.filter((image) => image?.type !== "application/pdf") // Filter non-PDF images
      ?.map((image) => image.preview); // Map only valid previews

    if (validPreviews) {
      //console.log(validPreviews)
      setPreviews(validPreviews); // Update only if there are valid previews
    }
  };

  function handleFilePicker(e){
    e.stopPropagation();
    if(!dropboxRef.current) return;
    dropboxRef.current.click();
  }

  useEffect(() => {
    setFiles(localFiles)
    renderPreviews(localFiles);
  }, [localFiles]);

  useEffect(() => {
    prepareFiles(files);
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => localFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  useEffect(() => {
    PDFJS.GlobalWorkerOptions.workerSrc = pdfjsworker;
  }, []);

  return (
    <>
      <div
        className={`custom-dropzone selectForm file-dropzone-wrapper ${
          localFiles.length > 0 ? "length-full" : ""
        }`} 
      >

        {localFiles.map((file,i)=>(
          <FileItem key={file.localId}
            index={i}
            file={file}
            progress={uploadProgress[file.localId] || 0}
            onRemove={onRemove}
            zoom={zoom}
            triggerZoom={triggerZoom}
            handleFilePicker={handleFilePicker}
            showCounters={showCounters}
            retryUpload={retryUpload}
            setFileCounter={setFileCounter}
            setFileType={setFileType}
            showStapling={showStapling}
            showPaper={showPaper}
            showDuplex={showDuplex}
            types={types}
            setType={setType}
            finishings={finishings}
            setFinishing={setFinishing}
            showCertificateLamination={showCertificateLamination}
            laminationOptions={laminationOptions}
            setLamination={showCertificateLamination ? setLamination : undefined}
            data={data}
            setFileBinding={setFileBinding}
            renderPagesField={renderPagesField}
          />
        ))}

        {/* {renderThumbs()} */}
        <div
          {...getRootProps({ className: " d-flex w-100 h-100 file-dropzone" })}
          ref={dropboxRef}
        >
          <input {...getInputProps()}/>
          {localFiles.length <= 0 && (
            <div className="d-flex w-100 align-items-center justify-content-center m-3 text-center"
            >
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

export default FileDropzone;
