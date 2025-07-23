export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  
  // Property Details
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  yearBuilt?: number;
  lotSize?: number;
  
  // Financial Information
  purchasePrice: number;
  marketValue: number;
  monthlyRent: number;
  
  // Loan Details
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  
  // Operating Expenses
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA?: number;
  maintenancePercentage: number; // percentage of rent
  vacancyRate: number; // percentage (e.g., 5 for 5%)
  propertyManagementPercentage?: number; // percentage of rent
  
  // External Links
  zillowUrl?: string;
  realtorUrl?: string;
  
  // Metadata
  dateAdded: Date;
  notes?: string;
}

export interface InvestmentMetrics {
  // Monthly Calculations
  monthlyMortgagePayment: number;
  monthlyOperatingExpenses: number;
  netMonthlyCashFlow: number;
  
  // Annual Calculations
  annualGrossRent: number;
  annualNetOperatingIncome: number;
  annualCashFlow: number;
  
  // Investment Returns
  capRate: number; // percentage
  cashOnCashReturn: number; // percentage
  totalROI: number; // percentage
  
  // Break-even Analysis
  breakEvenRent: number;
  cashFlowBreakEven: boolean;
}

export interface LoanDetails {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minRent?: number;
  maxRent?: number;
  propertyType?: Property['propertyType'][];
  minCapRate?: number;
  minCashFlow?: number;
  state?: string;
  city?: string;
}