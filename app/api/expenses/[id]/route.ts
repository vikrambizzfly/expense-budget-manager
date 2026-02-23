import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticateRequest, isAuthPayload } from '@/lib/auth/apiAuth';
import { validateExpense } from '@/lib/validators/expenseValidator';
import { UserRole, Prisma } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!isAuthPayload(authResult)) {
      return authResult; // Return error response
    }
    const payload = authResult;

    const expenseId = params.id;

    // Get expense first
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check permissions - users can only delete their own expenses
    if (payload.role === UserRole.user && expense.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own expenses' },
        { status: 403 }
      );
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!isAuthPayload(authResult)) {
      return authResult; // Return error response
    }
    const payload = authResult;

    const expenseId = params.id;
    const body = await request.json();

    // Validate input data
    const validation = validateExpense(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map((issue) => ({
            field: issue.path[0],
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { categoryId, amount, date, description, paymentMethod, notes, referenceId } =
      validation.data;

    // Get expense first
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check permissions
    if (payload.role === UserRole.user && expense.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'You can only update your own expenses' },
        { status: 403 }
      );
    }

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        categoryId,
        amount: Math.round(amount * 100),
        date: new Date(date),
        description,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        referenceId: referenceId || null,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Format response
    const formattedExpense = {
      ...updatedExpense,
      date: updatedExpense.date.toISOString(),
      createdAt: updatedExpense.createdAt.toISOString(),
      updatedAt: updatedExpense.updatedAt?.toISOString(),
    };

    return NextResponse.json(formattedExpense);
  } catch (error: any) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update expense' },
      { status: 500 }
    );
  }
}
