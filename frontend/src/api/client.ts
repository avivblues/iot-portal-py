export const AUTH_TOKEN_KEY = "iot_portal_token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const saveToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const clearToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Request failed");
  }

  return response.json() as Promise<T>;
}

export function providerUrl(provider: "google" | "facebook") {
  return `${API_BASE_URL}/auth/${provider}`;
}
