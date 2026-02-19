const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiFetch = (path: string, options: RequestInit = {}) => {
  return fetch(`${API_BASE}${path}`, options);
};
