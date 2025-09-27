import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { storage } from "./storage";
import { loginSchema, createNoteSchema, updateNoteSchema } from "@shared/schema";
import { authenticateToken, generateToken, hashPassword, comparePassword, requireRole, type AuthenticatedRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for all routes
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const tenant = await storage.getTenant(user.tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
        },
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.user.id);
    const tenant = await storage.getTenant(req.user.tenantId);

    if (!user || !tenant) {
      return res.status(404).json({ message: "User or tenant not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
      },
    });
  });

  // Notes CRUD routes
  app.get("/api/notes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const notes = await storage.getNotes(req.user.tenantId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const note = await storage.getNote(req.params.id, req.user.tenantId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const noteData = createNoteSchema.parse(req.body);
      
      // Check subscription limits for free plan
      const tenant = await storage.getTenant(req.user.tenantId);
      if (tenant?.plan === "free") {
        const noteCount = await storage.getNoteCount(req.user.tenantId);
        if (noteCount >= 3) {
          return res.status(403).json({ 
            message: "Note limit reached. Upgrade to Pro for unlimited notes.",
            code: "LIMIT_REACHED"
          });
        }
      }

      const note = await storage.createNote({
        ...noteData,
        userId: req.user.id,
        tenantId: req.user.tenantId,
      });

      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/notes/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const noteData = updateNoteSchema.parse(req.body);
      
      const existingNote = await storage.getNote(req.params.id, req.user.tenantId);
      if (!existingNote) {
        return res.status(404).json({ message: "Note not found" });
      }

      const updatedNote = await storage.updateNote(req.params.id, req.user.tenantId, noteData);
      res.json(updatedNote);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/notes/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const deleted = await storage.deleteNote(req.params.id, req.user.tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Admin routes
  app.post("/api/tenants/:slug/upgrade", authenticateToken, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      if (tenant.id !== req.user.tenantId) {
        return res.status(403).json({ message: "Cannot upgrade other tenants" });
      }

      const upgradedTenant = await storage.upgradeTenant(tenant.id);
      res.json(upgradedTenant);
    } catch (error) {
      res.status(500).json({ message: "Failed to upgrade tenant" });
    }
  });

  // Initialize test data
  await initializeTestData();

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeTestData() {
  try {
    // Create tenants
    const acmeTenant = await storage.getTenantBySlug("acme") || 
      await storage.createTenant({ name: "Acme Corporation", slug: "acme", plan: "pro" });
    
    const globexTenant = await storage.getTenantBySlug("globex") || 
      await storage.createTenant({ name: "Globex Corporation", slug: "globex", plan: "free" });

    // Create test users
    const testUsers = [
      { email: "admin@acme.test", password: "password", role: "admin", tenantId: acmeTenant.id },
      { email: "user@acme.test", password: "password", role: "member", tenantId: acmeTenant.id },
      { email: "admin@globex.test", password: "password", role: "admin", tenantId: globexTenant.id },
      { email: "user@globex.test", password: "password", role: "member", tenantId: globexTenant.id },
    ];

    for (const userData of testUsers) {
      const existingUser = await storage.getUserByEmail(userData.email);
      if (!existingUser) {
        const hashedPassword = await hashPassword(userData.password);
        await storage.createUser({
          ...userData,
          password: hashedPassword,
        });
      }
    }
  } catch (error) {
    console.error("Failed to initialize test data:", error);
  }
}
