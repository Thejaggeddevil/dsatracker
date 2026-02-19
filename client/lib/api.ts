const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://dsatracker-dub8.onrender.com";

export const apiFetch = (path: string, options: RequestInit = {}) => {
  return fetch(`${API_BASE}${path}`, options);
};
