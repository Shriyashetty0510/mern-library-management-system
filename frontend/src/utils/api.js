import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const booksAPI = {
  getAll: (params) => api.get("/books", { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post("/books", data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

export const membersAPI = {
  getAll: (params) => api.get("/members", { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post("/members", data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

export const transactionsAPI = {
  getAll: (params) => api.get("/transactions", { params }),
  issue: (data) => api.post("/transactions/issue", data),
  return: (id) => api.put(`/transactions/return/${id}`),
  stats: () => api.get("/transactions/stats/summary"),
};

export default api;
