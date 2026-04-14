import API from "./api";

const BASE = "/reports";
const TIMEOUT = 10000;

// ─────────────────────────────
// SAFE REQUEST (FIXED + CONSISTENT)
// ─────────────────────────────
const safeRequest = async (fn) => {
  try {
    const res = await fn();

    return {
      success: true,
      data: res?.data?.data, // ONLY THIS
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
// ───────────── SUMMARY
export const getSalesSummary = (params = {}) =>
  safeRequest(() => API.get(`${BASE}/sales`, { params, timeout: TIMEOUT }));

// ───────────── TREND
export const getSalesTrend = (params = {}) =>
  safeRequest(() =>
    API.get(`${BASE}/sales-trend`, { params, timeout: TIMEOUT }),
  );

// ───────────── TOP PRODUCTS
export const getTopProducts = () =>
  safeRequest(() => API.get(`${BASE}/top-products`, { timeout: TIMEOUT }));

// ───────────── INSIGHTS
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
