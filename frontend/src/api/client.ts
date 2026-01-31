export const AUTH_TOKEN_KEY = "iot_portal_token";

const LOCALHOST_FALLBACK = "http://localhost:4000";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

type ApiResponse = Response & { requestUrl?: string };

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");
const ensureLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

function isLocalhostOrigin(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return LOCAL_HOSTNAMES.has(window.location.hostname);
}

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (raw) {
    return trimTrailingSlash(raw);
  }

  if (isLocalhostOrigin()) {
    console.warn(
      `[api] VITE_API_BASE_URL missing; falling back to ${LOCALHOST_FALLBACK} because the browser origin is localhost.`,
    );
    return LOCALHOST_FALLBACK;
  }

  throw new Error("VITE_API_BASE_URL missing on non-localhost origin");
}

export function buildApiUrl(path: string): string {
  const base = trimTrailingSlash(getApiBaseUrl());
  return `${base}${ensureLeadingSlash(path)}`;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<ApiResponse> {
  const url = buildApiUrl(path);
  try {
    const response = (await fetch(url, init)) as ApiResponse;
    response.requestUrl = url;
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Network error calling ${url}: ${message}`);
  }
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await apiFetch(path, { method: "GET", headers });
  const requestUrl = response.requestUrl ?? buildApiUrl(path);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Request to ${requestUrl} failed (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export const saveToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const clearToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);

export function providerUrl(provider: "google" | "facebook") {
  return buildApiUrl(`/auth/${provider}`);
}
