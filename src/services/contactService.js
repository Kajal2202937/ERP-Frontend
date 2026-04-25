import API from "./api";
const handleError = (err, defaultMsg) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    defaultMsg;

  throw new Error(msg);
};
export const sendContactMessage = async (formData) => {
  try {
    const { data } = await API.post("/contact", formData);
    return data;
  } catch (err) {
    handleError(err, "Failed to send message");
  }
};

export const getAllMessages = async (params = {}) => {
  try {
    const { data } = await API.get("/contact", { params });
    return data;
  } catch (err) {
    handleError(err, "Failed to fetch messages");
  }
};

export const getMessageById = async (id) => {
  try {
    const { data } = await API.get(`/contact/${id}`);
    return data;
  } catch (err) {
    handleError(err, "Failed to fetch message");
  }
};

export const deleteMessage = async (id) => {
  try {
    const { data } = await API.delete(`/contact/${id}`);
    return data;
  } catch (err) {
    handleError(err, "Failed to delete message");
  }
};

export const updateMessageStatus = async (id, status) => {
  try {
    const { data } = await API.put(`/contact/${id}`, { status });
    return data;
  } catch (err) {
    handleError(err, "Failed to update status");
  }
};

export const replyMessage = async (id, message, tempId, retries = 2) => {
  try {
    const { data } = await API.post(`/contact/${id}/reply`, {
      message,
      tempId,
      sender: "admin",
    });

    return data;
  } catch (err) {
    if (retries > 0) {
      return replyMessage(id, message, tempId, retries - 1);
    }
    handleError(err, "Failed to send reply");
  }
};

export const getMessageThread = async (id) => {
  try {
    const { data } = await API.get(`/contact/${id}/thread`);
    return data;
  } catch (err) {
    handleError(err, "Failed to load conversation");
  }
};

export const deleteMultipleMessages = async (ids) => {
  try {
    const { data } = await API.post("/contact/bulk-delete", {
      ids,
    });

    return data;
  } catch (err) {
    handleError(err, "Bulk delete failed");
  }
};
