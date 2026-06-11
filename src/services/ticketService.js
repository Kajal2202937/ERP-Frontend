import API from "./api";

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
