import { NextRequest, NextResponse } from 'next/server';
import { getAuthServicePrisma } from '@/lib/services/AuthService.prisma';
import { validateLogin } from '@/lib/validators/userValidator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = validateLogin(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const authService = getAuthServicePrisma();
    const authToken = await authService.login(body);

    return NextResponse.json(authToken, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
