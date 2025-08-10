import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Get all loans with their payments
    const loans = await prisma.loan.findMany({
      include: {
        payments: true
      }
    });

    // Calculate statistics
    const totalLoansGiven = loans.length;
    const totalActiveLoans = loans.filter(loan => loan.status === 'ACTIVE').length;
    const totalSuspendedLoans = loans.filter(loan => loan.status === 'SUSPENDED').length;
    const totalBadDebtLoans = loans.filter(loan => loan.status === 'BAD_DEBT').length;
    const totalFullyPaidLoans = loans.filter(loan => loan.status === 'FULLY_PAID').length;

    // Calculate total outstanding balance
    const totalOutstandingBalance = loans
      .filter(loan => loan.status === 'ACTIVE' || loan.status === 'SUSPENDED')
      .reduce((sum, loan) => sum + loan.outstandingBalance, 0);

    // Calculate total amount repaid
    const totalAmountRepaid = loans.reduce((sum, loan) => {
      const loanRepaid = loan.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
      return sum + loanRepaid;
    }, 0);

    // Calculate total loan amount ever given
    const totalLoanAmountGiven = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);

    // Get recent loans (last 5)
    const recentLoans = await prisma.loan.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        staff: true
      }
    });

    // Get recent payments (last 5)
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: {
        paymentDate: 'desc'
      },
      include: {
        loan: {
          include: {
            staff: true
          }
        }
      }
    });

    // Calculate monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const monthlyPayments = await prisma.payment.findMany({
        where: {
          paymentDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const monthlyLoans = await prisma.loan.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      monthlyStats.push({
        month: month + 1,
        monthName: new Date(currentYear, month).toLocaleString('default', { month: 'long' }),
        totalPayments: monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0),
        totalLoansGiven: monthlyLoans.reduce((sum, loan) => sum + loan.loanAmount, 0),
        loanCount: monthlyLoans.length,
        paymentCount: monthlyPayments.length
      });
    }

    const stats = {
      totalLoansGiven,
      totalActiveLoans,
      totalSuspendedLoans,
      totalBadDebtLoans,
      totalFullyPaidLoans,
      totalOutstandingBalance,
      totalAmountRepaid,
      totalLoanAmountGiven,
      recentLoans,
      recentPayments,
      monthlyStats
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
