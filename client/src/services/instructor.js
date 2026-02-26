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

// Live sessions
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

// Quizzes
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

// Internship programs - instructor
export async function createInternshipProgramService(payload) {
  const { data } = await axiosInstance.post(`/instructor/internships/create`, payload);
  return data;
}

export async function listInstructorProgramsService(instructorId) {
  const { data } = await axiosInstance.get(`/instructor/internships/list/${instructorId}`);
  return data;
}

// Internship tasks - instructor
export async function createInternshipTaskService(programId, taskData) {
  const { data } = await axiosInstance.post(`/instructor/internships/${programId}/tasks`, taskData);
  return data;
}

export async function getInternshipTasksService(programId) {
  const { data } = await axiosInstance.get(`/instructor/internships/${programId}/tasks`);
  return data;
}

export async function updateInternshipTaskService(taskId, taskData) {
  const { data } = await axiosInstance.put(`/instructor/internships/tasks/${taskId}`, taskData);
  return data;
}

export async function deleteInternshipTaskService(taskId) {
  const { data } = await axiosInstance.delete(`/instructor/internships/tasks/${taskId}`);
  return data;
}
