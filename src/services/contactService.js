import API from "./api";

const handleError = (err, defaultMsg) => {
  if (err.response) {
    throw new Error(err.response.data?.message || defaultMsg);
  } else if (err.request) {
    throw new Error("Server not responding");
  } else {
    throw new Error(defaultMsg);
  }
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


export const replyMessage = async (id, message, tempId) => {
  try {
    const { data } = await API.post(`/contact/${id}/reply`, {
      message,
      tempId, 
    });

    return data;
  } catch (err) {
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