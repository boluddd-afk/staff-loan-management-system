"use client";

import { useDashboardStats } from '@/hooks/use-loans';
import { formatCurrency, formatNumber, formatDate, getRelativeTime } from '@/lib/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function Dashboard() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Loan Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage staff loans without interest</p>
        </div>
        <div className="flex gap-3">
          <Link href="/loans/new">
            <Button>New Loan Application</Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline">View Reports</Button>
          </Link>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Loans Given</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(stats.totalLoansGiven)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Total Amount: {formatCurrency(stats.totalLoanAmountGiven)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding Balance</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {formatCurrency(stats.totalOutstandingBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Active Loans: {stats.totalActiveLoans}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amount Repaid</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(stats.totalAmountRepaid)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Fully Paid: {stats.totalFullyPaidLoans}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Problem Loans</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {stats.totalSuspendedLoans + stats.totalBadDebtLoans}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Suspended: {stats.totalSuspendedLoans} | Bad Debt: {stats.totalBadDebtLoans}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Loans</CardTitle>
            <CardDescription>Latest loan applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentLoans.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent loans</p>
              ) : (
                stats.recentLoans.map((loan: any) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{loan.staff.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(loan.loanAmount)} • {loan.durationMonths} months
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {loan.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(loan.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/loans">
                <Button variant="outline" className="w-full">View All Loans</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPayments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent payments</p>
              ) : (
                stats.recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.loan.staff.name}</p>
                      <p className="text-sm text-gray-600">
                        Payment: {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(payment.remainingBalance)} left
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(payment.paymentDate)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/loans">
                <Button variant="outline" className="w-full">View Payment History</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>Loans given and payments received this year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.monthlyStats.map((month: any) => (
              <div key={month.month} className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm">{month.monthName}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Loans:</span>
                    <span className="font-medium">{month.loanCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Given:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(month.totalLoansGiven)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Repaid:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(month.totalPayments)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/loans/new">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <span className="font-medium">New Loan</span>
                <span className="text-sm text-gray-600">Create loan application</span>
              </Button>
            </Link>
            <Link href="/staff/new">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <span className="font-medium">Add Staff</span>
                <span className="text-sm text-gray-600">Register new staff member</span>
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <span className="font-medium">Monthly Report</span>
                <span className="text-sm text-gray-600">Generate detailed report</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
