import API from "./api";

// GET ORDERS (pagination + search + filter)
export const getOrders = (params) => {
  return API.get("/orders", { params });
};

// CREATE ORDER
export const createOrder = (data) => {
  return API.post("/orders", data);
};

// DELETE ORDER
export const deleteOrder = (id) => {
  return API.delete(`/orders/${id}`);
};

// ✅ FIX THIS PART (IMPORTANT)
export const updateOrderStatus = (id, status) => {
  return API.patch(`/orders/${id}/status`, { status });
};
