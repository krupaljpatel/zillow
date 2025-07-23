import { LoanDetails } from '../types/property';

/**
 * Calculate monthly mortgage payment using the standard loan payment formula
 * M = P [ r(1 + r)^n ] / [ (1 + r)^n – 1]
 * Where:
 * M = Monthly payment
 * P = Principal loan amount
 * r = Monthly interest rate (annual rate / 12)
 * n = Total number of payments (years × 12)
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualInterestRate: number,
  termYears: number
): number {
  if (loanAmount <= 0) return 0;
  if (annualInterestRate === 0) return loanAmount / (termYears * 12);
  
  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = termYears * 12;
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
  return Math.round(monthlyPayment * 100) / 100;
}

/**
 * Calculate complete loan details including total interest and payments
 */
export function calculateLoanDetails(
  loanAmount: number,
  annualInterestRate: number,
  termYears: number
): LoanDetails {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, termYears);
  const totalPayments = monthlyPayment * termYears * 12;
  const totalInterest = totalPayments - loanAmount;
  
  return {
    loanAmount,
    interestRate: annualInterestRate,
    termYears,
    monthlyPayment,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayments: Math.round(totalPayments * 100) / 100
  };
}

/**
 * Calculate loan amount based on purchase price and down payment
 */
export function calculateLoanAmount(purchasePrice: number, downPaymentAmount: number): number {
  return Math.max(0, purchasePrice - downPaymentAmount);
}

/**
 * Calculate down payment amount from percentage
 */
export function calculateDownPaymentAmount(purchasePrice: number, downPaymentPercent: number): number {
  return Math.round(purchasePrice * (downPaymentPercent / 100) * 100) / 100;
}

/**
 * Calculate the break-even rent needed to cover all expenses
 */
export function calculateBreakEvenRent(
  monthlyMortgagePayment: number,
  monthlyOperatingExpenses: number
): number {
  return Math.round((monthlyMortgagePayment + monthlyOperatingExpenses) * 100) / 100;
}