import API from "./api";

/**
 * ================================
 * COMMON ERROR HANDLER
 * ================================
 */
const handleError = (err, defaultMsg) => {
  if (err.response) {
    throw new Error(err.response.data?.message || defaultMsg);
  } else if (err.request) {
    throw new Error("Server not responding");
  } else {
    throw new Error(defaultMsg);
  }
};

/**
 * ================================
 * CONTACT (PUBLIC)
 * ================================
 */

/**
 * Send contact message
 */
export const sendContactMessage = async (formData) => {
  try {
    const { data } = await API.post("/contact", formData);

    return data; // ✅ clean return
  } catch (err) {
    handleError(err, "Failed to send message");
  }
};

/**
 * ================================
 * ADMIN CONTACT APIs
 * ================================
 */

/**
 * Get all messages
 * (supports future pagination/search)
 */
export const getAllMessages = async (params = {}) => {
  try {
    const { data } = await API.get("/contact", { params });

    return data; // { success, data }
  } catch (err) {
    handleError(err, "Failed to fetch messages");
  }
};

/**
 * Get single message (optional)
 */
export const getMessageById = async (id) => {
  try {
    const { data } = await API.get(`/contact/${id}`);

    return data;
  } catch (err) {
    handleError(err, "Failed to fetch message");
  }
};

/**
 * Delete message
 */
export const deleteMessage = async (id) => {
  try {
    const { data } = await API.delete(`/contact/${id}`);

    return data;
  } catch (err) {
    handleError(err, "Failed to delete message");
  }
};

/**
 * Mark as read/unread
 */
export const updateMessageStatus = async (id, status) => {
  try {
    const { data } = await API.put(`/contact/${id}`, { status });

    return data;
  } catch (err) {
    handleError(err, "Failed to update status");
  }
};

/**
 * Bulk delete (ADVANCED - optional backend support)
 */
export const deleteMultipleMessages = async (ids) => {
  try {
    const { data } = await API.post("/contact/bulk-delete", { ids });

    return data;
  } catch (err) {
    handleError(err, "Bulk delete failed");
  }
};