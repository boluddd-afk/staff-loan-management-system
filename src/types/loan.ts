export interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  staffId: string;
  loanAmount: number;
  durationMonths: number;
  monthlyPayment: number;
  outstandingBalance: number;
  status: LoanStatus;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  staff?: Staff;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: Date;
  remainingBalance: number;
  notes?: string;
  createdAt: Date;
  loan?: Loan;
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  FULLY_PAID = 'FULLY_PAID',
  BAD_DEBT = 'BAD_DEBT'
}

export interface LoanFormData {
  staffId: string;
  loanAmount: number;
  durationMonths: number;
  notes?: string;
}

export interface PaymentFormData {
  loanId: string;
  amount: number;
  paymentDate: Date;
  notes?: string;
}

export interface DashboardStats {
  totalLoansGiven: number;
  totalActiveLoans: number;
  totalOutstandingBalance: number;
  totalAmountRepaid: number;
  totalSuspendedLoans: number;
  totalBadDebtLoans: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  staffReports: StaffMonthlyReport[];
  totalOutstanding: number;
  totalRepaid: number;
}

export interface StaffMonthlyReport {
  staffId: string;
  staffName: string;
  department: string;
  outstandingBalance: number;
  amountRepaid: number;
  loans: Loan[];
}
