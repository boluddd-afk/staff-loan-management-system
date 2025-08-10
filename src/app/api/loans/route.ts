import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateMonthlyPayment, calculateExpectedEndDate } from '@/lib/loan-calculator';

const prisma = new PrismaClient();

// GET /api/loans - Get all loans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const staffId = searchParams.get('staffId');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (staffId) {
      where.staffId = staffId;
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        staff: true,
        payments: {
          orderBy: {
            paymentDate: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST /api/loans - Create a new loan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId, loanAmount, durationMonths, notes } = body;

    // Validate required fields
    if (!staffId || !loanAmount || !durationMonths) {
      return NextResponse.json(
        { error: 'Missing required fields: staffId, loanAmount, durationMonths' },
        { status: 400 }
      );
    }

    // Validate positive numbers
    if (loanAmount <= 0 || durationMonths <= 0) {
      return NextResponse.json(
        { error: 'Loan amount and duration must be positive numbers' },
        { status: 400 }
      );
    }

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(loanAmount, durationMonths);
    const startDate = new Date();
    const endDate = calculateExpectedEndDate(startDate, durationMonths);

    // Create the loan
    const loan = await prisma.loan.create({
      data: {
        staffId,
        loanAmount,
        durationMonths,
        monthlyPayment,
        outstandingBalance: loanAmount,
        startDate,
        endDate,
        notes: notes || null,
        status: 'ACTIVE'
      },
      include: {
        staff: true,
        payments: true
      }
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
