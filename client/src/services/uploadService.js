// Enhanced upload service with better error handling and token management
import axiosInstance from '@/api/axiosInstance';
import tokenManager from '@/utils/tokenManager';
import { toast } from '@/hooks/use-toast';

class UploadService {
  constructor() {
    this.uploadQueue = [];
    this.isUploading = false;
  }

  // Check if token is valid before upload
  async validateTokenBeforeUpload() {
    const token = tokenManager.getCurrentToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    if (tokenManager.isTokenExpired(token)) {
      throw new Error('Authentication token has expired. Please refresh the page and login again.');
    }

    if (tokenManager.willTokenExpireSoon(token, 5)) {
      console.warn('Token will expire soon. Upload may fail if it takes too long.');
    }

    return token;
  }

  // Enhanced single file upload with retry logic
  async uploadFile(formData, onProgressCallback, retryCount = 0) {
    const maxRetries = 2;
    
    try {
      // Validate token before upload
      await this.validateTokenBeforeUpload();

      const response = await axiosInstance.post("/media/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgressCallback(percentCompleted);
        },
        timeout: 900000, // 15 minutes timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle specific error cases
      if (error?.response?.status === 401) {
        const message = error?.response?.data?.message || 'Authentication failed';
        
        if (message.includes('expired') || message.includes('Token expired')) {
          if (retryCount < maxRetries) {
            console.log(`Token expired during upload. Retrying... (${retryCount + 1}/${maxRetries})`);
            // Wait a bit before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.uploadFile(formData, onProgressCallback, retryCount + 1);
          } else {
            throw new Error('Your session expired during upload. Please refresh the page and try again.');
          }
        } else {
          throw new Error('Authentication failed. Please refresh the page and login again.');
        }
      } else if (error?.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again with a smaller file or check your internet connection.');
      } else if (error?.response?.status === 413) {
        throw new Error('File too large. Please choose a smaller file.');
      } else if (error?.response?.status === 415) {
        throw new Error('Unsupported file type. Please choose a valid video file.');
      } else if (error?.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Upload failed. Please try again.');
      }
    }
  }

  // Enhanced bulk upload with retry logic
  async uploadBulkFiles(formData, onProgressCallback, retryCount = 0) {
    const maxRetries = 2;
    
    try {
      // Validate token before upload
      await this.validateTokenBeforeUpload();

      const response = await axiosInstance.post("/media/bulk-upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgressCallback(percentCompleted);
        },
        timeout: 1200000, // 20 minutes timeout for bulk uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Bulk upload error:', error);
      
      // Handle specific error cases
      if (error?.response?.status === 401) {
        const message = error?.response?.data?.message || 'Authentication failed';
        
        if (message.includes('expired') || message.includes('Token expired')) {
          if (retryCount < maxRetries) {
            console.log(`Token expired during bulk upload. Retrying... (${retryCount + 1}/${maxRetries})`);
            // Wait a bit before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.uploadBulkFiles(formData, onProgressCallback, retryCount + 1);
          } else {
            throw new Error('Your session expired during upload. Please refresh the page and try again.');
          }
        } else {
          throw new Error('Authentication failed. Please refresh the page and login again.');
        }
      } else if (error?.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again with smaller files or check your internet connection.');
      } else if (error?.response?.status === 413) {
        throw new Error('Files too large. Please choose smaller files.');
      } else if (error?.response?.status === 415) {
        throw new Error('Unsupported file types. Please choose valid video files.');
      } else if (error?.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Bulk upload failed. Please try again.');
      }
    }
  }

  // Validate file before upload
  validateFile(file, maxSize = 2 * 1024 * 1024 * 1024) {
    if (!file) {
      throw new Error('No file selected.');
    }

    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${Math.round(maxSize / (1024 * 1024 * 1024))}GB limit. Please choose a smaller file.`);
    }

    if (!file.type.startsWith('video/')) {
      throw new Error('Please select a valid video file.');
    }

    return true;
  }

  // Validate multiple files before upload
  validateFiles(files, maxSize = 2 * 1024 * 1024 * 1024) {
    if (!files || files.length === 0) {
      throw new Error('No files selected.');
    }

    const invalidFiles = files.filter(file => 
      file.size > maxSize || !file.type.startsWith('video/')
    );

    if (invalidFiles.length > 0) {
      throw new Error(`Some files are invalid. Please ensure all files are videos under ${Math.round(maxSize / (1024 * 1024 * 1024))}GB.`);
    }

    return true;
  }
}

// Create singleton instance
const uploadService = new UploadService();

export default uploadService;
