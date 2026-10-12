import React, { useMemo } from 'react'

function FileUploadingStatus({files}) {
    const summary = useMemo(()=>{
        const total = files.length;
        const uploading = files.filter(f => f.status === "uploading").length;
        const uploaded = files.filter(f => f.status === "uploaded").length;
        const failed = files.filter(f => f.status === "failed").length;

        return { total, uploading, uploaded, failed };
    }, [files]);

    if(summary.uploading === 0) return '';

    return (
            <span style={{color:'var(--primary-color)'}}>uploading {summary.uploaded}/{summary.total}...</span>
    )
}

export default FileUploadingStatus