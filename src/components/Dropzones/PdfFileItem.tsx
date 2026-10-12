import CancelIcon from "@/assets/icons/CancelIcon";
import DoneIcon from "@/assets/icons/DoneIcon";
import React from "react";

const PdfFileItemComponent = ({
    index,
    file,
    progress,
    onRemove,
    zoom,
    triggerZoom,
    handleFilePicker,
    showCounters,
    showPrint,
    setFileCounter,
    setFileType,
    showPaper,
    setPaperType,
    paperTypes,
    thickness,
    setThickness,
    retryUpload,
    types,
    setType,
    finishings,
    setFinishing,
    showThickness
}:any) => {

  const totalLength = 295; // your full circle length

  const handleRetryUpload = function(e:any){
    e.stopPropagation();
    retryUpload(file);
  }

  function renderStatus(status:any){
    switch (status) {
        case 'uploaded':
            return <div className='thumb--img-item__status'>
                <DoneIcon/>
            </div>;
        case 'failed':
            return <div onClick={handleRetryUpload} className='thumb--img-item__status'>
                <CancelIcon/>
            </div>;
        default:
            return '';
    }
  }

   return (
            <div key={file.name + index} className={`thumb--img`}>
              <div className={`thumb--img-item position-relative`} onClick={handleFilePicker}>
                
                {/* (progress < 100 && progress > 0) && */}
                {(progress < 100 && progress > 0) && <div className="thumb--img-item__progressbar">
                  <svg width="114" height="114" viewBox="-14.25 -14.25 142.5 142.5" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{transform:"rotate(-90deg)"}}>
                    <circle r="47" cx="57" cy="57" fill="transparent" stroke="#e0e0e0" strokeWidth="11"></circle>
                    <circle r="47" cx="57" cy="57" stroke="var(--primary-color)" strokeWidth="12" strokeLinecap="round" strokeDashoffset={(totalLength - (progress / 100) * totalLength) +"px"} fill="transparent" strokeDasharray="295.16px"></circle>
                    <text x="36px" y="70px" fill="var(--primary-color)" fontSize="40px" fontWeight="bold" style={{transform:"rotate(90deg) translate(0px, -110px)"}}>{progress}</text>
                  </svg>
                </div>}
                {renderStatus(file?.status)}
                <img src={file?.preview} alt="file" />
                {/* {checkFileSize(file) && (
                  <abbr
                    title="Per file size should not exceed 10MB, please use an online tool to compress the photos greater than 10MB and re-upload"
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      left: "5px",
                      cursor: "not-allowed",
                      background: 'white',
                      padding: '3px',
                      borderRadius: '3px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '1px solid red'
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-warn"
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                    >
                      <path
                        d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z"
                        fill="#f85431"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </abbr>
                )} */}
              </div>
              {zoom && (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    position: "absolute",
                    top: "5px",
                    left: "5px",
                    padding: "3px",
                    borderRadius: "6px",
                    background: "#e7e7e7",
                    cursor: "pointer",
                    zIndex: 1,
                  }}
                  onClick={() => {
                    triggerZoom(index);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    style={{ fill: "#000", width: "16px", height: "16px" }}
                  >
                    <path d="m21 15.344-2.121 2.121-3.172-3.172-1.414 1.414 3.172 3.172L15.344 21H21zM3 8.656l2.121-2.121 3.172 3.172 1.414-1.414-3.172-3.172L8.656 3H3zM21 3h-5.656l2.121 2.121-3.172 3.172 1.414 1.414 3.172-3.172L21 8.656zM3 21h5.656l-2.121-2.121 3.172-3.172-1.414-1.414-3.172 3.172L3 15.344z"></path>
                  </svg>
                </div>
              )}
              <div className={`actions sm-bt-${showPrint}`}>
                {showCounters && (
                  <div className="q-counter" onClick={(e) => e.stopPropagation()}>
                    <span
                      className="down"
                      onClick={(e) => setFileCounter(e, file, "minus")}
                    >
                      -
                    </span>
                    <div className="file--count-text">
                      <input type="text" value={file?.count} readOnly />
                      <div className="tiny-text">
                        {file?.count} {file?.count > 1 ? "Copies" : "Copy"}
                      </div>
                    </div>
                    <span
                      className="up"
                      onClick={(e) => setFileCounter(e, file, "plus")}
                    >
                      +
                    </span>
                  </div>
                )}
                {showPrint && (
                  <div className="small-btns" onClick={(e) => e.stopPropagation()}>
                    <div
                      className={`tiny-btn ${
                        file?.print == "portrait" ? "active-me" : "no-active"
                      }`}
                      onClick={(e) => setFileType(e, file, "portrait")}
                    >
                      Portrait
                    </div>
                    <div
                      className={`tiny-btn ${
                        file?.print == "landscape" ? "active-me" : "no-active"
                      }`}
                      onClick={(e) => setFileType(e, file, "landscape")}
                    >
                      Landscape
                    </div>
                  </div>
                )}
                {showPaper && (
                  <div className="d-flex align-items-center justify-content-between paper-wrapper">
                    <select
                      name=""
                      id=""
                      onChange={(e) => setPaperType(e, file)}
                      className="form-select custom-dropbox-select w-100"
                      defaultValue={file?.paperType}
                    >
                      <option value="">Select Paper Type</option>
                      {paperTypes.map((item:any, i:any) => (
                        <option value={item} key={i}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
    
                {types.length > 0 && (
                  <div className="d-flex align-items-center justify-content-between paper-wrapper">
                    <select
                      name=""
                      id=""
                      onChange={(e) => setType(e, file)}
                      className="form-select custom-dropbox-select w-100"
                      defaultValue={file?.simpleType}
                    >
                      <option value="">Select Type</option>
                      {types.map((item:any, i:any) => (
                        <option value={item} key={i}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {finishings.length > 0 && (
                  <div className="d-flex align-items-center justify-content-between paper-wrapper">
                    <select
                      name=""
                      id=""
                      onChange={(e) => setFinishing(e, file)}
                      className="form-select custom-dropbox-select w-100"
                      defaultValue={file?.finishing}
                    >
                      <option value="">Select Finishing</option>
                      {finishings.map((item:any, i:any) => (
                        <option value={item.value} key={item._id}>
                          {item.value}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {showThickness && (
                  <div className="d-flex align-items-center justify-content-between paper-wrapper">
                    <select
                      name=""
                      id=""
                      onChange={(e) => setThickness(e,file)}
                      className="form-select custom-dropbox-select w-100"
                      defaultValue={file?.thickness}
                    >
                      <option value="">Select thickness</option>
                      {thickness.map((item:any, i:any) => (
                        <option value={item?.value} key={i}>
                          {item?.value}mm Foam Board
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
            </div>
   ) 
};

PdfFileItemComponent.displayName = "PdfFileItem";

const PdfFileItem = React.memo(PdfFileItemComponent)

export default PdfFileItem