import API from "./api";

// =========================
// CREATE
// =========================
export const createSupplier = (data) => API.post("/suppliers", data);

// =========================
// GET ALL (WITH KPI)
// =========================
export const getSuppliers = (params) => API.get("/suppliers", { params });

// =========================
// 🔥 NEW: ANALYTICS (CHART DATA)
// =========================
export const getSupplierAnalytics = () => API.get("/suppliers/analytics");

// =========================
// UPDATE
// =========================
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data);

// =========================
// DELETE
// =========================
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// =========================
// BULK DELETE
// =========================
export const bulkDeleteSuppliers = (ids) =>
  API.post("/suppliers/bulk-delete", { ids });

// =========================
// TOGGLE STATUS
// =========================
export const toggleSupplierStatus = (id) =>
  API.patch(`/suppliers/${id}/toggle-status`);

// =========================
// 🔥 OPTIONAL: TOP SUPPLIERS
// =========================
export const getTopSuppliers = () => API.get("/suppliers/analytics?type=top");

// =========================
// 🔥 OPTIONAL: LOW STOCK SUPPLIERS
// =========================
export const getRiskSuppliers = () => API.get("/suppliers/analytics?type=risk");
