import axios from "axios";

const envUrl = import.meta.env.VITE_API_URL;
const API_URL = (envUrl && !envUrl.includes("localhost")) ? envUrl : "https://api-novedades.manevoapp.com";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
  },
});

/** Sanctum SPA auth needs the CSRF cookie set before the first mutating request. */
export async function ensureCsrfCookie() {
  await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });
}

export class ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const message = payload?.message ?? "Ocurrió un error inesperado. Intenta de nuevo.";

    return Promise.reject(new ApiError(message, error.response?.status, payload?.errors));
  }
);
