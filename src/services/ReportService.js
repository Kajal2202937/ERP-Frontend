import API from "./api";

const BASE = "/reports";

export const getSalesSummary = (params) => {
  return API.get(`${BASE}/sales`, { params });
};

export const getSalesTrend = (params) => {
  return API.get(`${BASE}/sales-trend`, { params });
};

export const getInsights = () => {
  return API.get(`${BASE}/insights`);
};

export const getTopProducts = () => {
  return API.get(`${BASE}/top-products`);
};
