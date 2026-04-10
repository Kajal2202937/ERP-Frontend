import API from "./api";

export const createSupplier = (data) => API.post("/suppliers", data);

export const getSuppliers = (params) =>
  API.get("/suppliers", { params });

export const updateSupplier = (id, data) =>
  API.put(`/suppliers/${id}`, data);

export const deleteSupplier = (id) =>
  API.delete(`/suppliers/${id}`);

export const bulkDeleteSuppliers = (ids) =>
  API.post("/suppliers/bulk-delete", { ids });

export const toggleSupplierStatus = (id) =>
  API.patch(`/suppliers/${id}/toggle-status`);