import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticateRequest, isAuthPayload } from '@/lib/auth/apiAuth';
import { UserRole, Prisma, PaymentMethod } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!isAuthPayload(authResult)) {
      return authResult; // Return error response
    }
    const payload = authResult;

    // Get query parameters for filtering (same as main expenses endpoint)
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const paymentMethod = searchParams.get('paymentMethod');

    // Build where clause based on user role
    const where: Prisma.ExpenseWhereInput = {};

    // Regular users can only see their own expenses
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
      where.OR = [
        { description: { contains: search } },
        { notes: { contains: search } },
        { referenceId: { contains: search } },
      ];
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod as PaymentMethod;
    }

    // Get total count and sum
    const [totalCount, totalSum] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalCount,
      totalAmount: totalSum._sum.amount || 0,
    });
  } catch (error: any) {
    console.error('Get expense stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expense stats' },
      { status: 500 }
    );
  }
}
