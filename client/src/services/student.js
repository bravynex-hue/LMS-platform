import axiosInstance from "@/api/axiosInstance";

export async function fetchStudentViewCourseListService(query) {
  const url = query ? `/student/course/get?${query}` : `/student/course/get`;
  const { data } = await axiosInstance.get(url);
  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(`/student/course/get/details/${courseId}`);
  return data;
}

export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const { data } = await axiosInstance.get(`/student/course/purchase-info/${courseId}/${studentId}`);
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

export async function captureAndFinalizePaymentService(paymentId, payerId, orderId) {
  const { data } = await axiosInstance.post(`/student/order/capture`, { paymentId, payerId, orderId });
  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(`/student/courses-bought/get/${studentId}`);
  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(`/student/course-progress/get/${userId}/${courseId}`);
  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(`/student/course-progress/mark-lecture-viewed`, { userId, courseId, lectureId });
  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(`/student/course-progress/reset-progress`, { userId, courseId });
  return data;
}

export async function updateVideoProgressService(userId, courseId, lectureId, progressPercentage) {
  const { data } = await axiosInstance.post(`/student/course-progress/update-video-progress`, { userId, courseId, lectureId, progressPercentage });
  return data;
}

export async function downloadCertificateService(userId, courseId) {
  const response = await axiosInstance.get(`/student/course-progress/certificate/${userId}/${courseId}`, { responseType: "blob" });
  return response;
}

export async function fetchStudentAnalyticsService(userId) {
  const { data } = await axiosInstance.get(`/student/analytics/get/${userId}`);
  return data;
}

// Live sessions
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

// Messaging
export async function getCourseInstructorService(courseId) {
  const { data } = await axiosInstance.get(`/student/messages/courses/${courseId}/instructor`);
  return data;
}

export async function sendMessageToInstructorService(messageData) {
  const { data } = await axiosInstance.post(`/student/messages/send`, messageData);
  return data;
}

export async function getConversationWithInstructorService(courseId) {
  const { data } = await axiosInstance.get(`/student/messages/conversation/${courseId}`);
  return data;
}

export async function getMyConversationsService() {
  const { data } = await axiosInstance.get(`/student/messages/conversations`);
  return data;
}

export async function clearConversationService(courseId) {
  const { data } = await axiosInstance.delete(`/student/messages/conversation/${courseId}/clear`);
  return data;
}

// Quizzes
export async function getStudentQuizForCourseService(courseId) {
  const { data } = await axiosInstance.get(`/student/quizzes/${courseId}`);
  return data;
}

export async function submitStudentQuizAnswersService(courseId, { studentId, studentName, answers }) {
  const { data } = await axiosInstance.post(`/student/quizzes/${courseId}/submit`, { studentId, studentName, answers });
  return data;
}


