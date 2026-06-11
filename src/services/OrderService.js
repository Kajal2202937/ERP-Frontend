import API from "./api";

export const getOrders = (params) => API.get("/orders", { params });
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const createOrder = (data) => API.post("/orders", data);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);

export const updateOrderStatus = (id, status, note = "") =>
  API.patch(`/orders/${id}/status`, { status, note });

export const resendInvoice = (id) => API.post(`/orders/${id}/resend-invoice`);
