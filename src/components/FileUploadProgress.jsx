import { useMemo } from "react";

export default function FileUploadProgress({files}){
    const summary = useMemo(()=>{
        const total = files.length;
        const uploading = files.filter(f => f.status === "uploading").length;
        const uploaded = files.filter(f => f.status === "uploaded").length;
        // const failed = files.filter(f => f.status === "failed").length;
        const progress = (uploaded + uploading) > 0 ? (uploaded / (uploaded+uploading)) * 100 : 0;

        // return { total, uploading, uploaded, failed };
        return {uploaded,uploading,progress,total}
    }, [files]);

    if(summary.total == 0) return '';

    return (
        <div className="upload-progress">
            <span className="upload-progress--slider">
                <span className="upload-progress--bar">
                    <span className="upload-progress--bar-1"
                        style={{width: `${summary.progress}%`}}
                    >
                        <span className="upload-progress--bar-2">
                            {summary.progress === 100 ? (
                                'All Files Uploaded'
                            ) : (
                                `Uploading... ${summary.uploaded}/${summary.uploaded+summary.uploading} Files`
                            )}
                        </span>
                    </span>
                </span>
            </span>
        </div>
    )
}