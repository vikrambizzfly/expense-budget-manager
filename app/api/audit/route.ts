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

    // Only admins and accountants can view audit logs
    if (payload.role === UserRole.user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;

    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    const formattedLogs = auditLogs.map((log) => ({
      ...log,
      changes: JSON.parse(log.changes),
      timestamp: log.timestamp.toISOString(),
    }));

    return NextResponse.json(formattedLogs);
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
