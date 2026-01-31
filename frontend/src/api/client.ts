const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");
const ensureLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const AUTH_TOKEN_KEY = "iot_portal_token";

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error("VITE_API_BASE_URL missing. Set it in the environment before running the frontend.");
  }
  return trimTrailingSlash(raw);
}

export function buildApiUrl(path: string): string {
  return `${getApiBaseUrl()}${ensureLeadingSlash(path)}`;
}

export function saveToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  headers?: HeadersInit;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildApiUrl(path);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {})
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET", token });
}

export function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body, token });
}
