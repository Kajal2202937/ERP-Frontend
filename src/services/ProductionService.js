import API from "./api";

export const createProduction = (data) => API.post("/production", data);

export const getProductions = () => API.get("/production");

export const updateProduction = (id, data) =>
  API.put(`/production/${id}`, data);

export const deleteProduction = (id) => API.delete(`/production/${id}`);
