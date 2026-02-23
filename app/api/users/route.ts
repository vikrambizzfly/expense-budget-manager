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

    // Only admins can view all users
    if (payload.role !== UserRole.admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedUsers = users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
