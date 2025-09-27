import { apiRequest } from "./queryClient";
import { getAuthHeaders, clearAuth } from "./auth";
import { AuthResponse, Note, CreateNoteData, UpdateNoteData, Tenant } from "@/types";

class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      window.location.href = "/";
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || response.statusText, errorData.code);
  }
  
  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async getMe(): Promise<{ user: any; tenant: Tenant }> {
    const response = await fetch("/api/auth/me", {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Notes
  async getNotes(): Promise<Note[]> {
    const response = await fetch("/api/notes", {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getNote(id: string): Promise<Note> {
    const response = await fetch(`/api/notes/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createNote(data: CreateNoteData): Promise<Note> {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const response = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteNote(id: string): Promise<void> {
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || response.statusText);
    }
  },

  // Admin
  async upgradeTenant(slug: string): Promise<Tenant> {
    const response = await fetch(`/api/tenants/${slug}/upgrade`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export { ApiError };
