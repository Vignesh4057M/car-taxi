const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const request = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw data;
  }
  return data;
};

export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: "POST", body: JSON.stringify(body) }),
  del: (url) => request(url, { method: "DELETE" }),
  put: (url, body) => request(url, { method: "PUT", body: JSON.stringify(body) }),
};
