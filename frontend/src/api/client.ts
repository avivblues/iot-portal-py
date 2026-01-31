type ApiResponse = Response & { requestUrl?: string };

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");
const ensureLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

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

export async function apiFetch(path: string, init?: RequestInit): Promise<ApiResponse> {
  const url = buildApiUrl(path);
  const response = (await fetch(url, init)) as ApiResponse;
  response.requestUrl = url;
  return response;
}

export async function apiGet<T>(path: string): Promise<{ data: T; requestUrl: string }> {
  const response = await apiFetch(path, { method: "GET" });
  const payload = await response.json();
  return { data: payload as T, requestUrl: response.requestUrl ?? buildApiUrl(path) };
}
