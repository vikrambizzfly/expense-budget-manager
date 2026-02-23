import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Build where clause based on user role
    const where: any = { isActive: true };

    if (payload.role === UserRole.user) {
      where.userId = payload.userId;
    }

    const budgets = await prisma.budget.findMany({
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
    });

    // Get expenses for each budget to calculate spent amount
    const budgetsWithStatus = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await prisma.expense.findMany({
          where: {
            userId: budget.userId,
            categoryId: budget.categoryId,
            date: {
              gte: budget.startDate,
              lte: budget.endDate,
            },
          },
        });

        const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = budget.amount - spent;
        const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        let alertLevel = 'none';
        if (percentageUsed >= 100) alertLevel = 'critical';
        else if (percentageUsed >= 80) alertLevel = 'warning';

        return {
          budget: {
            ...budget,
            startDate: budget.startDate.toISOString(),
            endDate: budget.endDate.toISOString(),
            createdAt: budget.createdAt.toISOString(),
          },
          spent,
          remaining,
          percentageUsed,
          alertLevel,
          categoryName: budget.category.name,
        };
      })
    );

    return NextResponse.json(budgetsWithStatus);
  } catch (error: any) {
    console.error('Get budgets error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, period, amount, rolloverRule, startDate, endDate, alertAt80, alertAt100, userId } = body;

    // Validate required fields
    if (!categoryId || !period || !amount || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine userId
    let targetUserId = userId || payload.userId;
    if (payload.role === UserRole.user && targetUserId !== payload.userId) {
      return NextResponse.json(
        { error: 'Users can only create budgets for themselves' },
        { status: 403 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId: targetUserId,
        categoryId,
        period,
        amount: Math.round(amount * 100),
        rolloverRule: rolloverRule || 'no_rollover',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        alertAt80: alertAt80 !== undefined ? alertAt80 : true,
        alertAt100: alertAt100 !== undefined ? alertAt100 : true,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      ...budget,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      createdAt: budget.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create budget error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create budget' },
      { status: 500 }
    );
  }
}
