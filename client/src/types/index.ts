export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  tenant: Tenant;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}
