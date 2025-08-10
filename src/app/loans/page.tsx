"use client";

import { useState } from 'react';
import { useLoans } from '@/hooks/use-loans';
import { formatCurrency, formatDate, formatLoanStatus, getStatusColor } from '@/lib/formatters';
import { calculateLoanProgress } from '@/lib/loan-calculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function LoansPage() {
  const { loans, loading, error, fetchLoans } = useLoans();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Filter loans based on search term and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = !searchTerm || 
      loan.staff?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.staff?.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.staff?.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Loans</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchLoans()}>Try Again</Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600 mt-1">View and manage all staff loans</p>
        </div>
        <Link href="/loans/new">
          <Button>New Loan Application</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by staff name, employee ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={statusFilter || 'all'} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="FULLY_PAID">Fully Paid</SelectItem>
            <SelectItem value="BAD_DEBT">Bad Debt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{loans.length}</div>
            <p className="text-xs text-gray-600">Total Loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {loans.filter(l => l.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-gray-600">Active Loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {loans.filter(l => l.status === 'FULLY_PAID').length}
            </div>
            <p className="text-xs text-gray-600">Fully Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0))}
            </div>
            <p className="text-xs text-gray-600">Outstanding Balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loans ({filteredLoans.length})</CardTitle>
          <CardDescription>
            {filteredLoans.length !== loans.length && 
              `Showing ${filteredLoans.length} of ${loans.length} loans`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLoans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No loans found matching your criteria</p>
              {searchTerm || statusFilter ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href="/loans/new">
                  <Button className="mt-4">Create First Loan</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => {
                    const progress = calculateLoanProgress(loan.loanAmount, loan.outstandingBalance);
                    
                    return (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{loan.staff?.name}</div>
                            <div className="text-sm text-gray-600">
                              {loan.staff?.employeeId} • {loan.staff?.department}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(loan.loanAmount)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(loan.monthlyPayment)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(loan.outstandingBalance)}
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress value={progress} className="h-2" />
                            <div className="text-xs text-gray-600 mt-1">{Math.round(progress)}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(loan.status)}>
                            {formatLoanStatus(loan.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(loan.startDate)}</TableCell>
                        <TableCell>
                          <Link href={`/loans/${loan.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
