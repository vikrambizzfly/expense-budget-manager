import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true, payload }, { status: 200 });
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 401 }
    );
  }
}
