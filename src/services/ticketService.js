import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:10000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  },
);


export const submitTicket = (data) =>
  API.post("/tickets", data).then((r) => r.data);

export const replyToTicket = (id, data) =>
  API.post(`/tickets/${id}/reply`, data).then((r) => r.data);

export const markTicketSeen = (id) =>
  API.post(`/tickets/${id}/seen`).then((r) => r.data);


export const fetchTickets = (params = {}) =>
  API.get("/tickets", { params }).then((r) => r.data);

export const fetchTicketStats = () =>
  API.get("/tickets/stats").then((r) => r.data);

export const fetchTicket = (id) =>
  API.get(`/tickets/${id}`).then((r) => r.data);

export const updateStatus = (id, status) =>
  API.patch(`/tickets/${id}/status`, { status }).then((r) => r.data);

export const updatePriority = (id, priority) =>
  API.patch(`/tickets/${id}/priority`, { priority }).then((r) => r.data);

export const resolveTicket = (id) =>
  API.post(`/tickets/${id}/resolve`).then((r) => r.data);

export const deleteTicket = (id) =>
  API.delete(`/tickets/${id}`).then((r) => r.data);