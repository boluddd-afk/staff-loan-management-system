/**
 * Calculate monthly payment for a loan without interest
 * @param loanAmount - Total loan amount
 * @param durationMonths - Loan duration in months
 * @returns Monthly payment amount
 */
export function calculateMonthlyPayment(loanAmount: number, durationMonths: number): number {
  if (durationMonths <= 0) {
    throw new Error('Duration must be greater than 0');
  }
  return loanAmount / durationMonths;
}

/**
 * Calculate remaining balance after a payment
 * @param currentBalance - Current outstanding balance
 * @param paymentAmount - Payment amount
 * @returns New remaining balance
 */
export function calculateRemainingBalance(currentBalance: number, paymentAmount: number): number {
  const newBalance = currentBalance - paymentAmount;
  return Math.max(0, newBalance); // Ensure balance doesn't go negative
}

/**
 * Calculate total amount paid so far
 * @param loanAmount - Original loan amount
 * @param outstandingBalance - Current outstanding balance
 * @returns Total amount paid
 */
export function calculateTotalPaid(loanAmount: number, outstandingBalance: number): number {
  return loanAmount - outstandingBalance;
}

/**
 * Calculate loan progress percentage
 * @param loanAmount - Original loan amount
 * @param outstandingBalance - Current outstanding balance
 * @returns Progress percentage (0-100)
 */
export function calculateLoanProgress(loanAmount: number, outstandingBalance: number): number {
  if (loanAmount <= 0) return 0;
  const progress = ((loanAmount - outstandingBalance) / loanAmount) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Calculate expected end date for a loan
 * @param startDate - Loan start date
 * @param durationMonths - Loan duration in months
 * @returns Expected end date
 */
export function calculateExpectedEndDate(startDate: Date, durationMonths: number): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  return endDate;
}

/**
 * Check if a loan is overdue based on expected payments
 * @param startDate - Loan start date
 * @param monthlyPayment - Expected monthly payment
 * @param totalPaid - Total amount paid so far
 * @returns Whether the loan is overdue
 */
export function isLoanOverdue(startDate: Date, monthlyPayment: number, totalPaid: number): boolean {
  const now = new Date();
  const monthsElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
  const expectedPaid = monthsElapsed * monthlyPayment;
  return totalPaid < expectedPaid && monthsElapsed > 0;
}

/**
 * Calculate months remaining for a loan
 * @param outstandingBalance - Current outstanding balance
 * @param monthlyPayment - Monthly payment amount
 * @returns Number of months remaining
 */
export function calculateMonthsRemaining(outstandingBalance: number, monthlyPayment: number): number {
  if (monthlyPayment <= 0) return 0;
  return Math.ceil(outstandingBalance / monthlyPayment);
}
