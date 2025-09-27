# Overview

NotesApp is a comprehensive multi-tenant SaaS application for notes management built with Express.js backend and React frontend. The application implements strict data isolation using a shared schema with tenant ID approach, providing secure note management for multiple organizations with subscription-based feature limits.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Multi-Tenancy Design
The application uses a **shared schema with tenant ID column** approach for multi-tenancy. All data tables include a `tenantId` column to ensure complete separation between tenants while maintaining cost-effective shared infrastructure. This design provides strict data isolation at the application layer with efficient indexing and query optimization.

## Frontend Architecture
- **React with TypeScript** - Modern component-based UI framework
- **Vite** - Fast build tool and development server
- **TanStack Query** - Server state management and data fetching
- **Wouter** - Lightweight client-side routing
- **Shadcn/ui + Tailwind CSS** - Component library with utility-first styling
- **React Hook Form** - Form state management and validation

## Backend Architecture
- **Express.js** - Web application framework
- **Drizzle ORM** - Type-safe database ORM with PostgreSQL dialect
- **JWT Authentication** - Stateless token-based authentication
- **Role-based Access Control** - Admin and Member roles with different permissions
- **Middleware-based Security** - Request authentication and tenant isolation

## Database Design
- **PostgreSQL** - Primary database with Neon serverless hosting
- **Tenant Isolation** - All tables include `tenantId` foreign keys
- **Core Entities**: Tenants, Users, Notes with proper relational constraints
- **Migration Management** - Drizzle Kit for schema versioning

## Authentication & Authorization
- **JWT Tokens** - 24-hour expiration with Bearer token format
- **bcrypt Password Hashing** - Secure password storage
- **Role-based Permissions** - Admin users can upgrade tenants and invite users
- **Tenant Scoping** - All data operations automatically scoped to user's tenant

## Subscription Management
- **Free Plan** - Limited to 3 notes per tenant
- **Pro Plan** - Unlimited notes
- **Real-time Enforcement** - Note creation blocked when limits reached
- **Admin Upgrades** - Only admin users can upgrade tenant plans

## API Structure
RESTful API with consistent patterns:
- Authentication endpoints (`/api/auth/*`)
- Resource endpoints (`/api/notes/*`) with full CRUD operations
- Tenant-scoped data access with middleware validation
- Standardized error handling and response formats

# External Dependencies

## Database & ORM
- **@neondatabase/serverless** - Serverless PostgreSQL hosting
- **drizzle-orm** - Type-safe ORM with schema management
- **drizzle-kit** - Database migration and schema tools

## Authentication & Security
- **jsonwebtoken** - JWT token generation and validation
- **bcrypt** - Password hashing and verification
- **cors** - Cross-origin resource sharing configuration

## Frontend Libraries
- **@tanstack/react-query** - Server state management
- **@radix-ui** - Headless UI component primitives
- **react-hook-form** - Form handling and validation
- **zod** - Schema validation for forms and API
- **tailwindcss** - Utility-first CSS framework
- **lucide-react** - Icon library

## Development Tools
- **TypeScript** - Type safety across frontend and backend
- **Vite** - Build tool with hot module replacement
- **ESBuild** - Fast JavaScript bundler for production
- **PostCSS** - CSS processing and optimization

## Runtime & Hosting
- **Node.js** - Server runtime environment
- **Express** - Web server framework
- **WebSocket (ws)** - Real-time database connections