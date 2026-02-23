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

    // Get query parameters for filtering (same as main expenses endpoint)
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const paymentMethod = searchParams.get('paymentMethod');

    // Build where clause based on user role
    const where: any = {};

    // Regular users can only see their own expenses
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
        { description: { contains: search } },
        { notes: { contains: search } },
        { referenceId: { contains: search } },
      ];
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
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
