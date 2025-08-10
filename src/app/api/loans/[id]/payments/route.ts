import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateRemainingBalance } from '@/lib/loan-calculator';

const prisma = new PrismaClient();

// POST /api/loans/[id]/payments - Record a payment for a loan
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { amount, paymentDate, notes } = body;

    // Validate required fields
    if (!amount) {
      return NextResponse.json(
        { error: 'Payment amount is required' },
        { status: 400 }
      );
    }

    // Validate positive amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be positive' },
        { status: 400 }
      );
    }

    // Check if loan exists
    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: { staff: true }
    });

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Check if loan is active
    if (loan.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot record payment for inactive loan' },
        { status: 400 }
      );
    }

    // Check if payment amount exceeds outstanding balance
    if (amount > loan.outstandingBalance) {
      return NextResponse.json(
        { error: 'Payment amount cannot exceed outstanding balance' },
        { status: 400 }
      );
    }

    // Calculate new remaining balance
    const newBalance = calculateRemainingBalance(loan.outstandingBalance, amount);
    
    // Determine new loan status
    let newStatus: 'ACTIVE' | 'SUSPENDED' | 'FULLY_PAID' | 'BAD_DEBT' = loan.status;
    if (newBalance === 0) {
      newStatus = 'FULLY_PAID';
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment record
      const payment = await tx.payment.create({
        data: {
          loanId: params.id,
          amount,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          remainingBalance: newBalance,
          notes: notes || null
        }
      });

      // Update the loan's outstanding balance and status
      const updatedLoan = await tx.loan.update({
        where: { id: params.id },
        data: {
          outstandingBalance: newBalance,
          status: newStatus,
          ...(newBalance === 0 && { endDate: new Date() }),
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

      return { payment, loan: updatedLoan };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}

// GET /api/loans/[id]/payments - Get all payments for a loan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if loan exists
    const loan = await prisma.loan.findUnique({
      where: { id: params.id }
    });

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: { loanId: params.id },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
