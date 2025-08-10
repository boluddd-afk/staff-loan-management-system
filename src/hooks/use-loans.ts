import { useState, useEffect } from 'react';
import { Loan, Staff, Payment, LoanFormData, PaymentFormData } from '@/types/loan';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async (filters?: { status?: string; staffId?: string }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.staffId) params.append('staffId', filters.staffId);

      const response = await fetch(`/api/loans?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }

      const data = await response.json();
      setLoans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createLoan = async (loanData: LoanFormData): Promise<Loan> => {
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create loan');
      }

      const newLoan = await response.json();
      setLoans(prev => [newLoan, ...prev]);
      return newLoan;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create loan');
    }
  };

  const updateLoanStatus = async (loanId: string, status: string, notes?: string): Promise<Loan> => {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update loan');
      }

      const updatedLoan = await response.json();
      setLoans(prev => prev.map(loan => 
        loan.id === loanId ? updatedLoan : loan
      ));
      return updatedLoan;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update loan');
    }
  };

  const recordPayment = async (loanId: string, paymentData: Omit<PaymentFormData, 'loanId'>): Promise<{ payment: Payment; loan: Loan }> => {
    try {
      const response = await fetch(`/api/loans/${loanId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record payment');
      }

      const result = await response.json();
      setLoans(prev => prev.map(loan => 
        loan.id === loanId ? result.loan : loan
      ));
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to record payment');
    }
  };

  const deleteLoan = async (loanId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete loan');
      }

      setLoans(prev => prev.filter(loan => loan.id !== loanId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete loan');
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return {
    loans,
    loading,
    error,
    fetchLoans,
    createLoan,
    updateLoanStatus,
    recordPayment,
    deleteLoan,
    refetch: fetchLoans
  };
}

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async (includeLoans = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (includeLoans) params.append('includeLoans', 'true');

      const response = await fetch(`/api/staff?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      setStaff(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> => {
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create staff member');
      }

      const newStaff = await response.json();
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create staff member');
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaff,
    refetch: fetchStaff
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}
