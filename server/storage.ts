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

export const storage = new DatabaseStorage();
