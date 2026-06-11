import axios from "axios";

let _csrfToken = null;

export const setCsrfToken = (t) => {
  _csrfToken = t;
};

export const initCsrf = async () => {
  
  const res = await axios.get(`${import.meta.env.VITE_URL}/csrf-token`, {
    withCredentials: true,
  });
  _csrfToken = res.data.csrfToken;
  return _csrfToken;
};

const API = axios.create({
  baseURL: import.meta.env.VITE_URL, 
  withCredentials: true,
  timeout: 30000,
});

const CSRF_METHODS = new Set(["post", "put", "patch", "delete"]);

API.interceptors.request.use(
  (config) => {
    if (CSRF_METHODS.has(config.method?.toLowerCase()) && _csrfToken) {
      config.headers["x-csrf-token"] = _csrfToken;
    }

    config.headers["x-request-id"] = crypto.randomUUID();

    if (config.url?.startsWith("/ai")) {
      config.timeout = 60000;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("csrf") &&
      !error.config._csrfRetry
    ) {
      try {
        await initCsrf();

        const retryConfig = {
          ...error.config,
          _csrfRetry: true,
          headers: {
            ...error.config.headers,
            "x-csrf-token": _csrfToken,
          },
        };

        return API(retryConfig);
      } catch {}
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  },
);

export default API;