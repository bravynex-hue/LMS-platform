import axios from "axios";
import { toast } from "@/hooks/use-toast";
import tokenManager from "@/utils/tokenManager";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

const axiosInstance = axios.create({
  baseURL: API_BASE.replace(/\/$/, ""),
  withCredentials: true,
});

// Fetch CSRF token with better caching and retry logic
let csrfToken = null;
let csrfFetchInFlight = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (increased for better UX)
const MAX_RETRIES = 3; 
let retryCount = 0;

async function ensureCsrfToken() {
  const now = Date.now();
  
  // Return cached token if still valid
  if (csrfToken && (now - lastFetchTime) < CACHE_DURATION) {
    return csrfToken;
  }
  
  // If already fetching, wait for it
  if (csrfFetchInFlight) {
    return csrfFetchInFlight;
  }

  if (retryCount >= MAX_RETRIES) {
    console.warn('CSRF token fetch failed after max retries, clearing cache');
    csrfToken = null;
    lastFetchTime = 0;
    retryCount = 0;
    return null;
  }
  
  // Start new fetch
  const base =
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const csrfUrl = `${base.replace(/\/$/, "")}/csrf-token`;
  
  csrfFetchInFlight = axios
    .get(csrfUrl, { 
      withCredentials: true,
      timeout: 10000, // Increased timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      if (res.data && res.data.success && res.data.csrfToken) {
        csrfToken = res.data.csrfToken;
        lastFetchTime = now;
        retryCount = 0;
        return csrfToken;
      } else {
        throw new Error('Invalid CSRF token response');
      }
    })
    .catch((error) => {
      console.warn("CSRF token fetch failed:", error.message);
      retryCount++;
      csrfToken = null; // Clear invalid token
      return null;
    })
    .finally(() => {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      setTimeout(() => {
        csrfFetchInFlight = null;
      }, retryDelay);
    });
    
  return csrfFetchInFlight;
}

axiosInstance.interceptors.request.use(
  async (config) => {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();
    
    // Check if this is an authentication endpoint
    const isAuthEndpoint = /\/auth\/(login|register|forgot-password|reset-password)/.test(url) ||
                          /\/secure\/(login|register|forgot-password|reset-password|contact)/.test(url);
    
    // Check if this is a course progress endpoint (excluded from CSRF)
    const isCourseProgressEndpoint = /\/student\/course-progress\//.test(url);
    
    // Check if this is a media upload endpoint (excluded from CSRF)
    const isMediaUploadEndpoint = /\/media\/(upload|bulk-upload)/.test(url);
    
    // Check if this is an instructor course endpoint (excluded from CSRF)
    const isInstructorCourseEndpoint = /\/instructor\/course\//.test(url) || /\/instructor\/live-sessions\//.test(url) || /\/instructor\/messages\//.test(url);
    
    // Check if this is a student order endpoint (excluded from CSRF)
    const isStudentOrderEndpoint = /\/student\/order\//.test(url);
    
    // Check if this is a student messages endpoint (excluded from CSRF)
    const isStudentMessagesEndpoint = /\/student\/messages\//.test(url);
    
    // Check if this is a secure instructor endpoint (excluded from CSRF)
    const isSecureInstructorEndpoint = /\/secure\/instructor\//.test(url);
    
    // Check if this is an admin endpoint (excluded from CSRF)
    const isAdminEndpoint = /\/admin\//.test(url);
    
    // Check if this is a feedback endpoint (excluded from CSRF)
    const isFeedbackEndpoint = /\/feedback($|\/)/.test(url);
    
    // Check if this is a course-related endpoint
    const isCourseRelated = /\/course\//.test(url) || /\/student\//.test(url) || /\/course-progress\//.test(url);
    
    // Only attach CSRF token for non-auth, non-course-progress, non-media-upload, non-instructor-course, non-student-order, non-secure-instructor, non-admin, and non-feedback endpoints
    const shouldAttachCsrf = !isAuthEndpoint && !isCourseProgressEndpoint && !isMediaUploadEndpoint && !isInstructorCourseEndpoint && !isStudentOrderEndpoint && !isSecureInstructorEndpoint && !isAdminEndpoint && !isFeedbackEndpoint && !isStudentMessagesEndpoint && !isCourseRelated && ["post", "put", "patch", "delete"].includes(method);
    if (shouldAttachCsrf) {
      try {
        const token = await ensureCsrfToken();
        if (token) config.headers["X-CSRF-Token"] = token;
      } catch (error) {
        // For course-related requests, don't fail if CSRF token can't be obtained
        if (!isCourseRelated) {
          console.warn("Failed to get CSRF token:", error);
        }
      }
    }

    // Get current token and check if it's valid
    const accessToken = tokenManager.getCurrentToken();
    if (typeof accessToken === "string" && accessToken.trim().length > 0) {
      // For media uploads, check if token will expire soon and warn user
      const isMediaUpload = /\/media\/(upload|bulk-upload)/.test(url);
      if (isMediaUpload && tokenManager.willTokenExpireSoon(accessToken, 10)) {
        console.warn("Token will expire soon during upload. Consider refreshing the page.");
      }
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

// Global response interceptor for auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // If 401 (Unauthorized) and not already retrying
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the HttpOnly cookie
        const response = await axios.post(
          `${API_BASE.replace(/\/$/, "")}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          const { accessToken } = response.data.data;
          tokenManager.setToken(accessToken);
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Session refresh failed:", refreshError);
        // If refresh fails, log out the user
        tokenManager.removeToken();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/auth")) {
          window.location.href = "/auth";
        }
      }
    }

    const url = (error?.config?.url || "").toString();
    // ... rest of the error handling (keeping existing logic for other codes)
    const isAuthLogin = /\/auth\/login($|\?)/.test(url);
    const isAuthRegister = /\/auth\/register($|\?)/.test(url);
    const isAuthForgot = /\/(auth|secure)\/(forgot-password|reset-password)($|\?)/.test(url);
    const isSecureContact = /\/secure\/contact($|\?)/.test(url);
    const isAuthEndpoint = isAuthLogin || isAuthRegister || isAuthForgot || isSecureContact;
    const isMediaUpload = /\/media\/(upload|bulk-upload)/.test(url);
    const isMediaDelete = /\/media\/delete\//.test(url);
    const isNotifyContact = /\/notify\/contact-admin($|\?|\/)/.test(url);
    const isVideoProgress = /\/course-progress\//.test(url) || /\/student\/course/.test(url);
    const isCourseRelated = /\/course\//.test(url) || /\/student\//.test(url);
    const isInstructorCourse = /\/instructor\/course\//.test(url) || /\/instructor\/live-sessions\//.test(url) || /\/instructor\/messages\//.test(url);
    const isStudentOrder = /\/student\/order\//.test(url);
    const isSecureInstructor = /\/secure\/instructor\//.test(url);
    const isAdminEndpoint = /\/admin\//.test(url);
    const isFeedbackEndpoint = /\/feedback($|\/)/.test(url);

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      // Existing logic for non-retriable errors
      const message = error?.response?.data?.message || (status === 401 ? "Unauthorized" : "Forbidden");
      if (isMediaUpload && status === 401 && message === "Token expired") {
        toast({ 
          title: "Upload failed", 
          description: "Your session expired during upload. Please refresh the page and try again." 
        });
        return Promise.reject(error);
      }
      
      if (!isAuthEndpoint && !isVideoProgress && !isCourseRelated && !isMediaUpload && !isMediaDelete && !isInstructorCourse && !isStudentOrder && !isNotifyContact && !isSecureInstructor && !isAdminEndpoint && !isFeedbackEndpoint) {
        tokenManager.removeToken();
        toast({ title: "Session expired", description: "Please login again to continue" });
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      }
    }

    // CSRF errors - clear token and retry
    if (status === 419 || 
        error?.response?.data?.message?.toLowerCase().includes("csrf") ||
        error?.response?.data?.message?.toLowerCase().includes("invalid token")) {
      csrfToken = null;
      lastFetchTime = 0;
      retryCount = 0;
      
      if (!isAuthEndpoint && !isVideoProgress && !isCourseRelated && !isMediaUpload && !isMediaDelete && !isInstructorCourse && !isStudentOrder && !isNotifyContact && !isSecureInstructor && !isAdminEndpoint && !isFeedbackEndpoint) {
        toast({ 
          title: "Security error", 
          description: "Please refresh the page and try again",
          variant: "destructive"
        });
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }, 2000);
      }
    }
    if (!status) {
      toast({ title: "Network error", description: error?.message || "Request failed" });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
