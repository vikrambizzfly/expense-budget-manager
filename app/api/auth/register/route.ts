import { NextRequest, NextResponse } from 'next/server';
import { getAuthServicePrisma } from '@/lib/services/AuthService.prisma';
import { validateRegister } from '@/lib/validators/userValidator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = validateRegister(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const authService = getAuthServicePrisma();
    const authToken = await authService.register(body);

    return NextResponse.json(authToken, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
