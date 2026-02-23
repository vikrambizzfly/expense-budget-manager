import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST() {
  try {
    // Check if database is already initialized
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database already initialized',
        userCount
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database ready but not seeded. Run npm run db:seed',
      userCount: 0
    });
  } catch (error: any) {
    console.error('Initialization check error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ initialized: userCount > 0, userCount });
  } catch (error: any) {
    console.error('Check initialization error:', error);
    return NextResponse.json(
      { initialized: false, error: error.message },
      { status: 500 }
    );
  }
}
