import CancelIcon from "@/assets/icons/CancelIcon";
import DoneIcon from "@/assets/icons/DoneIcon";
import React from "react";

const FileItemComponent = ({
    index,
    file,
    progress,
    onRemove,
    zoom,
    triggerZoom,
    handleFilePicker,
    showCounters,
    setFileCounter,
    setFileType,
    showStapling,
    showPaper,
    showDuplex,
    types,
    setType,
    finishings,
    retryUpload,
    setFinishing,
    showCertificateLamination = false,
    laminationOptions = [],
    setLamination,
    setFileBinding,
    data,
    renderPagesField
})=>{
    const totalLength = 295; // your full circle length

    const handleRetryUpload = function(e){
      e.stopPropagation();
      retryUpload(file);
    }

    function renderStatus(status){
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
              <div
        key={file.name + index}
        className={`thumb--img`}
      >
        <div
          className={`thumb--img-item  position-relative`} onClick={handleFilePicker}
        >
          {file?.loading && <div className="thumb--img-item-loading-overlay">
            <img src='/images/Rolling.svg' alt="loading..."/>
          </div>}

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
        </div>
        {zoom && file.type !== "application/pdf" ? (
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
              triggerZoom(file);
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
        ) : (
          <></>
        )}
        <div className="actions">
          <div className="first-row">
            {showCounters && (
              <div className="q-counter" onClick={(e) => e.stopPropagation()}>
                <span
                  className="down"
                  onClick={(e) => setFileCounter(e, file, "minus")}
                >
                  -
                </span>
                <div className="file--count-text">
                  <input type="text" value={file.count} readOnly />
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
          </div>
          {renderPagesField(file)}
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
                  {types.map((item, i) => (
                    <option value={item} key={i}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
          )}

          {showCertificateLamination &&
            laminationOptions.length > 0 &&
            setLamination && (
            <div className="d-flex align-items-center justify-content-between paper-wrapper">
              <select
                name="lamination"
                id=""
                onChange={(e) => setLamination(e, file)}
                className="form-select custom-dropbox-select w-100"
                value={file?.lamination ?? ""}
              >
                {laminationOptions.map((opt, i) => (
                  <option value={opt.value} key={`${opt.value}-${i}`}>
                    {opt.label}
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
                {finishings.map((item) => (
                  <option value={item.value} key={item._id}>
                    {item.value}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showDuplex &&
            <div className="d-flex align-items-center justify-content-between paper-wrapper w-100">
              <select
                name="duplex"
                id="duplex"
                onChange={(e) => setFileBinding(e, file)}
                defaultValue={file?.duplex}
                className="form-select custom-dropbox-select w-100"
              >
                <option value={false}>Single Sided Printing</option>
                <option value={true}>Double Sided Printing</option>
              </select>
            </div>
          }

          {showStapling && <div className="d-flex align-items-center justify-content-between paper-wrapper w-100">
            <select
              name="stapling"
              id="stapling"
              onChange={(e) => setFileBinding(e, file)}
              defaultValue={file?.stapling}
              className="form-select custom-dropbox-select w-100"
            >
              <option value="No">No Stapling</option>
              <option value="Yes">Yes Staple</option>
            </select>
          </div>}

          {showPaper &&
            data?.document_bindings &&
            data?.document_bindings.length > 0 && (
              <div className="d-flex align-items-center justify-content-between paper-wrapper w-100">
                <select
                  name="binding"
                  id="binding"
                  onChange={(e) => setFileBinding(e, file)}
                  className="form-select custom-dropbox-select w-100"
                >
                  <option value="">No Binding</option>
                  {data?.document_bindings?.map((item, i) => (
                    <option value={item?.type} key={i}>
                      {item?.type}
                    </option>
                  ))}
                </select>
              </div>
            )}
          {data?.document_laminations &&
            data?.document_laminations.length > 0 && (
              <div className="d-flex align-items-center justify-content-between paper-wrapper">
                <select
                  name="lamination"
                  id="lamination"
                  onChange={(e) => setFileBinding(e, file)}
                  className="form-select custom-dropbox-select"
                >
                  <option value="">No Lamination</option>
                  {data?.document_laminations?.map((item, i) => (
                    <option value={item?.type} key={i}>
                      {item?.type}
                    </option>
                  ))}
                </select>
              </div>
            )}
          <div className="file--title truncate one-lines">{file.name}</div>
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

FileItemComponent.displayName = "FileItem";

const FileItem = React.memo(FileItemComponent);

export default FileItem;