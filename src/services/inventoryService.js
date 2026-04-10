import API from "./api";

export const getInventory = (params) => API.get("/inventory", { params });

export const addStock = (data) => API.post("/inventory/add", data);

export const updateStock = (data) => API.put("/inventory/update", data);

export const disableInventory = (productId) =>
  API.put("/inventory/disable", { productId });

export const enableInventory = (productId) =>
  API.put("/inventory/enable", { productId });

export const deleteInventory = (productIds) =>
  API.post("/inventory/delete", {
    productIds: Array.isArray(productIds) ? productIds : [productIds],
  });
