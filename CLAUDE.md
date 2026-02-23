# Project: Expense & Budget Manager

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Principles

1. **SOLID Design Patterns**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles
2. **Strict TypeScript**: No `any` types, proper interfaces, comprehensive type safety
3. **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
4. **Test-Driven Development**: Goal for future development (no tests currently implemented)
5. **Clean Code**: Self-documenting code with minimal comments, meaningful names

## Development Workflow

### Essential Commands
```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run lint             # Run ESLint
npx tsc --noEmit         # Type check without building

# Database Operations
npx prisma generate                        # Generate Prisma Client after schema changes
npx prisma migrate dev --name <description> # Create new migration
npx prisma db seed                         # Seed demo users and categories
npx tsx prisma/seed-expenses.ts            # Add 100 sample expenses for testing
npx prisma studio                          # Open Prisma Studio (database GUI)

# Database Inspection (SQLite)
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Expense;"
sqlite3 prisma/dev.db "SELECT email, role FROM User;"
```

### Demo Accounts (After Seeding)
- **Admin**: admin@example.com / admin123
- **Accountant**: accountant@example.com / accountant123
- **User**: user@example.com / user123

### Feature Branch Strategy
- Create feature branches for each improvement/module
- Test thoroughly before merging to master
- Use descriptive branch names: `feature/expense-pagination`, `fix/search-case-sensitivity`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite (development) with Prisma ORM 7.4.1
- **State Management**: React Query (@tanstack/react-query) for server state
- **Authentication**: JWT with role-based access control
- **Styling**: Tailwind CSS

### Critical Requirements

#### ⚠️ LibSQL Adapter (MANDATORY)

This project uses Prisma 7 with the LibSQL adapter for SQLite. **All** Prisma client instantiations MUST use this pattern:

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

**Files requiring adapter:**
- `src/lib/db/prisma.ts` (global instance - canonical implementation)
- Any seed scripts (`prisma/seed.ts`, `prisma/seed-expenses.ts`)
- Any standalone database scripts

### Directory Structure
```
app/
  (dashboard)/          # Protected dashboard routes (route group, no URL prefix)
    layout.tsx          # Sidebar + protected route wrapper
    expenses/page.tsx   # /expenses (uses React Query infinite scroll)
    budgets/page.tsx    # /budgets
  api/                  # API routes
    expenses/
      route.ts          # GET (paginated), POST
      [id]/route.ts     # GET, PUT, DELETE
      stats/route.ts    # GET - Total count & amount
    budgets/route.ts
    categories/route.ts
    users/route.ts
    audit/route.ts
  (auth)/              # Auth routes (route group, no URL prefix)
    layout.tsx         # Centered auth layout
    login/page.tsx     # /login
    register/page.tsx  # /register
  page.tsx             # Root "/" - conditionally renders dashboard or landing
  landing-page.tsx     # Separated landing page component
  layout.tsx           # Root layout with providers

src/
  components/
    ui/                # Base UI primitives (Button, Input, Select, Card)
    expenses/          # Expense-specific components
    budgets/           # Budget-specific components
    auth/              # Auth components (ProtectedRoute)
  contexts/
    AuthContext.tsx    # JWT auth state management
    ToastContext.tsx   # Toast notifications
    QueryProvider.tsx  # React Query provider wrapper
  hooks/
    useExpenses.ts     # OLD hook - returns Expense[], used by dashboards
    useExpensesV2.ts   # NEW hook - React Query infinite scroll, used by /expenses page
    useCategories.ts
    useBudgets.ts
  lib/
    db/
      prisma.ts        # Prisma client with LibSQL adapter
    auth/
      jwt.ts           # JWT token generation/verification
    services/          # Business logic services
    utils/
      currency.ts      # centsToDollars, dollarsToCents, formatCurrency
      date.ts          # formatDate, formatInputDate, getTodayInputDate
      formatting.ts    # toTitleCase, etc.
    validators/        # Zod schemas for validation
  types/
    models.ts          # Core data models (Expense, Budget, Category, User)
    forms.ts           # Form types and constants (PAYMENT_METHOD_OPTIONS)

prisma/
  schema.prisma        # Database schema
  migrations/          # Migration history
  seed.ts              # Seeds demo users and categories
  seed-expenses.ts     # Seeds 100 sample expenses
```

**Important**: Route groups `(auth)` and `(dashboard)` don't add URL segments. Both `/login` and `/expenses` render at their respective paths without prefixes.

## API Design

### Route Structure & Patterns

All API routes follow Next.js 13+ App Router conventions in `app/api/`:

**Authentication Pattern** (used by all protected routes):
```typescript
export async function GET(request: NextRequest) {
  // 1. Extract and verify JWT token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // 2. Apply role-based filtering
  const where: any = {};
  if (payload.role === UserRole.user) {
    where.userId = payload.userId; // Users see only their data
  }
  // Admins and accountants see all

  // 3. Execute query and return
  const data = await prisma.model.findMany({ where });
  return NextResponse.json(data);
}
```

### Pagination Pattern (Cursor-Based)

**Request:**
```
GET /api/expenses?cursor=<id>&limit=50&search=coffee&categoryId=abc
```

**Response Format** (⚠️ Note: key is `expenses`, not `items`):
```typescript
{
  expenses: Expense[],       // Current page items
  nextCursor: string | null, // ID of last item for next page
  hasMore: boolean          // Whether more pages exist
}
```

**Backward Compatibility:**
Some older endpoints may return `Expense[]` directly. Handle both formats:
```typescript
const expenses = Array.isArray(data) ? data : (data.expenses || []);
```

### Role-Based Access Control

- **user**: Can only see/modify their own data (where.userId = payload.userId)
- **accountant**: Can view all expenses/budgets, view audit logs
- **admin**: Full access to everything including user management

## Data Handling

### Currency (Critical for Accuracy)

All amounts stored as **cents (integer)** to avoid floating-point errors:

```typescript
// ✅ Correct - Storage
const amountInCents = Math.round(dollarAmount * 100);
await prisma.expense.create({
  data: { amount: amountInCents } // 1050 for $10.50
});

// ✅ Correct - Retrieval
const dollarAmount = centsToDollars(expense.amount); // 10.50

// ✅ Correct - Display
const formatted = formatCurrency(expense.amount); // "$10.50"

// ❌ Wrong - Don't store floats
data: { amount: 10.50 } // NEVER do this!
```

**Utility Functions:**
- `dollarsToCents(10.50)` → `1050`
- `centsToDollars(1050)` → `10.50`
- `formatCurrency(1050)` → `"$10.50"`

### Dates

- Store as ISO strings in database
- Use utility functions from `src/lib/utils/date.ts`:
  - `formatDate(date)` - Display format: "Jan 15, 2024"
  - `formatInputDate(date)` - Input format: "2024-01-15"
  - `getTodayInputDate()` - Today in input format

### Search Functionality

**Current (SQLite):** Case-sensitive search only
```typescript
// ✅ Works with SQLite
where.OR = [
  { description: { contains: search } }, // Case-sensitive
  { notes: { contains: search } },
  { referenceId: { contains: search } },
];

// ❌ Fails with SQLite (PostgreSQL-only)
where.OR = [
  { description: { contains: search, mode: 'insensitive' } },
];
```

**Future (PostgreSQL):** Case-insensitive search will work after migration

## React Query Integration (Phase 1 Feature)

### State Management Strategy

- **Server State**: React Query (`useExpensesV2`, `useBudgets`)
- **Auth State**: React Context (`AuthContext`)
- **UI State**: Local component state
- **Notifications**: Toast Context

### Hook Compatibility (Important!)

**Two expense hooks exist** - understand when to use each:

**1. `useExpenses` (Old)** - `src/hooks/useExpenses.ts`
- Returns: `Expense[]` directly
- Used by: Dashboard V1, V2, V3 (all dashboard components)
- Pagination: Client-side (loads all, filters locally)
- Caching: None (refetches on every mount)

**2. `useExpensesV2` (New)** - `src/hooks/useExpensesV2.ts`
- Returns: Paginated data with infinite scroll
- Used by: `/expenses` page only
- Pagination: Server-side cursor-based (50 at a time)
- Caching: React Query (1-minute stale time)

**Cache Invalidation Pattern:**
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After create/update/delete
await mutateExpense();
queryClient.invalidateQueries({ queryKey: ['expenses'] });
router.push('/expenses');
```

## Dashboard Versions

Three dashboard implementations available in `app/(dashboard)/`:

```typescript
// app/(dashboard)/dashboard-v1-gradient.tsx - Modern glassmorphism design
// app/(dashboard)/dashboard-v2-minimal.tsx  - Clean, Apple-like minimal design
// app/(dashboard)/dashboard-v3-analytics.tsx - Data-rich analytics (DEFAULT)
```

**Switch Dashboard Version:**
Edit `app/page.tsx`:
```typescript
import DashboardV3Analytics from './dashboard-v3-analytics';

// Inside component:
if (isAuthenticated) {
  return <DashboardV3Analytics />; // Change this import
}
```

All three versions use `useExpenses` (old hook), not `useExpensesV2`.

## Component Guidelines

### UI Components (src/components/ui/)

**Base Primitives:**
- `Button` - Variants: primary, secondary, ghost
- `Input` - Text inputs with labels, errors, helper text
- `Select` - Dropdowns with label support
- `Card` - Container with padding and shadow

**Standards:**
- Always define explicit TypeScript interfaces for props
- Include accessibility (ARIA labels, keyboard navigation)
- Use Tailwind CSS utilities exclusively
- Support disabled states
- Provide loading states where applicable

**Input Text Contrast** (Fixed in Phase 1):
```typescript
// ✅ Correct - High contrast
className="text-gray-900 placeholder-gray-400"

// ❌ Wrong - Too light, hard to read
className="text-gray-500" // Don't use for input text
```

### Form Components

**Validation Pattern:**
```typescript
import { validateExpense } from '@/lib/validators/expenseValidator';

const validation = validateExpense(formData);
if (!validation.success) {
  const fieldErrors: Record<string, string> = {};
  validation.error.issues.forEach((err) => {
    if (err.path[0]) {
      fieldErrors[err.path[0] as string] = err.message;
    }
  });
  setErrors(fieldErrors);
  return;
}
```

**Requirements:**
- Server-side validation using Zod schemas
- Client-side validation for UX (same schemas)
- Display field-level errors below inputs
- Show loading spinner during submission
- Use Toast context for success/error notifications

### Data Components

**React Query Best Practices:**
```typescript
// ✅ Correct - Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['expenses', filters],
  queryFn: ({ pageParam }) => fetchExpenses({ cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

// ✅ Correct - Optimistic updates
const mutation = useMutation({
  mutationFn: updateExpense,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['expenses'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['expenses']);

    // Optimistically update
    queryClient.setQueryData(['expenses'], newData);

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['expenses'], context.previous);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  },
});
```

## Testing Strategy

**Current Reality:** No tests implemented yet (this is a future goal).

**Planned Testing Approach:**

### Unit Tests (Future)
- Test utilities: `currency.ts`, `date.ts`, `formatting.ts`
- Test validators: Zod schemas
- Test service layer functions
- Mock external dependencies (Prisma, fetch)

### Integration Tests (Future)
- Test API routes with test database
- Test authentication flows (login, register, token verification)
- Test role-based access control (user vs accountant vs admin)
- Test pagination and filtering

### E2E Tests (Future)
- Critical user flows (login → add expense → view list)
- Form validation and error handling
- Cross-browser compatibility

**Until tests exist**, perform manual testing using this checklist:
1. Login/logout flow works
2. Add expense → appears immediately (cache invalidation)
3. Search with debounce (150ms) → filters results
4. Infinite scroll → loads more without duplicates
5. Grand total stays constant while scrolling
6. Filters (category, date, payment method) work correctly
7. Role-based access works for all three user types

## Performance Optimization

### Current Optimizations (Phase 1)

1. **Cursor-based Pagination**: Loads 50 expenses at a time vs all at once
   - Scalable to millions of records
   - Constant-time lookups (doesn't use OFFSET)

2. **React Query Caching**: 1-minute stale time, reduces API calls by ~90%
   ```typescript
   staleTime: 60 * 1000, // Consider data fresh for 1 minute
   refetchOnWindowFocus: false,
   retry: 1,
   ```

3. **Debounced Search**: 150ms delay prevents excessive API requests
   ```typescript
   useEffect(() => {
     const timer = setTimeout(() => {
       setDebouncedSearch(searchQuery);
     }, 150);
     return () => clearTimeout(timer);
   }, [searchQuery]);
   ```

4. **Infinite Scroll**: Intersection Observer for smooth, automatic loading
   ```typescript
   const observer = new IntersectionObserver(
     (entries) => {
       if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
         fetchNextPage();
       }
     },
     { threshold: 0.1 }
   );
   ```

5. **Separate Stats Endpoint**: `/api/expenses/stats` returns grand total
   - Prevents recalculation on every scroll
   - Shows "Showing X of Y" progress indicator

### Future Improvements

- Implement Redis caching layer for frequently accessed data
- Add database indexes for common queries (date, categoryId, userId)
- Optimize bundle size with code splitting and dynamic imports
- Add service worker for offline support
- Implement virtual scrolling for very long lists

## Known Issues & Bug Fixes

### Issues Fixed in Phase 1

**1. "expenses.reduce is not a function"**
- **Cause**: API response format changed from `Expense[]` to `{expenses, nextCursor, hasMore}`
- **Fix**: Updated old `useExpenses` hook to handle both formats
- **Location**: `src/hooks/useExpenses.ts:82`

**2. "Search fails with SQLite"**
- **Cause**: SQLite doesn't support `mode: 'insensitive'` in Prisma
- **Fix**: Removed mode parameter, search is now case-sensitive
- **Future**: Will be fixed when migrated to PostgreSQL

**3. "Total changes from $12,000 to $25,000 on scroll"**
- **Cause**: Total calculated from loaded expenses array (grows with infinite scroll)
- **Fix**: Created `/api/expenses/stats` endpoint to fetch constant grand total
- **Location**: `app/api/expenses/stats/route.ts`

**4. "New expense doesn't appear in list"**
- **Cause**: React Query cache not invalidated after mutation
- **Fix**: Added `queryClient.invalidateQueries({ queryKey: ['expenses'] })` after create/update
- **Location**: `src/components/expenses/ExpenseForm.tsx:131`

**5. "Input text too light, hard to read"**
- **Cause**: No explicit text color, browser default was too light
- **Fix**: Added `text-gray-900 placeholder-gray-400` to all inputs
- **Location**: All Input components and forms

**6. "Search bar not responsive enough"**
- **Cause**: 300ms debounce felt slow, no visual feedback
- **Fix**: Reduced debounce to 150ms, added auto-focus, pulsing search icon
- **Location**: `app/(dashboard)/expenses/page.tsx:36-43`

### Current Limitations

**SQLite Limitations:**
1. Case-sensitive search only (no `mode: 'insensitive'`)
2. Limited concurrency (single-writer)
3. No built-in full-text search (relies on `LIKE` queries)

**Migration Path**: Plan to migrate to PostgreSQL for production to enable:
- Case-insensitive search
- Better concurrency
- Full-text search capabilities
- Better performance at scale

**Browser Compatibility:**
- Tested: Chrome, Firefox, Safari (latest versions)
- Not tested: IE11, older browsers

## Security Considerations

### Authentication & Authorization

**JWT Token Flow:**
1. Login: `POST /api/auth/login` → returns JWT token + user data
2. Client stores token in localStorage (via AuthContext)
3. All API requests include `Authorization: Bearer ${token}` header
4. Server verifies with `verifyToken()` from `src/lib/auth/jwt.ts`

**Security Notes:**
- JWT tokens stored in localStorage (⚠️ vulnerable to XSS)
- **Production**: Consider httpOnly cookies for better security
- Token expiration: 24 hours
- Password hashing: bcrypt with 10 rounds

### Input Validation

**Defense in Depth:**
- Server-side validation using Zod (security boundary)
- Client-side validation for UX (not security)
- Sanitize all user inputs before storage
- Prisma parameterized queries prevent SQL injection

### Authorization Pattern

```typescript
// Server-side role checks (security boundary)
if (payload.role === UserRole.user && expense.userId !== payload.userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Client-side role checks (UX only, NOT security)
{user.role === 'admin' && <AdminButton />}
```

**Remember**: Client-side checks are for UI only. Always enforce authorization server-side.

## Code Quality Standards

### TypeScript

```typescript
// ✅ Correct - Explicit types
function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

// ✅ Correct - Interface for complex objects
interface ExpenseFormData {
  categoryId: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  referenceId?: string;
}

// ❌ Wrong - Using 'any'
function processData(data: any) { // Don't use 'any'!
  return data.map((item: any) => item.value);
}

// ✅ Better - Use 'unknown' if truly unknown
function processData(data: unknown) {
  if (Array.isArray(data)) {
    return data.map((item) => item.value);
  }
  throw new Error('Expected array');
}
```

### Code Style

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings (`'text'` not `"text"`)
- **Trailing commas**: In objects and arrays
- **Max line length**: 100 characters
- **Semicolons**: Required

### Naming Conventions

```typescript
// Components - PascalCase
ExpenseForm.tsx
DashboardV3Analytics.tsx

// Files - PascalCase for components, camelCase for utilities
formatCurrency.ts
useExpenses.ts

// Functions - camelCase
getUserExpenses()
calculateBudgetUtilization()

// Constants - UPPER_SNAKE_CASE
const PAYMENT_METHOD_OPTIONS = [...];
const MAX_EXPENSE_AMOUNT = 1000000;

// Types/Interfaces - PascalCase
interface Expense {}
type PaymentMethod = 'cash' | 'credit_card' | 'debit_card';
```

### Error Handling

```typescript
// ✅ Correct - Try/catch with user feedback
try {
  await createExpense(data);
  showToast('success', 'Expense created successfully');
  router.push('/expenses');
} catch (error: any) {
  console.error('Create expense error:', error); // Log for debugging
  showToast('error', error.message || 'Failed to create expense'); // User-friendly
}

// ✅ Correct - API error responses
return NextResponse.json(
  { error: 'Validation failed', details: errors },
  { status: 400 }
);

// ❌ Wrong - Silent failures
try {
  await dangerousOperation();
} catch (error) {
  // Don't ignore errors!
}
```

## Common Workflows

### Adding a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b feature/budget-alerts
   ```

2. **Plan the implementation**
   - Identify affected files
   - Design data models and API endpoints
   - Consider TypeScript types needed

3. **Implement feature**
   - Update database schema if needed (`prisma/schema.prisma`)
   - Add API endpoints (`app/api/...`)
   - Create/update hooks (`src/hooks/...`)
   - Build UI components (`src/components/...`)
   - Add types (`src/types/...`)

4. **Test thoroughly** (manual checklist until automated tests exist)
   - Happy path works
   - Error cases handled gracefully
   - Role-based access enforced
   - Loading states display correctly
   - Cache invalidation works

5. **Update documentation**
   - Add to CLAUDE.md if it's a significant pattern
   - Update README if user-facing

6. **Merge to master**
   ```bash
   git checkout master
   git merge feature/budget-alerts --no-edit
   git push origin master
   ```

### Fixing a Bug

1. **Reproduce the bug** in your local environment
2. **Identify root cause** (use console.log, debugger, network tab)
3. **Fix the bug** with minimal changes
4. **Verify fix** doesn't introduce regressions
5. **Commit with descriptive message**
   ```bash
   git commit -m "Fix: Prevent total from changing on infinite scroll

   - Created /api/expenses/stats endpoint for constant grand total
   - Updated expenses page to fetch stats separately
   - Shows 'Showing X of Y' progress indicator

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
   ```

### Database Schema Changes

1. **Edit schema**: `prisma/schema.prisma`
   ```prisma
   model Expense {
     // Add new field
     tags String[] @default([])
   }
   ```

2. **Create migration**
   ```bash
   npx prisma migrate dev --name add_expense_tags
   ```

3. **Update TypeScript types** in `src/types/models.ts`

4. **Update seed scripts** if adding required fields

5. **Test migration** on clean database
   ```bash
   rm prisma/dev.db
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Update Prisma Client**
   ```bash
   npx prisma generate
   ```

## Future Roadmap

### Phase 1: Foundation & Performance ✅ (Completed)
- ✅ Cursor-based pagination (50 items per page)
- ✅ React Query integration for caching
- ✅ Search with debouncing (150ms)
- ✅ Category, payment method, date filters
- ✅ Infinite scroll with Intersection Observer
- ✅ Stats endpoint for accurate totals
- ✅ Full CRUD API endpoints

### Phase 2: Enhanced UX (Next)
- Advanced analytics dashboard with charts
- Export functionality (CSV, PDF, Excel)
- Bulk operations (delete, categorize, update)
- Keyboard shortcuts for power users
- Dark mode support
- Responsive mobile design improvements

### Phase 3: Collaboration
- Multi-user budgets (shared budgets)
- Expense approval workflows
- Comments and notes on expenses
- Activity audit trail (already exists, needs UI)
- Email notifications

### Phase 4: Intelligence
- AI expense categorization (auto-suggest category)
- Budget recommendations based on spending patterns
- Spending insights and trends
- Anomaly detection (unusual expenses)
- Predictive budgeting

### Phase 5: Scale & Production
- PostgreSQL migration (enables case-insensitive search)
- Redis caching layer for hot data
- Microservices architecture (separate auth, analytics)
- Horizontal scaling with load balancer
- Automated testing suite (unit, integration, E2E)
- CI/CD pipeline

## Production Migration Path

### SQLite → PostgreSQL Migration

**When**: Before production deployment or when >100k records

**Steps:**

1. **Set up PostgreSQL** (recommended: Neon.tech, Supabase, or Railway)

2. **Update Prisma schema**
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Remove LibSQL adapter** from `src/lib/db/prisma.ts`
   ```typescript
   // New PostgreSQL version (no adapter needed)
   const prisma = new PrismaClient({
     log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
   });
   ```

4. **Enable case-insensitive search**
   ```typescript
   where.OR = [
     { description: { contains: search, mode: 'insensitive' } }, // Now works!
     { notes: { contains: search, mode: 'insensitive' } },
   ];
   ```

5. **Run migrations**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Update environment variables**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

## Support & Resources

### Official Documentation
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **React Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

### Project-Specific Resources
- **LibSQL Adapter**: https://www.prisma.io/docs/orm/overview/databases/turso
- **JWT Authentication**: https://jwt.io/introduction
- **Zod Validation**: https://zod.dev

### Quick Reference

**Demo Accounts**: admin@example.com / admin123
**Dev Server**: http://localhost:3000
**Database GUI**: `npx prisma studio`
**Type Check**: `npx tsc --noEmit`

**Current Branch**: master
**Feature Branch**: feature/expense-management-v2 (merged)

---

*Last Updated: Phase 1 completed - February 2024*
