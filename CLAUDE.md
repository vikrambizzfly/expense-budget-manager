# Project: Expense & Budget Manager

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Principles

1. **SOLID Design Patterns**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles
2. **Strict TypeScript**: No `any` types, proper interfaces, comprehensive type safety
3. **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
4. **Test-Driven Development**: Write tests before implementation
5. **Clean Code**: Self-documenting code with minimal comments, meaningful names

## Development Workflow

### Commands
- **Development**: `npm run dev` (Next.js on port 3000)
- **Build**: `npm run build`
- **Database**:
  - Generate Prisma client: `npx prisma generate`
  - Create migration: `npx prisma migrate dev --name <name>`
  - Seed database: `npx ts-node prisma/seed-expenses.ts`
  - Studio: `npx prisma studio`
- **Linting**: `npm run lint`
- **Type Check**: `npx tsc --noEmit`

### Feature Branch Strategy
- Create feature branches for each improvement/module
- Test thoroughly before merging to master
- Use descriptive branch names: `feature/expense-pagination`, `fix/search-case-sensitivity`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite (development) with Prisma ORM 7.4.1
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: JWT with role-based access control
- **Styling**: Tailwind CSS

### Critical Requirements

#### LibSQL Adapter (MANDATORY)
All Prisma client instantiations MUST use the LibSQL adapter:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });
```

**Files requiring adapter**:
- `lib/db/prisma.ts` (global instance)
- Any seed scripts
- Any standalone database scripts

### Directory Structure
```
app/
  (dashboard)/          # Protected dashboard routes
  api/                  # API routes
  (auth)/              # Authentication routes
src/
  components/          # Reusable UI components
    ui/               # Base UI primitives
  contexts/           # React contexts
  hooks/              # Custom React hooks
  lib/
    db/               # Database utilities
    services/         # Business logic services
    utils/            # Helper utilities
    validators/       # Data validation
  types/              # TypeScript type definitions
prisma/
  schema.prisma       # Database schema
  migrations/         # Database migrations
```

## API Design

### Route Structure
- `/api/expenses` - GET (list with pagination), POST (create)
- `/api/expenses/[id]` - GET (single), PUT (update), DELETE (delete)
- `/api/expenses/stats` - GET (totals and counts)
- `/api/budgets` - Similar pattern
- `/api/categories` - Similar pattern

### Pagination Pattern
All list endpoints use cursor-based pagination:

```typescript
// Request
?cursor=<id>&limit=50

// Response
{
  items: [...],
  nextCursor: "id" | null,
  hasMore: boolean
}
```

### Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Role-Based Access
- **user**: Can only see/modify their own data
- **accountant**: Can view all data
- **admin**: Full access

## Data Handling

### Currency
- Store as **cents (integer)** to avoid floating-point errors
- Convert to dollars for display: `centsToDollars(amount)`
- Convert from dollars for storage: `Math.round(amount * 100)`

### Dates
- Store as ISO strings in database
- Use utility functions: `formatDate()`, `formatInputDate()`, `getTodayInputDate()`

### Search
- Current: Case-sensitive (SQLite limitation)
- Future: Case-insensitive when migrated to PostgreSQL

## Component Guidelines

### UI Components (src/components/ui/)
- **Reusable primitives**: Button, Input, Select, Card
- **Props interface**: Always define explicit TypeScript interfaces
- **Accessibility**: Include proper ARIA labels, keyboard navigation
- **Styling**: Use Tailwind CSS utilities, support dark mode (future)

### Form Components
- **Validation**: Use Zod schemas via `lib/validators/`
- **Error handling**: Display field-level errors
- **Loading states**: Show spinners during submission
- **Success feedback**: Use Toast context for notifications

### Data Components
- **React Query**: Use for all server state
- **Infinite scroll**: Use `useInfiniteQuery` for lists
- **Optimistic updates**: Update cache immediately, rollback on error
- **Cache invalidation**: Invalidate after mutations

## Testing Strategy

### Unit Tests
- Test utilities and validators
- Test service layer functions
- Mock external dependencies

### Integration Tests
- Test API routes with test database
- Test authentication flows
- Test role-based access control

### E2E Tests (Future)
- Critical user flows
- Cross-browser compatibility

## Performance Optimization

### Current Optimizations
- Cursor-based pagination (scalable to millions of records)
- React Query caching (reduces API calls by 90%)
- Debounced search (150ms for responsive UX)
- Intersection Observer for infinite scroll
- Server-side filtering and sorting

### Future Improvements
- Implement Redis caching layer
- Add database indexes for common queries
- Optimize bundle size with code splitting
- Add service worker for offline support

## Known Issues & Limitations

### SQLite Limitations
1. **Case-sensitive search**: No `mode: 'insensitive'` support
2. **Limited concurrency**: Single-writer limitation
3. **No built-in full-text search**: Relies on `LIKE` queries

**Migration Path**: Plan to migrate to PostgreSQL for production

### Browser Compatibility
- Tested on: Chrome, Firefox, Safari (latest versions)
- Not tested on: IE, older browsers

## Security Considerations

### Authentication
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Token expiration: 24 hours
- Password hashing: bcrypt with 10 rounds

### Authorization
- Server-side role checks on all protected routes
- Client-side role checks for UI only (not security boundary)

### Input Validation
- Server-side validation using Zod
- Client-side validation for UX
- Sanitize all user inputs

### SQL Injection
- Protected by Prisma parameterized queries
- Never construct raw SQL with user input

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Comprehensive interfaces for all data structures

### Code Style
- 2-space indentation
- Single quotes for strings
- Trailing commas in objects/arrays
- Max line length: 100 characters

### Naming Conventions
- **Components**: PascalCase (ExpenseForm)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (getUserExpenses)
- **Constants**: UPPER_SNAKE_CASE (PAYMENT_METHOD_OPTIONS)
- **Types/Interfaces**: PascalCase (ExpenseFormData)

### Error Handling
- Always catch errors in async functions
- Provide user-friendly error messages
- Log detailed errors for debugging
- Use Toast notifications for user feedback

## Common Workflows

### Adding a New Feature
1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Update types and interfaces
5. Add API endpoints if needed
6. Update UI components
7. Test thoroughly
8. Update documentation
9. Merge to master

### Fixing a Bug
1. Reproduce the bug
2. Write a failing test
3. Fix the bug
4. Verify test passes
5. Check for regressions
6. Commit with descriptive message

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Update TypeScript types
4. Update seed scripts if needed
5. Test migrations on clean database

## Future Roadmap

### Phase 1: Foundation & Performance ✅
- Cursor-based pagination
- React Query integration
- Search and filtering
- Infinite scroll

### Phase 2: Enhanced UX
- Advanced analytics dashboard
- Export functionality (CSV, PDF)
- Bulk operations
- Keyboard shortcuts

### Phase 3: Collaboration
- Multi-user budgets
- Expense approvals
- Comments and notes
- Activity audit trail

### Phase 4: Intelligence
- Expense categorization AI
- Budget recommendations
- Spending insights
- Anomaly detection

### Phase 5: Scale
- PostgreSQL migration
- Redis caching
- Microservices architecture
- Horizontal scaling

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **React Query Docs**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
