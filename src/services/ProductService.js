import API from "./api";

//  GET ALL PRODUCTS
export const getProducts = (params) => {
  return API.get("/products", { params });
};

//  GET SINGLE PRODUCT (optional)
export const getProductById = (id) => {
  return API.get(`/products/${id}`);
};

//  CREATE PRODUCT
export const createProduct = (data) => {
  return API.post("/products", data);
};

//  UPDATE PRODUCT
export const updateProduct = (id, data) => {
  return API.put(`/products/${id}`, data);
};

//  DELETE PRODUCT
export const deleteProduct = (id) => {
  return API.delete(`/products/${id}`);
};

