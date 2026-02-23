import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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
    const where: any = {};

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
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { referenceId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Cursor-based pagination
    const queryOptions: any = {
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
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, amount, date, description, paymentMethod, notes, referenceId, userId } = body;

    // Validate required fields
    if (!categoryId || !amount || !date || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
