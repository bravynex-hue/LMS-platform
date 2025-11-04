import axios from "axios";
import { toast } from "@/hooks/use-toast";
import tokenManager from "@/utils/tokenManager";

const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, ''),
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
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  const csrfUrl = `${base.replace(/\/$/, '')}/csrf-token`;
  
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
        console.log('CSRF token refreshed successfully');
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
    const isInstructorCourseEndpoint = /\/instructor\/course\//.test(url) || /\/instructor\/live-sessions\//.test(url);
    
    // Check if this is a student order endpoint (excluded from CSRF)
    const isStudentOrderEndpoint = /\/student\/order\//.test(url);
    
    // Check if this is a secure instructor endpoint (excluded from CSRF)
    const isSecureInstructorEndpoint = /\/secure\/instructor\//.test(url);
    
    // Check if this is a course-related endpoint
    const isCourseRelated = /\/course\//.test(url) || /\/student\//.test(url) || /\/course-progress\//.test(url);
    
    // Only attach CSRF token for non-auth, non-course-progress, non-media-upload, non-instructor-course, non-student-order, and non-secure-instructor endpoints
    const shouldAttachCsrf = !isAuthEndpoint && !isCourseProgressEndpoint && !isMediaUploadEndpoint && !isInstructorCourseEndpoint && !isStudentOrderEndpoint && !isSecureInstructorEndpoint && ["post", "put", "patch", "delete"].includes(method);
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
  (error) => {
    const status = error?.response?.status;
    const url = (error?.config?.url || "").toString();
    const isAuthLogin = /\/auth\/login($|\?)/.test(url);
    const isAuthRegister = /\/auth\/register($|\?)/.test(url);
    const isAuthForgot = /\/(auth|secure)\/(forgot-password|reset-password)($|\?)/.test(url);
    const isSecureContact = /\/secure\/contact($|\?)/.test(url);
    const isAuthEndpoint = isAuthLogin || isAuthRegister || isAuthForgot || isSecureContact;
    const isMediaUpload = /\/media\/(upload|bulk-upload)/.test(url);
    const isNotifyContact = /\/notify\/contact-admin($|\?|\/)/.test(url);
    const isVideoProgress = /\/course-progress\//.test(url) || /\/student\/course/.test(url);
    const isCourseRelated = /\/course\//.test(url) || /\/student\//.test(url);
    const isInstructorCourse = /\/instructor\/course\//.test(url) || /\/instructor\/live-sessions\//.test(url);
    const isStudentOrder = /\/student\/order\//.test(url);
    const isSecureInstructor = /\/secure\/instructor\//.test(url);
    
    
    if (status === 401 || status === 403) {
      const message = error?.response?.data?.message || (status === 401 ? "Unauthorized" : "Forbidden");
      
      // Special handling for media uploads - don't auto-logout on token expiry
      if (isMediaUpload && status === 401 && message === "Token expired") {
        toast({ 
          title: "Upload failed", 
          description: "Your session expired during upload. Please refresh the page and try again." 
        });
        return Promise.reject(error);
      }
      
      if (!isAuthEndpoint && !isVideoProgress && !isCourseRelated && !isMediaUpload && !isInstructorCourse && !isStudentOrder && !isNotifyContact && !isSecureInstructor) {
        // Only clear token and redirect for non-course related endpoints
        tokenManager.removeToken();
        toast({ title: "Session expired", description: "Please login again to continue" });
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      } else if (isAuthLogin) {
        // For login failures, do not redirect or clear input; allow caller to handle toast
      } else if (isVideoProgress || isCourseRelated || isInstructorCourse || isStudentOrder || isSecureInstructor) {
        console.warn("Course/instructor-related request failed:", message);
      }
    }
    // CSRF errors - clear token and retry (but not for auth endpoints)
    if (status === 419 || 
        error?.response?.data?.message?.toLowerCase().includes("csrf") ||
        error?.response?.data?.message?.toLowerCase().includes("invalid token")) {
      // Clear cached CSRF token to force refresh
      csrfToken = null;
      lastFetchTime = 0;
      retryCount = 0;
      
      // Don't show CSRF error for auth endpoints, course-related requests, media uploads, instructor course, secure instructor, or student order endpoints
      if (!isAuthEndpoint && !isVideoProgress && !isCourseRelated && !isMediaUpload && !isInstructorCourse && !isStudentOrder && !isNotifyContact && !isSecureInstructor) {
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
      } else {
        console.warn("CSRF token issue for request, token cleared for retry.");
      }
    }
    if (!status) {
      toast({ title: "Network error", description: error?.message || "Request failed" });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
