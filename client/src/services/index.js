import axiosInstance from "@/api/axiosInstance";

export async function registerService(formData) {
  const { data } = await axiosInstance.post("/auth/register", formData);
  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", formData);
  return data;
}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");
  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
    timeout: 600000, // 10 minutes timeout for large video files
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

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/instructor/course/get`);
  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);
  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/instructor/course/get/details/${id}`
  );
  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );
  return data;
}

export async function deleteCourseService(id, forceDelete = false) {
  try {
    const url = forceDelete ? `/instructor/course/delete/${id}?force=true` : `/instructor/course/delete/${id}`;
    const { data } = await axiosInstance.delete(url);
    return data;
  } catch (error) {
    // Re-throw the error with proper message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to delete course');
    }
  }
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
    timeout: 900000, // 15 minutes timeout for bulk uploads
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function fetchStudentViewCourseListService(query) {
  const url = query ? `/student/course/get?${query}` : `/student/course/get`;
  const { data } = await axiosInstance.get(url);
  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/course/get/details/${courseId}`
  );
  return data;
}

export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const { data } = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );
  return data;
}

export async function createPaymentService(formData) {
  const { data } = await axiosInstance.post(`/student/order/create`, formData);
  return data;
}

export async function createRazorpayOrderService(payload) {
  const { data } = await axiosInstance.post(`/student/order/create`, payload);
  return data;
}

export async function captureAndFinalizePaymentService(
  paymentId,
  payerId,
  orderId
) {
  const { data } = await axiosInstance.post(`/student/order/capture`, {
    paymentId,
    payerId,
    orderId,
  });
  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );
  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );
  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );
  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );
  return data;
}

export async function updateVideoProgressService(userId, courseId, lectureId, progressPercentage) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/update-video-progress`,
    {
      userId,
      courseId,
      lectureId,
      progressPercentage,
    }
  );
  return data;
}

export async function downloadCertificateService(userId, courseId) {
  const response = await axiosInstance.get(
    `/student/course-progress/certificate/${userId}/${courseId}`,
    {
      responseType: "blob",
    }
  );
  return response;
}

export async function contactAdminService({ 
  fromEmail, 
  fromName, 
  phoneNumber,
  course,
  segment,
  institution,
  subject, 
  message 
}) {
  const { data } = await axiosInstance.post(`/notify/contact-admin`, {
    fromEmail,
    fromName,
    phoneNumber,
    course,
    segment,
    institution,
    subject,
    message,
  });
  return data;
}

export async function fetchStudentAnalyticsService(userId) {
  const { data } = await axiosInstance.get(`/student/analytics/get/${userId}`);
  return data;
}

export async function fetchInstructorAnalyticsService(instructorId) {
  try {
    console.log('Fetching analytics for instructor:', instructorId);
    const { data } = await axiosInstance.get(`/instructor/analytics/get/${instructorId}`);
    console.log('Analytics service response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching instructor analytics:', error);
    return { success: false, message: error.message };
  }
}

// Certificate approvals (secure instructor)
export async function approveCertificateService({ courseId, studentId, approverId }) {
  const { data } = await axiosInstance.post(`/secure/instructor/certificates/approve`, { courseId, studentId, approverId });
  return data;
}

export async function revokeCertificateService({ courseId, studentId }) {
  const { data } = await axiosInstance.post(`/secure/instructor/certificates/revoke`, { courseId, studentId });
  return data;
}

export async function listApprovedCertificatesService(courseId) {
  const { data } = await axiosInstance.get(`/secure/instructor/certificates/approved/${courseId}`);
  return data;
}

export async function checkCertificateEligibilityService(courseId, studentId) {
  const { data } = await axiosInstance.get(`/secure/instructor/certificates/eligibility/${courseId}/${studentId}`);
  return data;
}

// Internship programs - instructor
export async function createInternshipProgramService(payload) {
  const { data } = await axiosInstance.post(`/instructor/internships/create`, payload);
  return data;
}

export async function listInstructorProgramsService(instructorId) {
  const { data } = await axiosInstance.get(`/instructor/internships/list/${instructorId}`);
  return data;
}

// Live sessions - instructor
export async function scheduleLiveSessionService(payload) {
  const { data } = await axiosInstance.post(`/instructor/live-sessions/schedule`, payload);
  return data;
}

export async function addLiveSessionRecordingService(sessionId, recordingUrl) {
  const { data } = await axiosInstance.post(`/instructor/live-sessions/${sessionId}/recording`, { recordingUrl });
  return data;
}

export async function addLiveSessionResourceService(sessionId, { title, url }) {
  const { data } = await axiosInstance.post(`/instructor/live-sessions/${sessionId}/resources`, { title, url });
  return data;
}

export async function setLiveSessionMeetingLinkService(sessionId, meetingLink) {
  const { data } = await axiosInstance.post(`/instructor/live-sessions/${sessionId}/meeting-link`, { meetingLink });
  return data;
}

export async function listProgramSessionsInstructorService(programId) {
  const { data } = await axiosInstance.get(`/instructor/live-sessions/program/${programId}`);
  return data;
}

export async function deleteLiveSessionService(sessionId, instructorId) {
  const { data } = await axiosInstance.delete(`/instructor/live-sessions/${sessionId}` + (instructorId ? `?instructorId=${instructorId}` : ""));
  return data;
}

export async function getSessionAttendanceService(sessionId) {
  const { data } = await axiosInstance.get(`/instructor/live-sessions/${sessionId}/attendance`);
  return data;
}
// Live sessions - student
export async function listProgramSessionsStudentService(programId) {
  const { data } = await axiosInstance.get(`/student/live-sessions/program/${programId}`);
  return data;
}

export async function getLiveSessionDetailsService(sessionId) {
  const { data } = await axiosInstance.get(`/student/live-sessions/${sessionId}`);
  return data;
}

export async function joinLiveSessionService(sessionId, { studentId, studentName, studentEmail }) {
  const { data } = await axiosInstance.post(`/student/live-sessions/${sessionId}/join`, { studentId, studentName, studentEmail });
  return data;
}

// Google - instructor
// Google integration removed


// Quizzes - instructor
export async function upsertCourseQuizService(courseId, payload) {
  const { data } = await axiosInstance.post(`/instructor/quizzes/${courseId}`, payload);
  return data;
}

export async function getInstructorCourseQuizService(courseId) {
  const { data } = await axiosInstance.get(`/instructor/quizzes/${courseId}`);
  return data;
}

export async function listQuizSubmissionsService(courseId) {
  const { data } = await axiosInstance.get(`/instructor/quizzes/${courseId}/submissions`);
  return data;
}

export async function deleteCourseQuizService(courseId) {
  const { data } = await axiosInstance.delete(`/instructor/quizzes/${courseId}`);
  return data;
}

// Quizzes - student
export async function getStudentQuizForCourseService(courseId) {
  const { data } = await axiosInstance.get(`/student/quizzes/${courseId}`);
  return data;
}

export async function submitStudentQuizAnswersService(courseId, { studentId, studentName, answers }) {
  const { data } = await axiosInstance.post(`/student/quizzes/${courseId}/submit`, { studentId, studentName, answers });
  return data;
}




