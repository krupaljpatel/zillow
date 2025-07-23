import { Property, InvestmentMetrics } from '../types/property';
import { calculateMonthlyPayment, calculateBreakEvenRent } from './mortgageCalculator';

/**
 * Calculate comprehensive investment metrics for a property
 */
export function calculateInvestmentMetrics(property: Property): InvestmentMetrics {
  // Monthly Calculations
  const monthlyMortgagePayment = calculateMonthlyPayment(
    property.loanAmount,
    property.interestRate,
    property.loanTermYears
  );
  
  const monthlyOperatingExpenses = calculateMonthlyOperatingExpenses(property);
  const netMonthlyCashFlow = property.monthlyRent - monthlyOperatingExpenses - monthlyMortgagePayment;
  
  // Annual Calculations
  const annualGrossRent = property.monthlyRent * 12;
  const annualOperatingExpenses = monthlyOperatingExpenses * 12;
  const annualNetOperatingIncome = annualGrossRent - annualOperatingExpenses;
  const annualCashFlow = netMonthlyCashFlow * 12;
  
  // Investment Returns
  const capRate = calculateCapRate(annualNetOperatingIncome, property.marketValue);
  const cashOnCashReturn = calculateCashOnCashReturn(annualCashFlow, property.downPayment);
  const totalROI = calculateTotalROI(annualCashFlow, property.downPayment, property.marketValue, property.purchasePrice);
  
  // Break-even Analysis
  const breakEvenRent = calculateBreakEvenRent(monthlyMortgagePayment, monthlyOperatingExpenses);
  const cashFlowBreakEven = netMonthlyCashFlow >= 0;
  
  return {
    monthlyMortgagePayment: Math.round(monthlyMortgagePayment * 100) / 100,
    monthlyOperatingExpenses: Math.round(monthlyOperatingExpenses * 100) / 100,
    netMonthlyCashFlow: Math.round(netMonthlyCashFlow * 100) / 100,
    annualGrossRent: Math.round(annualGrossRent * 100) / 100,
    annualNetOperatingIncome: Math.round(annualNetOperatingIncome * 100) / 100,
    annualCashFlow: Math.round(annualCashFlow * 100) / 100,
    capRate: Math.round(capRate * 100) / 100,
    cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
    totalROI: Math.round(totalROI * 100) / 100,
    breakEvenRent,
    cashFlowBreakEven
  };
}

/**
 * Calculate total monthly operating expenses
 */
export function calculateMonthlyOperatingExpenses(property: Property): number {
  const baseExpenses = property.monthlyPropertyTax + property.monthlyInsurance + (property.monthlyHOA || 0);
  
  // Calculate percentage-based expenses
  const maintenanceExpense = property.monthlyRent * (property.maintenancePercentage / 100);
  const vacancyExpense = property.monthlyRent * (property.vacancyRate / 100);
  const managementExpense = property.monthlyRent * ((property.propertyManagementPercentage || 0) / 100);
  
  return baseExpenses + maintenanceExpense + vacancyExpense + managementExpense;
}

/**
 * Calculate Capitalization Rate (Cap Rate)
 * Cap Rate = Net Operating Income / Property Value
 */
export function calculateCapRate(annualNetOperatingIncome: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0;
  return (annualNetOperatingIncome / propertyValue) * 100;
}

/**
 * Calculate Cash-on-Cash Return
 * Cash-on-Cash Return = Annual Cash Flow / Total Cash Invested
 */
export function calculateCashOnCashReturn(annualCashFlow: number, totalCashInvested: number): number {
  if (totalCashInvested <= 0) return 0;
  return (annualCashFlow / totalCashInvested) * 100;
}

/**
 * Calculate Total Return on Investment (ROI)
 * ROI considers both cash flow and appreciation
 */
export function calculateTotalROI(
  annualCashFlow: number,
  downPayment: number,
  currentValue: number,
  purchasePrice: number
): number {
  if (downPayment <= 0) return 0;
  
  const appreciation = currentValue - purchasePrice;
  const totalReturn = annualCashFlow + appreciation;
  
  return (totalReturn / downPayment) * 100;
}

/**
 * Calculate the 1% Rule compliance
 * Monthly rent should be at least 1% of purchase price
 */
export function calculateOnePercentRule(monthlyRent: number, purchasePrice: number): number {
  if (purchasePrice <= 0) return 0;
  return (monthlyRent / purchasePrice) * 100;
}

/**
 * Calculate debt service coverage ratio
 * DSCR = Net Operating Income / Annual Debt Service
 */
export function calculateDSCR(annualNetOperatingIncome: number, annualMortgagePayments: number): number {
  if (annualMortgagePayments <= 0) return 0;
  return annualNetOperatingIncome / annualMortgagePayments;
}

/**
 * Determine investment grade based on key metrics
 */
export function getInvestmentGrade(metrics: InvestmentMetrics): 'A' | 'B' | 'C' | 'D' | 'F' {
  let score = 0;
  
  // Cap Rate scoring (0-25 points)
  if (metrics.capRate >= 8) score += 25;
  else if (metrics.capRate >= 6) score += 20;
  else if (metrics.capRate >= 4) score += 15;
  else if (metrics.capRate >= 2) score += 10;
  else score += 5;
  
  // Cash Flow scoring (0-25 points)
  if (metrics.netMonthlyCashFlow >= 500) score += 25;
  else if (metrics.netMonthlyCashFlow >= 200) score += 20;
  else if (metrics.netMonthlyCashFlow >= 0) score += 15;
  else if (metrics.netMonthlyCashFlow >= -200) score += 10;
  else score += 5;
  
  // Cash-on-Cash Return scoring (0-25 points)
  if (metrics.cashOnCashReturn >= 12) score += 25;
  else if (metrics.cashOnCashReturn >= 8) score += 20;
  else if (metrics.cashOnCashReturn >= 5) score += 15;
  else if (metrics.cashOnCashReturn >= 2) score += 10;
  else score += 5;
  
  // Total ROI scoring (0-25 points)
  if (metrics.totalROI >= 15) score += 25;
  else if (metrics.totalROI >= 10) score += 20;
  else if (metrics.totalROI >= 6) score += 15;
  else if (metrics.totalROI >= 3) score += 10;
  else score += 5;
  
  // Convert score to grade
  if (score >= 90) return 'A';
  else if (score >= 80) return 'B';
  else if (score >= 70) return 'C';
  else if (score >= 60) return 'D';
  else return 'F';
}