import API from "./api";

const BASE = "/reports";
const TIMEOUT = 10000;

const safeRequest = async (fn) => {
  try {
    const res = await fn();

    return {
      success: true,
      data: res?.data?.data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const getSalesSummary = (params = {}) =>
  safeRequest(() => API.get(`${BASE}/sales`, { params, timeout: TIMEOUT }));

export const getSalesTrend = (params = {}) =>
  safeRequest(() =>
    API.get(`${BASE}/sales-trend`, { params, timeout: TIMEOUT }),
  );

export const getTopProducts = () =>
  safeRequest(() => API.get(`${BASE}/top-products`, { timeout: TIMEOUT }));

export const getInsights = async () => {
  const res = await safeRequest(() => API.get("/insights"));

  if (!res.success || typeof res.data !== "string") {
    return {
      success: true,
      data: "System analysis: sales performance is being tracked normally.",
    };
  }

  return res;
};
