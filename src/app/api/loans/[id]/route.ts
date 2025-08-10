import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/loans/[id] - Get a specific loan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        staff: true,
        payments: {
          orderBy: {
            paymentDate: 'desc'
          }
        }
      }
    });

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan' },
      { status: 500 }
    );
  }
}

// PUT /api/loans/[id] - Update a loan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes } = body;

    // Check if loan exists
    const existingLoan = await prisma.loan.findUnique({
      where: { id: params.id }
    });

    if (!existingLoan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Validate status if provided
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'FULLY_PAID', 'BAD_DEBT'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Update the loan
    const updatedLoan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
      include: {
        staff: true,
        payments: {
          orderBy: {
            paymentDate: 'desc'
          }
        }
      }
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

// DELETE /api/loans/[id] - Delete a loan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if loan exists
    const existingLoan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        payments: true
      }
    });

    if (!existingLoan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Check if loan has payments
    if (existingLoan.payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete loan with existing payments' },
        { status: 400 }
      );
    }

    // Delete the loan
    await prisma.loan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { error: 'Failed to delete loan' },
      { status: 500 }
    );
  }
}
