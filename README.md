# Expense & Budget Manager

A professional, production-ready expense tracking and budget management application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- ✅ **User Authentication** - JWT-based auth with role-based access control
- ✅ **Expense Tracking** - Full CRUD operations for expenses with categories
- ✅ **Budget Management** - Category-based budgets with alerts and rollover rules
- ✅ **Role-Based Access** - Three user roles (Admin, Accountant, Regular User)
- ✅ **Real-time Budget Alerts** - Automatic alerts at 80% and 100% thresholds
- ⏳ **Analytics Dashboard** - Visual charts and spending insights (coming soon)
- ⏳ **Export System** - Excel, PDF, and CSV exports (coming soon)
- ⏳ **Audit Trail** - Complete activity logging (coming soon)

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: JWT, bcryptjs
- **Validation**: Zod
- **Storage**: localStorage (with abstraction for future database migration)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository and navigate to the directory:
```bash
cd ~/expense-budget-manager
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3002
```

## Demo Accounts

The application comes with three pre-configured demo accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@example.com | admin123 | Full access to all features |
| **Accountant** | accountant@example.com | accountant123 | View/edit all expenses, view budgets, view audit logs |
| **User** | user@example.com | user123 | Manage own expenses and budgets |

## User Roles & Permissions

### Admin
- Full CRUD access to all expenses, budgets, categories, and users
- Can manage system categories
- Can create/edit/delete user accounts
- Full access to reports and audit logs

### Accountant
- View and edit all expenses (cannot delete)
- View all budgets (read-only)
- View all reports
- Access to audit logs
- Cannot manage categories or users

### Regular User
- Manage own expenses (full CRUD)
- Manage own budgets (full CRUD)
- View categories (read-only)
- Export own data
- No access to user management or audit logs

## Key Features Explained

### Expense Management
- Add expenses with category, amount, date, description, payment method
- Optional notes and reference ID for better tracking
- Filter and search capabilities
- Edit and delete your own expenses
- Real-time total calculation

### Budget System
- Create monthly or annual budgets per category
- Set budget amounts with automatic tracking
- Configure rollover rules:
  - **No Rollover**: Start fresh each period
  - **Rollover Surplus**: Carry forward only if under budget
  - **Rollover All**: Carry forward all remaining/deficit amount
- Automatic alerts:
  - Warning at 80% spent (if enabled)
  - Critical at 100% spent (if enabled)

### Categories
7 default categories included:
- Food & Dining
- Transportation
- Entertainment
- Shopping
- Bills & Utilities
- Healthcare
- Other

Admins can create custom categories.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── expenses/         # Expense-related components
│   └── layout/           # Layout components (Sidebar, etc.)
├── lib/                   # Business logic and utilities
│   ├── services/         # Service layer (Auth, Expense, Budget, etc.)
│   ├── storage/          # Storage abstraction layer
│   ├── auth/             # Authentication utilities
│   ├── budget/           # Budget calculation logic
│   ├── validators/       # Zod validation schemas
│   └── utils/            # Utility functions
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── contexts/             # React contexts (Auth, Toast)
```

## Storage Architecture

The application uses a **storage abstraction layer** that currently implements localStorage but can be easily swapped for PostgreSQL, MongoDB, or any other database.

### Migration Path
To migrate to a production database:
1. Create a new adapter (e.g., `PostgresAdapter`) implementing `IStorageAdapter`
2. Update the dependency injection in services
3. Run a data migration script
4. No changes needed in components or business logic!

## Development

### Adding New Features

1. **Add new types**: Update `src/types/models.ts`
2. **Create service**: Add business logic in `src/lib/services/`
3. **Create components**: Build UI in `src/components/`
4. **Add pages**: Create routes in `app/`

### Code Quality
- TypeScript for type safety
- Zod for runtime validation
- Permission checks at 3 levels (middleware, service, component)
- Separation of concerns (services for logic, components for UI)

## Currency Handling

All amounts are stored in **cents** to avoid floating-point precision issues:
- $10.50 → stored as 1050 cents
- Use `dollarsToCents()` and `centsToDollars()` utilities
- Use `formatCurrency()` for display

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Future Enhancements

- [ ] Complete analytics dashboard with charts
- [ ] Excel/PDF/CSV export functionality
- [ ] Audit trail implementation
- [ ] Advanced filtering and search
- [ ] Multi-currency support
- [ ] Recurring expenses
- [ ] Email notifications for budget alerts
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Database migration (PostgreSQL/MongoDB)

## Known Limitations

- Data is stored in localStorage (not suitable for production)
- No email notifications (alerts are in-app only)
- No file upload for receipts
- Limited to single currency (USD)

## Contributing

This is a demonstration project. Feel free to fork and extend!

## License

MIT

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS**
