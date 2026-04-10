import API from "./api";

// CREATE
export const createProduction = (data) => API.post("/production", data);

// GET ALL
export const getProductions = () => API.get("/production");

// UPDATE
export const updateProduction = (id, data) =>
  API.put(`/production/${id}`, data);

// DELETE
export const deleteProduction = (id) => API.delete(`/production/${id}`);
