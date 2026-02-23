import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticateRequest, isAuthPayload } from '@/lib/auth/apiAuth';
import { validateExpense } from '@/lib/validators/expenseValidator';
import { UserRole, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!isAuthPayload(authResult)) {
      return authResult; // Return error response
    }
    const payload = authResult;

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const paymentMethod = searchParams.get('paymentMethod');
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause based on user role
    const where: Prisma.ExpenseWhereInput = {};

    // Regular users can only see their own expenses
    // Accountants and admins can see all expenses
    if (payload.role === UserRole.user) {
      where.userId = payload.userId;
    }

    // Apply filters
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }

      if (start > end) {
        return NextResponse.json(
          { error: 'Start date must be before or equal to end date' },
          { status: 400 }
        );
      }

      where.date = {
        gte: start,
        lte: end,
      };
    }

    if (search) {
      // SQLite doesn't support mode: 'insensitive', so we use contains without mode
      where.OR = [
        { description: { contains: search } },
        { notes: { contains: search } },
        { referenceId: { contains: search } },
      ];
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Cursor-based pagination
    const queryOptions: Prisma.ExpenseFindManyArgs = {
      where,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1, // Take one extra to know if there are more
    };

    if (cursor) {
      queryOptions.cursor = {
        id: cursor,
      };
      queryOptions.skip = 1; // Skip the cursor
    }

    const expenses = await prisma.expense.findMany(queryOptions);

    // Check if there are more results
    const hasMore = expenses.length > limit;
    const items = hasMore ? expenses.slice(0, limit) : expenses;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Format dates to ISO strings
    const formattedExpenses = items.map((expense) => ({
      ...expense,
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      expenses: formattedExpenses,
      nextCursor,
      hasMore,
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!isAuthPayload(authResult)) {
      return authResult; // Return error response
    }
    const payload = authResult;

    const body = await request.json();

    // Validate input data
    const validation = validateExpense(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map((issue) => ({
            field: issue.path[0],
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { categoryId, amount, date, description, paymentMethod, notes, referenceId } =
      validation.data;
    const { userId } = body; // userId is optional, for admin creating expense for another user

    // Determine userId - regular users can only create expenses for themselves
    let targetUserId = userId || payload.userId;
    if (payload.role === UserRole.user && targetUserId !== payload.userId) {
      return NextResponse.json(
        { error: 'Users can only create expenses for themselves' },
        { status: 403 }
      );
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        userId: targetUserId,
        categoryId,
        amount: Math.round(amount * 100), // Convert to cents
        date: new Date(date),
        description,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        referenceId: referenceId || null,
        createdBy: payload.userId,
        createdAt: new Date(),
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Format response
    const formattedExpense = {
      ...expense,
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt?.toISOString(),
    };

    return NextResponse.json(formattedExpense, { status: 201 });
  } catch (error: any) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}
