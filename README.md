# NotesApp - Multi-Tenant SaaS Notes Application

A comprehensive multi-tenant SaaS application for notes management with JWT authentication, role-based access control, and subscription management.

## Architecture Overview

### Multi-Tenancy Approach

This application uses a **shared schema with tenant ID column** approach for multi-tenancy. This design provides:

- **Strict Data Isolation**: All data tables include a `tenantId` column to ensure complete separation between tenants
- **Scalability**: Single database instance with efficient indexing and query optimization
- **Cost Effectiveness**: Shared infrastructure reduces operational overhead
- **Security**: Middleware-level tenant isolation prevents cross-tenant data access

### Key Features

1. **Multi-Tenant Architecture**
   - Shared schema with tenant ID columns for strict data isolation
   - Support for Acme and Globex tenants (easily extensible)
   - Tenant-scoped data access at the application layer

2. **Authentication & Authorization**
   - JWT-based authentication with secure token management
   - Role-based access control (Admin and Member roles)
   - Predefined test accounts for both tenants

3. **Subscription Management**
   - Free Plan: Limited to 3 notes per tenant
   - Pro Plan: Unlimited notes
   - Admin-only tenant upgrade functionality
   - Real-time limit enforcement

4. **Notes Management**
   - Complete CRUD operations with tenant isolation
   - Search functionality within tenant scope
   - Rich text content support
   - Word count and metadata tracking

5. **Security Features**
   - CORS enabled for external API access
   - JWT token expiration and refresh
   - Input validation and sanitization
   - Role-based endpoint protection

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with email/password
- `GET /api/auth/me` - Get current user and tenant information

### Notes CRUD
- `GET /api/notes` - List all notes for current tenant
- `GET /api/notes/:id` - Get specific note (tenant-scoped)
- `POST /api/notes` - Create new note (respects subscription limits)
- `PUT /api/notes/:id` - Update note (tenant-scoped)
- `DELETE /api/notes/:id` - Delete note (tenant-scoped)

### Admin Operations
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro plan (Admin only)

### Health Check
- `GET /health` - Service health status

## Test Accounts

The application comes with predefined test accounts (password: `password`):

- `admin@acme.test` - Admin user for Acme Corporation (Pro plan)
- `user@acme.test` - Member user for Acme Corporation
- `admin@globex.test` - Admin user for Globex Corporation (Free plan)
- `user@globex.test` - Member user for Globex Corporation

## Database Schema

### Tenants Table
- `id` - Primary key (UUID)
- `name` - Tenant display name
- `slug` - Unique tenant identifier
- `plan` - Subscription plan ('free' or 'pro')
- `createdAt` - Creation timestamp

### Users Table
- `id` - Primary key (UUID)
- `email` - Unique user email
- `password` - Hashed password
- `role` - User role ('admin' or 'member')
- `tenantId` - Foreign key to tenants table
- `createdAt` - Creation timestamp

### Notes Table
- `id` - Primary key (UUID)
- `title` - Note title
- `content` - Note content
- `userId` - Foreign key to users table
- `tenantId` - Foreign key to tenants table (for strict isolation)
- `createdAt` - Creation timestamp
- `updatedAt` - Last modification timestamp

## Technology Stack

### Backend
- **Express.js** with TypeScript for API server
- **PostgreSQL** with Drizzle ORM for data persistence
- **JWT** for stateless authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin request handling

### Frontend
- **React** with TypeScript for user interface
- **Tailwind CSS** for responsive styling
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **shadcn/ui** for consistent UI components

### Database
- **PostgreSQL** with shared schema approach
- **Drizzle ORM** for type-safe database operations
- **Indexes** on tenant_id columns for performance
- **Foreign key constraints** for data integrity

## Security Considerations

1. **Data Isolation**: Every database query includes tenant ID filtering
2. **Authentication**: JWT tokens with configurable expiration
3. **Authorization**: Role-based access control for admin operations
4. **Input Validation**: Zod schemas for request validation
5. **Password Security**: bcrypt hashing with salt rounds
6. **CORS Configuration**: Properly configured for production use

## Deployment

The application is designed for deployment on Vercel with:
- Automatic CORS configuration for external API access
- Environment variable management for database credentials
- Health check endpoint for monitoring
- Production-ready error handling and logging

## Getting Started

1. **Setup Database**: Ensure PostgreSQL is running and `DATABASE_URL` is configured
2. **Install Dependencies**: `npm install`
3. **Initialize Database**: `npm run db:push`
4. **Start Development**: `npm run dev`
5. **Access Application**: Navigate to `http://localhost:5000`

The application will automatically create test tenants and users on first startup.

## License

MIT License - see LICENSE file for details
