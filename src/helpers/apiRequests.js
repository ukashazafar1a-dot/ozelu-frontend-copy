import { baseURL } from "@/libs/utils";
import axios from "axios";

export const getAreas = async (type) => {
  try {
    const { data } = await axios(`${baseURL}/api/assets/areas/${type}`);
    const { areas } = data;
    return areas;
  } catch (error) {
    console.log("Error", error);
    return [];
  }
};

export const getSignedUrl = async (file,sessionId) => {
  try {
    const { data } = await axios(`${baseURL}/api/assets/storage/signed-url`,{
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        filename: file.name,
        file_type: file.type,
        session_id: sessionId
      }
    })

    const {uploadUrl,key} = data;
    return {uploadUrl,key};
  } catch (error) {
    console.error(error)
    return null;
  }
}

export const removeFile = async (key,session_id) => {
  try {
    const { data } = await axios(`${baseURL}/api/assets/storage/remove-file`,{
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        key,session_id
      }
    })

    return data;
  } catch (error) {
    throw(error);
  }
}

// === Helper: Upload File to S3 with Progress ===
export const uploadFileToS3 = async (file, uploadUrl, onProgress, signal) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) resolve(true);
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };

    xhr.onabort = () => reject(new Error("aborted"));
    signal?.addEventListener("abort", ()=> xhr.abort());

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}