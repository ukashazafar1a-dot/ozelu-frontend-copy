import { useMemo } from "react";

export default function FileUploadSummary({files}){
    const summary = useMemo(()=>{
        const total = files.length;
        const uploading = files.filter(f => f.status === "uploading").length;
        const uploaded = files.filter(f => f.status === "uploaded").length;
        const failed = files.filter(f => f.status === "failed").length;

        return { total, uploading, uploaded, failed };
    }, [files]);

    return (
        <div 
            style={{
                background: "#f8f9fa",
                borderRadius: "10px",
                padding: "15px",
                margin: "10px 0",
                fontFamily: "sans-serif",
            }}  
        >
            <h4 style={{ marginBottom: "10px" }}>Upload Summary</h4>
            <p>📦 Total Files: {summary.total}</p>
            <p>📤 Uploading: {summary.uploading}</p>
            <p>✅ Uploaded: {summary.uploaded}</p>
            <p>❌ Failed: {summary.failed}</p>
        </div>
    )
}