import API from "./api";

export const getOrders = (params) => {
  return API.get("/orders", { params });
};

export const createOrder = (data) => {
  return API.post("/orders", data);
};

export const deleteOrder = (id) => {
  return API.delete(`/orders/${id}`);
};

export const updateOrderStatus = (id, status) => {
  return API.patch(`/orders/${id}/status`, { status });
};
