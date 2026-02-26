import axiosInstance from "@/api/axiosInstance";

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
    timeout: 600000, 
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function mediaDeleteService(id) {
  const { data } = await axiosInstance.delete(`/media/delete/${id}`);
  return data;
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
    timeout: 900000, 
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}
