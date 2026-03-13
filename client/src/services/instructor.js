import axiosInstance from "@/api/axiosInstance";

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/instructor/course/get`);
  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);
  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(`/instructor/course/get/details/${id}`);
  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(`/instructor/course/update/${id}`, formData);
  return data;
}

export async function deleteCourseService(id, forceDelete = false) {
  try {
    const url = forceDelete ? `/instructor/course/delete/${id}?force=true` : `/instructor/course/delete/${id}`;
    const { data } = await axiosInstance.delete(url);
    return data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to delete course');
    }
  }
}

export async function fetchInstructorAnalyticsService(instructorId) {
  try {
    const { data } = await axiosInstance.get(`/instructor/analytics/get/${instructorId}`);
    return data;
  } catch (error) {
    console.error('Error fetching instructor analytics:', error);
    return { success: false, message: error.message };
  }
}

// Certificate actions
export async function approveCertificateService({ courseId, studentId, approverId }) {
  const { data } = await axiosInstance.post(`/secure/instructor/certificates/approve`, { courseId, studentId, approverId });
  return data;
}

export async function instructorRevokeCertificateService({ courseId, studentId }) {
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

// Messaging
export async function getCourseStudentsService(courseId) {
  const { data } = await axiosInstance.get(`/instructor/messages/courses/${courseId}/students`);
  return data;
}

export async function sendMessageToStudentService(messageData) {
  const { data } = await axiosInstance.post(`/instructor/messages/send`, messageData);
  return data;
}

export async function getConversationService(courseId, studentId) {
  const { data } = await axiosInstance.get(`/instructor/messages/conversation/${courseId}/${studentId}`);
  return data;
}

export async function getAllConversationsService() {
  const { data} = await axiosInstance.get(`/instructor/messages/conversations`);
  return data;
}

export async function clearInstructorConversationService(courseId, studentId) {
  const { data } = await axiosInstance.delete(`/instructor/messages/conversation/${courseId}/${studentId}/clear`);
  return data;
}




