import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Extracts and verifies JWT token from request Authorization header
 * @throws Returns NextResponse with error if authentication fails
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthPayload | NextResponse> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return payload as AuthPayload;
}

/**
 * Type guard to check if authentication was successful
 */
export function isAuthPayload(
  result: AuthPayload | NextResponse
): result is AuthPayload {
  return !(result instanceof NextResponse);
}
