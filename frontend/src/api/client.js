const trimTrailingSlash = (url) => url.replace(/\/+$/, "");
const ensureLeadingSlash = (path) => (path.startsWith("/") ? path : `/${path}`);
export function getApiBaseUrl() {
    const raw = import.meta.env.VITE_API_BASE_URL?.trim();
    if (!raw) {
        throw new Error("VITE_API_BASE_URL missing. Set it in the environment before running the frontend.");
    }
    return trimTrailingSlash(raw);
}
export function buildApiUrl(path) {
    return `${getApiBaseUrl()}${ensureLeadingSlash(path)}`;
}
export async function apiFetch(path, init) {
    const url = buildApiUrl(path);
    const response = (await fetch(url, init));
    response.requestUrl = url;
    return response;
}
export const AUTH_TOKEN_KEY = "iot_portal_token";
export function saveAuthToken(token) {
    try {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    catch {
        /* ignore */
    }
}
export function getAuthToken() {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    catch {
        return null;
    }
}
export function clearAuthToken() {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    catch {
        /* ignore */
    }
}
async function readApiError(res) {
    const requestUrl = res.requestUrl ?? "";
    let bodyText = "";
    try {
        const json = await res.json();
        if (json && (json.detail || json.message || json.error)) {
            bodyText = json.detail || json.message || json.error;
        }
        else {
            bodyText = JSON.stringify(json);
        }
    }
    catch {
        try {
            bodyText = await res.text();
        }
        catch {
            bodyText = "(no body)";
        }
    }
    const err = new Error(`${res.status} ${res.statusText} - ${bodyText}`);
    // attach some helpful fields
    err.status = res.status;
    err.requestUrl = requestUrl;
    err.body = bodyText;
    throw err;
}
export async function apiGet(path) {
    const token = getAuthToken();
    const headers = {};
    if (token)
        headers["Authorization"] = `Bearer ${token}`;
    const response = await apiFetch(path, { method: "GET", headers });
    if (!response.ok)
        await readApiError(response);
    const payload = await response.json();
    return { data: payload, requestUrl: response.requestUrl ?? buildApiUrl(path) };
}
export async function apiPost(path, body) {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token)
        headers["Authorization"] = `Bearer ${token}`;
    const response = await apiFetch(path, { method: "POST", headers, body: body ? JSON.stringify(body) : undefined });
    if (!response.ok)
        await readApiError(response);
    const payload = await response.json();
    return { data: payload, requestUrl: response.requestUrl ?? buildApiUrl(path) };
}
