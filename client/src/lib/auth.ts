import { AuthResponse, User, Tenant } from "@/types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const TENANT_KEY = "auth_tenant";

export function setAuth(authData: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, authData.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
  localStorage.setItem(TENANT_KEY, JSON.stringify(authData.tenant));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

export function getTenant(): Tenant | null {
  const tenantData = localStorage.getItem(TENANT_KEY);
  return tenantData ? JSON.parse(tenantData) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TENANT_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token && token.trim() ? { Authorization: `Bearer ${token}` } : {};
}
