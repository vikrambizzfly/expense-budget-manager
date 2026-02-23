# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run dev          # Start dev server (usually localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
# Seed database with demo users and categories
npx prisma db seed

# Add more sample expenses for testing
npx tsx prisma/seed-expenses.ts

# View database in Prisma Studio
npx prisma studio

# Create migration after schema changes
npx prisma migrate dev --name description_of_change

# Generate Prisma Client after schema changes
npx prisma generate
```

### Demo Accounts
- **Admin**: admin@example.com / admin123
- **Accountant**: accountant@example.com / accountant123
- **User**: user@example.com / user123

## Critical Architecture Patterns

### 1. Prisma with LibSQL Adapter (REQUIRED)

**⚠️ IMPORTANT**: This project uses Prisma 7 with the LibSQL adapter for SQLite. When creating new Prisma client instances (seeds, migrations, utilities), you MUST use:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({ adapter });
```

**❌ This will fail:**
```typescript
const prisma = new PrismaClient(); // Missing adapter!
```

See `src/lib/db/prisma.ts` for the canonical implementation.

### 2. API Routes Architecture

All API routes follow Next.js 13+ App Router conventions in `app/api/`:

```
app/api/
├── auth/
│   ├── login/route.ts       # POST - JWT authentication
│   ├── register/route.ts    # POST - User registration
│   └── verify/route.ts      # GET - Verify JWT token
├── expenses/
│   ├── route.ts             # GET (paginated), POST
│   ├── [id]/route.ts        # PUT, DELETE
│   └── stats/route.ts       # GET - Total count & amount
├── budgets/route.ts         # GET, POST
├── categories/route.ts      # GET, POST (admin only)
├── users/route.ts           # GET, POST, PUT, DELETE (admin only)
└── audit/route.ts          # GET (admin/accountant only)
```

**Authentication Pattern**: All protected routes follow this structure:

```typescript
export async function GET(request: NextRequest) {
  // 1. Extract and verify JWT token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const payload = verifyToken(token);

  // 2. Apply role-based filtering
  if (payload.role === UserRole.user) {
    where.userId = payload.userId; // Users see only their data
  }
  // Admins/accountants see all

  // 3. Execute query and return
}
```

### 3. React Query Integration (Phase 1 Feature)

The `/expenses` page uses React Query for caching and infinite scroll:

- **Hook**: `useExpensesV2` (new) vs `useExpenses` (old, used by dashboards)
- **Invalidation**: After mutations, invalidate with `queryClient.invalidateQueries({ queryKey: ['expenses'] })`
- **Provider**: QueryProvider wraps the app in `app/layout.tsx`

**Old vs New Hooks**:
- `useExpenses`: Returns `Expense[]`, used by Dashboard V1/V2/V3
- `useExpensesV2`: Returns paginated data with infinite scroll, used by `/expenses` page

### 4. Dashboard Versions

Three dashboard implementations available in `app/(dashboard)/`:

```typescript
// app/(dashboard)/dashboard-v1-gradient.tsx - Modern glassmorphism
// app/(dashboard)/dashboard-v2-minimal.tsx  - Clean, Apple-like
// app/(dashboard)/dashboard-v3-analytics.tsx - Data-rich (default)
```

Switch by updating `app/page.tsx`:
```typescript
if (isAuthenticated) {
  return <DashboardV3Analytics />; // Change this import
}
```

### 5. Authentication Flow

**JWT-based authentication** (server-side only, no client-side crypto):

1. Login: `POST /api/auth/login` → returns JWT token + user data
2. Client stores token in localStorage (via AuthContext)
3. All API requests include `Authorization: Bearer ${token}` header
4. Server verifies with `verifyToken()` from `src/lib/auth/jwt.ts`

**Role-based Access**:
- `admin`: Full access to everything
- `accountant`: Read all expenses/budgets, view audit logs
- `user`: CRUD own expenses/budgets only

## Critical Implementation Details

### Currency Handling
All amounts stored in **cents** (integers) to avoid floating-point errors:

```typescript
// ✅ Correct
const amountInCents = Math.round(dollarAmount * 100);

// ❌ Wrong
const amountInDollars = 10.50; // Store as 1050 instead
```

Use utilities:
- `dollarsToCents(10.50)` → 1050
- `centsToDollars(1050)` → 10.50
- `formatCurrency(1050)` → "$10.50"

### Search with SQLite Limitation

SQLite doesn't support case-insensitive `contains` in Prisma:

```typescript
// ✅ Works with SQLite
where.OR = [
  { description: { contains: search } }, // Case-sensitive
];

// ❌ Fails with SQLite (PostgreSQL-only)
where.OR = [
  { description: { contains: search, mode: 'insensitive' } },
];
```

Plan: Migrate to PostgreSQL for case-insensitive search.

### Pagination Response Format

The expenses API returns paginated data:

```typescript
// Response format
{
  expenses: Expense[],      // Current page items
  nextCursor: string | null, // Cursor for next page
  hasMore: boolean          // Whether more pages exist
}
```

Old endpoints may return `Expense[]` directly. Handle both:

```typescript
const expenses = Array.isArray(data) ? data : (data.expenses || []);
```

### Route Groups & Layouts

```
app/
├── (auth)/           # Route group - doesn't affect URL
│   ├── layout.tsx   # Centered auth layout
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/      # Route group - doesn't affect URL
│   ├── layout.tsx   # Sidebar + protected route wrapper
│   ├── expenses/page.tsx
│   └── budgets/page.tsx
├── page.tsx         # Root "/" - conditionally renders dashboard or landing
└── landing-page.tsx # Separated landing page component
```

**Important**: Route groups `(auth)` and `(dashboard)` don't add to URLs. Both `/login` and `/expenses` render at their respective paths without prefixes.

## Common Development Workflows

### Adding a New Feature to Expenses Page

1. **Update API** if needed (`app/api/expenses/route.ts`)
2. **Update hook** (`src/hooks/useExpensesV2.ts`)
3. **Invalidate cache** after mutations:
   ```typescript
   queryClient.invalidateQueries({ queryKey: ['expenses'] });
   ```
4. **Test** with search, filters, and infinite scroll

### Adding a New API Endpoint

1. Create route file: `app/api/your-feature/route.ts`
2. Implement HTTP method exports: `GET`, `POST`, `PUT`, `DELETE`
3. Add JWT verification (copy pattern from existing routes)
4. Apply role-based access control
5. Return JSON with `NextResponse.json()`

### Database Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change`
3. Run `npx prisma generate` to update client
4. Update TypeScript types if needed
5. Update seed scripts if adding required fields

### Working with Feature Branches

The project uses Git Flow with feature branches:

```bash
# Current development branch
git checkout feature/expense-management-v2

# Create new feature branch
git checkout -b feature/your-feature-name

# Merge to master when ready
git checkout master
git merge feature/your-feature-name
```

## Key Files to Understand

### Core Configuration
- `prisma/schema.prisma` - Database schema (User, Expense, Budget, Category, AuditLog)
- `src/lib/db/prisma.ts` - Prisma client with LibSQL adapter
- `src/lib/auth/jwt.ts` - JWT token generation/verification
- `app/layout.tsx` - Root layout with QueryProvider, AuthProvider, ToastProvider

### Type Definitions
- `src/types/models.ts` - Core data models
- `src/types/forms.ts` - Form-specific types and constants

### Authentication
- `src/contexts/AuthContext.tsx` - Auth state and login/logout logic
- `app/api/auth/*` - Auth endpoints (login, register, verify)
- `src/components/auth/ProtectedRoute.tsx` - Route guard component

### State Management
- React Query for server state (expenses list, stats)
- React Context for auth state and toasts
- Local component state for forms and UI

## Testing Considerations

### Manual Testing Checklist
1. **Auth flow**: Login → redirects to dashboard → logout → redirects to landing
2. **Expenses**: Add → appears immediately (cache invalidation works)
3. **Search**: Type → debounced 150ms → results filter
4. **Infinite scroll**: Scroll down → loads more (50 at a time)
5. **Filters**: Apply category/date/payment filters → results update
6. **Grand total**: Should NOT change as you scroll (fetched from stats API)
7. **Role-based access**: Try accountant/user accounts → verify permissions

### Database Testing
```bash
# Check record counts
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Expense;"

# Check users
sqlite3 prisma/dev.db "SELECT email, role FROM User;"

# Reset database
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

## Production Migration Path

### Database Migration (SQLite → PostgreSQL)

1. Set up PostgreSQL (recommended: Neon.tech for free tier)
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from sqlite
     url      = env("DATABASE_URL")
   }
   ```
3. Remove LibSQL adapter from `src/lib/db/prisma.ts`:
   ```typescript
   // New PostgreSQL version (no adapter needed)
   const prisma = new PrismaClient({
     log: process.env.NODE_ENV === 'development' ? ['query'] : [],
   });
   ```
4. Enable case-insensitive search:
   ```typescript
   where.OR = [
     { description: { contains: search, mode: 'insensitive' } }, // Now works!
   ];
   ```
5. Run migrations: `npx prisma migrate dev`
6. Seed data: `npx prisma db seed`

## Known Issues & Gotchas

1. **Total changes on scroll**: Fixed with `/api/expenses/stats` endpoint
2. **New expense doesn't appear**: Fixed with React Query cache invalidation
3. **Search case-sensitive**: SQLite limitation, will be fixed with PostgreSQL migration
4. **Input text too light**: Fixed with `text-gray-900` class on all inputs
5. **Dashboard shows landing page**: Fixed by conditional rendering in `app/page.tsx`

## Performance Optimizations Applied

- **Cursor-based pagination**: Loads 50 expenses at a time vs all at once
- **React Query caching**: 1-minute stale time, reduces API calls
- **Debounced search**: 150ms delay prevents excessive API requests
- **Infinite scroll**: Intersection Observer for smooth loading
- **Stats endpoint**: Separate API call for grand total (doesn't recalculate on scroll)

## File Naming Conventions

- **Components**: PascalCase (e.g., `ExpenseForm.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useExpenses.ts`)
- **API routes**: lowercase `route.ts` in folder structure
- **Types**: PascalCase for interfaces/types (e.g., `Expense`, `UserRole`)
