import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/reports/monthly - Get monthly report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    // Default to current month and year if not provided
    const now = new Date();
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1;
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: 'Year must be between 2000 and 2100' },
        { status: 400 }
      );
    }

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all staff with their loans and payments
    const staffMembers = await prisma.staff.findMany({
      include: {
        loans: {
          include: {
            payments: {
              where: {
                paymentDate: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get all payments for the month
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        loan: {
          include: {
            staff: true
          }
        }
      }
    });

    // Calculate staff reports
    const staffReports = staffMembers.map(staff => {
      // Get active loans for this staff member
      const activeLoans = staff.loans.filter(loan => 
        loan.status === 'ACTIVE' || loan.status === 'SUSPENDED'
      );

      // Calculate outstanding balance
      const outstandingBalance = activeLoans.reduce((sum, loan) => 
        sum + loan.outstandingBalance, 0
      );

      // Calculate amount repaid this month
      const amountRepaidThisMonth = staff.loans.reduce((sum, loan) => {
        const loanPayments = loan.payments.reduce((paymentSum, payment) => 
          paymentSum + payment.amount, 0
        );
        return sum + loanPayments;
      }, 0);

      // Get loan history for this staff member
      const loanHistory = staff.loans.map(loan => ({
        id: loan.id,
        loanAmount: loan.loanAmount,
        monthlyPayment: loan.monthlyPayment,
        outstandingBalance: loan.outstandingBalance,
        status: loan.status,
        startDate: loan.startDate,
        endDate: loan.endDate,
        paymentsThisMonth: loan.payments.length,
        amountPaidThisMonth: loan.payments.reduce((sum, payment) => sum + payment.amount, 0)
      }));

      return {
        staffId: staff.id,
        staffName: staff.name,
        employeeId: staff.employeeId,
        department: staff.department,
        outstandingBalance,
        amountRepaidThisMonth,
        totalLoans: staff.loans.length,
        activeLoans: activeLoans.length,
        loanHistory
      };
    });

    // Calculate totals
    const totalOutstanding = staffReports.reduce((sum, report) => 
      sum + report.outstandingBalance, 0
    );

    const totalRepaidThisMonth = monthlyPayments.reduce((sum, payment) => 
      sum + payment.amount, 0
    );

    // Get top borrowers (by outstanding balance)
    const topBorrowers = staffReports
      .filter(report => report.outstandingBalance > 0)
      .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
      .slice(0, 10);

    // Get payment summary by department
    const departmentSummary = staffReports.reduce((acc, report) => {
      if (!acc[report.department]) {
        acc[report.department] = {
          department: report.department,
          staffCount: 0,
          totalOutstanding: 0,
          totalRepaidThisMonth: 0,
          activeLoansCount: 0
        };
      }

      acc[report.department].staffCount += 1;
      acc[report.department].totalOutstanding += report.outstandingBalance;
      acc[report.department].totalRepaidThisMonth += report.amountRepaidThisMonth;
      acc[report.department].activeLoansCount += report.activeLoans;

      return acc;
    }, {} as Record<string, any>);

    const report = {
      month,
      year,
      monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
      reportDate: new Date().toISOString(),
      staffReports,
      summary: {
        totalStaff: staffMembers.length,
        totalOutstanding,
        totalRepaidThisMonth,
        totalPayments: monthlyPayments.length,
        averageOutstandingPerStaff: staffMembers.length > 0 ? totalOutstanding / staffMembers.length : 0
      },
      topBorrowers,
      departmentSummary: Object.values(departmentSummary),
      paymentDetails: monthlyPayments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        staffName: payment.loan.staff.name,
        employeeId: payment.loan.staff.employeeId,
        department: payment.loan.staff.department,
        loanId: payment.loan.id,
        remainingBalance: payment.remainingBalance,
        notes: payment.notes
      }))
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}
