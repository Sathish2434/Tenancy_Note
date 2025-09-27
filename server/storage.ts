import { tenants, users, notes, type Tenant, type User, type Note, type InsertTenant, type InsertUser, type InsertNote } from "@shared/schema";
import { db } from "./db";
import { eq, and, count } from "drizzle-orm";

export interface IStorage {
  // Tenant operations
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  upgradeTenant(id: string): Promise<Tenant>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Note operations
  getNotes(tenantId: string): Promise<Note[]>;
  getNote(id: string, tenantId: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, tenantId: string, updates: Partial<Note>): Promise<Note>;
  deleteNote(id: string, tenantId: string): Promise<boolean>;
  getNoteCount(tenantId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // Tenant operations
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant || undefined;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db
      .insert(tenants)
      .values(tenant)
      .returning();
    return newTenant;
  }

  async upgradeTenant(id: string): Promise<Tenant> {
    const [updatedTenant] = await db
      .update(tenants)
      .set({ plan: "pro" })
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  // Note operations
  async getNotes(tenantId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.tenantId, tenantId))
      .orderBy(notes.updatedAt);
  }

  async getNote(id: string, tenantId: string): Promise<Note | undefined> {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.tenantId, tenantId)));
    return note || undefined;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db
      .insert(notes)
      .values(note)
      .returning();
    return newNote;
  }

  async updateNote(id: string, tenantId: string, updates: Partial<Note>): Promise<Note> {
    const [updatedNote] = await db
      .update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.tenantId, tenantId)))
      .returning();
    return updatedNote;
  }

  async deleteNote(id: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.tenantId, tenantId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getNoteCount(tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notes)
      .where(eq(notes.tenantId, tenantId));
    return result.count;
  }
}

// Mock storage for development when database is not available
class MockStorage implements IStorage {
  private tenants: Tenant[] = [];
  private users: User[] = [];
  private notes: Note[] = [];

  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.find(t => t.id === id);
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    return this.tenants.find(t => t.slug === slug);
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const newTenant: Tenant = {
      id: Math.random().toString(36).substr(2, 9),
      ...tenant,
      createdAt: new Date(),
    };
    this.tenants.push(newTenant);
    return newTenant;
  }

  async upgradeTenant(id: string): Promise<Tenant> {
    const tenant = this.tenants.find(t => t.id === id);
    if (tenant) {
      tenant.plan = "pro";
    }
    return tenant!;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...user,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async getNotes(tenantId: string): Promise<Note[]> {
    return this.notes.filter(n => n.tenantId === tenantId);
  }

  async getNote(id: string, tenantId: string): Promise<Note | undefined> {
    return this.notes.find(n => n.id === id && n.tenantId === tenantId);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      ...note,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.push(newNote);
    return newNote;
  }

  async updateNote(id: string, tenantId: string, updates: Partial<Note>): Promise<Note> {
    const note = this.notes.find(n => n.id === id && n.tenantId === tenantId);
    if (note) {
      Object.assign(note, updates, { updatedAt: new Date() });
    }
    return note!;
  }

  async deleteNote(id: string, tenantId: string): Promise<boolean> {
    const index = this.notes.findIndex(n => n.id === id && n.tenantId === tenantId);
    if (index !== -1) {
      this.notes.splice(index, 1);
      return true;
    }
    return false;
  }

  async getNoteCount(tenantId: string): Promise<number> {
    return this.notes.filter(n => n.tenantId === tenantId).length;
  }
}

// Use mock storage if DATABASE_URL is not properly configured
export const storage = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql://') 
  ? new DatabaseStorage() 
  : new MockStorage();
