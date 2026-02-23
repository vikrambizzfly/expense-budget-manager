import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

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

    // Get all active categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Format dates to ISO strings
    const formattedCategories = categories.map((category) => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
