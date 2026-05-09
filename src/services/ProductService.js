import API from "./api";

export const getProducts = (params) => {
  return API.get("/products", { params });
};

export const getProductById = (id) => {
  return API.get(`/products/${id}`);
};

export const createProduct = (data) => {
  return API.post("/products", data);
};

export const updateProduct = (id, data) => {
  return API.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return API.delete(`/products/${id}`);
};
