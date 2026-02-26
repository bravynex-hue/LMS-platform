import axiosInstance from "@/api/axiosInstance";

// Course Management
export async function getAllAdminCoursesService() {
  const { data } = await axiosInstance.get("/admin/courses");
  return data;
}

export async function getAdminCourseByIdService(courseId) {
  const { data } = await axiosInstance.get(`/admin/courses/${courseId}`);
  return data;
}

export async function updateAdminCourseService(courseId, courseData) {
  const { data } = await axiosInstance.put(`/admin/courses/${courseId}`, courseData);
  return data;
}

export async function approveCourseService(courseId) {
  const { data } = await axiosInstance.patch(`/admin/courses/${courseId}/approve`);
  return data;
}

export async function unpublishCourseService(courseId) {
  const { data } = await axiosInstance.patch(`/admin/courses/${courseId}/unpublish`);
  return data;
}

// User Management
export async function getAllUsersService() {
  const { data } = await axiosInstance.get("/admin/users");
  return data;
}

export async function createUserService(userData) {
  const { data } = await axiosInstance.post("/admin/users", userData);
  return data;
}

export async function updateUserService(userId, userData) {
  const { data } = await axiosInstance.put(`/admin/users/${userId}`, userData);
  return data;
}

export async function toggleUserBlockService(userId) {
  const { data } = await axiosInstance.patch(`/admin/users/${userId}/toggle-block`);
  return data;
}

export async function deleteUserService(userId) {
  const { data } = await axiosInstance.delete(`/admin/users/${userId}`);
  return data;
}



// Payments & Transactions
export async function getAllTransactionsService() {
  const { data } = await axiosInstance.get("/admin/payments");
  return data;
}

export async function exportTransactionsReportService() {
  const { data } = await axiosInstance.get("/admin/payments/export");
  return data;
}

// Certificates Management
export async function getAllCertificateRequestsService(status) {
  const params = status ? { status } : {};
  const { data } = await axiosInstance.get("/admin/certificates", { params });
  return data;
}

export async function getCertificateRequestByIdService(certificateId) {
  const { data } = await axiosInstance.get(`/admin/certificates/${certificateId}`);
  return data;
}

export async function approveCertificateRequestService(certificateId, approvalData) {
  const { data } = await axiosInstance.post(`/admin/certificates/${certificateId}/approve`, approvalData);
  return data;
}

export async function rejectCertificateRequestService(certificateId, rejectionData) {
  const { data } = await axiosInstance.post(`/admin/certificates/${certificateId}/reject`, rejectionData);
  return data;
}

export async function adminRevokeCertificateService(certificateId, revocationData) {
  const { data } = await axiosInstance.post(`/admin/certificates/${certificateId}/revoke`, revocationData);
  return data;
}

export async function downloadCertificatePDFService(certificateId) {
  const { data } = await axiosInstance.get(`/admin/certificates/${certificateId}/download`);
  return data;
}

// Feedback & Support (Admin)
export async function getAllFeedbackTicketsService() {
  const { data } = await axiosInstance.get("/admin/feedback");
  return data;
}

export async function getAdminFeedbackTicketByIdService(ticketId) {
  const { data } = await axiosInstance.get(`/admin/feedback/${ticketId}`);
  return data;
}

export async function updateFeedbackTicketStatusService(ticketId, statusData) {
  const { data } = await axiosInstance.patch(`/admin/feedback/${ticketId}/status`, statusData);
  return data;
}

export async function resolveFeedbackTicketService(ticketId, adminResponse) {
  const { data } = await axiosInstance.patch(`/admin/feedback/${ticketId}/resolve`, { adminResponse });
  return data;
}
