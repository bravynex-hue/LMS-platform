import axiosInstance from "@/api/axiosInstance";

export async function contactAdminService(formData) {
  const { data } = await axiosInstance.post(`/notify/contact-admin`, formData);
  return data;
}

export async function submitFeedbackService(feedbackData) {
  const { data } = await axiosInstance.post("/feedback", feedbackData);
  return data;
}

export async function getMyFeedbackTicketsService() {
  const { data } = await axiosInstance.get("/feedback");
  return data;
}

export async function getFeedbackTicketByIdService(ticketId) {
  const { data } = await axiosInstance.get(`/feedback/${ticketId}`);
  return data;
}
