import React from 'react';
import { Property, InvestmentMetrics } from '../types/property';
import { calculateInvestmentMetrics, getInvestmentGrade, calculateOnePercentRule, calculateDSCR } from '../utils/investmentCalculator';
import { calculateLoanDetails } from '../utils/mortgageCalculator';

interface InvestmentAnalysisProps {
  property: Property;
  showAdvanced?: boolean;
}

export const InvestmentAnalysis: React.FC<InvestmentAnalysisProps> = ({ 
  property, 
  showAdvanced = true 
}) => {
  const metrics = calculateInvestmentMetrics(property);
  const grade = getInvestmentGrade(metrics);
  const loanDetails = calculateLoanDetails(property.loanAmount, property.interestRate, property.loanTermYears);
  const onePercentRule = calculateOnePercentRule(property.monthlyRent, property.purchasePrice);
  const dscr = calculateDSCR(metrics.annualNetOperatingIncome, metrics.monthlyMortgagePayment * 12);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(2)}%`;
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return '#22c55e';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      case 'D': return '#f97316';
      case 'F': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getMetricStatus = (value: number, thresholds: { good: number; fair: number }): string => {
    if (value >= thresholds.good) return 'excellent';
    if (value >= thresholds.fair) return 'good';
    return 'poor';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return '#22c55e';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="investment-analysis">
      <div className="analysis-header">
        <h2>Investment Analysis</h2>
        <div className="overall-grade" style={{ backgroundColor: getGradeColor(grade) }}>
          <span className="grade-letter">{grade}</span>
          <span className="grade-label">Investment Grade</span>
        </div>
      </div>

      <div className="property-summary">
        <h3>{property.address}</h3>
        <p>{property.city}, {property.state} {property.zipCode}</p>
        <div className="summary-stats">
          <span>{property.bedrooms} bed, {property.bathrooms} bath</span>
          {property.squareFeet && <span>{property.squareFeet.toLocaleString()} sqft</span>}
          <span>{property.propertyType}</span>
        </div>
      </div>

      {/* Key Investment Metrics */}
      <div className="metrics-section">
        <h3>Key Investment Metrics</h3>
        <div className="metrics-grid-large">
          <div className="metric-card">
            <div className="metric-value">{formatPercentage(metrics.capRate)}</div>
            <div className="metric-label">Cap Rate</div>
            <div 
              className="metric-status"
              style={{ color: getStatusColor(getMetricStatus(metrics.capRate, { good: 8, fair: 5 })) }}
            >
              {getMetricStatus(metrics.capRate, { good: 8, fair: 5 })}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{formatCurrency(metrics.netMonthlyCashFlow)}</div>
            <div className="metric-label">Monthly Cash Flow</div>
            <div 
              className="metric-status"
              style={{ color: getStatusColor(getMetricStatus(metrics.netMonthlyCashFlow, { good: 500, fair: 200 })) }}
            >
              {metrics.cashFlowBreakEven ? 'Positive' : 'Negative'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{formatPercentage(metrics.cashOnCashReturn)}</div>
            <div className="metric-label">Cash-on-Cash Return</div>
            <div 
              className="metric-status"
              style={{ color: getStatusColor(getMetricStatus(metrics.cashOnCashReturn, { good: 12, fair: 8 })) }}
            >
              {getMetricStatus(metrics.cashOnCashReturn, { good: 12, fair: 8 })}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{formatPercentage(metrics.totalROI)}</div>
            <div className="metric-label">Total ROI</div>
            <div 
              className="metric-status"
              style={{ color: getStatusColor(getMetricStatus(metrics.totalROI, { good: 15, fair: 10 })) }}
            >
              {getMetricStatus(metrics.totalROI, { good: 15, fair: 10 })}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="metrics-section">
        <h3>Monthly Cash Flow Breakdown</h3>
        <div className="breakdown-table">
          <div className="breakdown-row income">
            <span>Gross Monthly Rent</span>
            <span>+{formatCurrency(property.monthlyRent)}</span>
          </div>
          
          <div className="breakdown-divider">Operating Expenses</div>
          
          <div className="breakdown-row expense">
            <span>Property Tax</span>
            <span>-{formatCurrency(property.monthlyPropertyTax)}</span>
          </div>
          <div className="breakdown-row expense">
            <span>Insurance</span>
            <span>-{formatCurrency(property.monthlyInsurance)}</span>
          </div>
          {property.monthlyHOA > 0 && (
            <div className="breakdown-row expense">
              <span>HOA Fees</span>
              <span>-{formatCurrency(property.monthlyHOA)}</span>
            </div>
          )}
          <div className="breakdown-row expense">
            <span>Maintenance ({property.maintenancePercentage}%)</span>
            <span>-{formatCurrency(property.monthlyRent * (property.maintenancePercentage / 100))}</span>
          </div>
          <div className="breakdown-row expense">
            <span>Vacancy ({property.vacancyRate}%)</span>
            <span>-{formatCurrency(property.monthlyRent * (property.vacancyRate / 100))}</span>
          </div>
          {property.propertyManagementPercentage > 0 && (
            <div className="breakdown-row expense">
              <span>Property Management ({property.propertyManagementPercentage}%)</span>
              <span>-{formatCurrency(property.monthlyRent * (property.propertyManagementPercentage / 100))}</span>
            </div>
          )}
          
          <div className="breakdown-divider">Financing</div>
          
          <div className="breakdown-row expense">
            <span>Mortgage Payment (P&I)</span>
            <span>-{formatCurrency(metrics.monthlyMortgagePayment)}</span>
          </div>
          
          <div className="breakdown-row total">
            <span>Net Monthly Cash Flow</span>
            <span 
              style={{ color: metrics.netMonthlyCashFlow >= 0 ? '#22c55e' : '#ef4444' }}
            >
              {formatCurrency(metrics.netMonthlyCashFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Annual Summary */}
      <div className="metrics-section">
        <h3>Annual Summary</h3>
        <div className="annual-summary">
          <div className="summary-item">
            <span>Gross Annual Rent</span>
            <span>{formatCurrency(metrics.annualGrossRent)}</span>
          </div>
          <div className="summary-item">
            <span>Total Operating Expenses</span>
            <span>{formatCurrency(metrics.monthlyOperatingExpenses * 12)}</span>
          </div>
          <div className="summary-item">
            <span>Net Operating Income</span>
            <span>{formatCurrency(metrics.annualNetOperatingIncome)}</span>
          </div>
          <div className="summary-item">
            <span>Annual Debt Service</span>
            <span>{formatCurrency(metrics.monthlyMortgagePayment * 12)}</span>
          </div>
          <div className="summary-item total">
            <span>Annual Cash Flow</span>
            <span>{formatCurrency(metrics.annualCashFlow)}</span>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <>
          {/* Loan Details */}
          <div className="metrics-section">
            <h3>Loan Details</h3>
            <div className="loan-details">
              <div className="loan-item">
                <span>Loan Amount</span>
                <span>{formatCurrency(loanDetails.loanAmount)}</span>
              </div>
              <div className="loan-item">
                <span>Interest Rate</span>
                <span>{formatPercentage(loanDetails.interestRate)}</span>
              </div>
              <div className="loan-item">
                <span>Loan Term</span>
                <span>{loanDetails.termYears} years</span>
              </div>
              <div className="loan-item">
                <span>Monthly Payment (P&I)</span>
                <span>{formatCurrency(loanDetails.monthlyPayment)}</span>
              </div>
              <div className="loan-item">
                <span>Total Interest Paid</span>
                <span>{formatCurrency(loanDetails.totalInterest)}</span>
              </div>
              <div className="loan-item">
                <span>Total Payments</span>
                <span>{formatCurrency(loanDetails.totalPayments)}</span>
              </div>
            </div>
          </div>

          {/* Investment Rules & Ratios */}
          <div className="metrics-section">
            <h3>Investment Rules & Ratios</h3>
            <div className="rules-grid">
              <div className="rule-item">
                <div className="rule-name">1% Rule</div>
                <div className="rule-value">{formatPercentage(onePercentRule)}</div>
                <div 
                  className="rule-status"
                  style={{ color: onePercentRule >= 1 ? '#22c55e' : '#ef4444' }}
                >
                  {onePercentRule >= 1 ? 'Passes' : 'Fails'}
                </div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">DSCR</div>
                <div className="rule-value">{dscr.toFixed(2)}</div>
                <div 
                  className="rule-status"
                  style={{ color: dscr >= 1.25 ? '#22c55e' : dscr >= 1.0 ? '#f59e0b' : '#ef4444' }}
                >
                  {dscr >= 1.25 ? 'Strong' : dscr >= 1.0 ? 'Adequate' : 'Weak'}
                </div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">Break-Even Rent</div>
                <div className="rule-value">{formatCurrency(metrics.breakEvenRent)}</div>
                <div 
                  className="rule-status"
                  style={{ color: property.monthlyRent > metrics.breakEvenRent ? '#22c55e' : '#ef4444' }}
                >
                  {property.monthlyRent > metrics.breakEvenRent ? 'Above' : 'Below'}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="metrics-section">
            <h3>Risk Assessment</h3>
            <div className="risk-factors">
              <div className="risk-item">
                <span>Cash Flow Risk</span>
                <span 
                  className="risk-level"
                  style={{ color: metrics.netMonthlyCashFlow > 500 ? '#22c55e' : metrics.netMonthlyCashFlow > 0 ? '#f59e0b' : '#ef4444' }}
                >
                  {metrics.netMonthlyCashFlow > 500 ? 'Low' : metrics.netMonthlyCashFlow > 0 ? 'Medium' : 'High'}
                </span>
              </div>
              <div className="risk-item">
                <span>Vacancy Impact</span>
                <span>
                  {property.vacancyRate <= 5 ? 'Conservative' : property.vacancyRate <= 10 ? 'Moderate' : 'Aggressive'} 
                  ({property.vacancyRate}%)
                </span>
              </div>
              <div className="risk-item">
                <span>Maintenance Buffer</span>
                <span>
                  {property.maintenancePercentage >= 10 ? 'Conservative' : property.maintenancePercentage >= 5 ? 'Moderate' : 'Aggressive'} 
                  ({property.maintenancePercentage}%)
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Investment Summary */}
      <div className="metrics-section investment-summary">
        <h3>Investment Summary</h3>
        <div className="summary-conclusion">
          <div className="conclusion-grade" style={{ backgroundColor: getGradeColor(grade) }}>
            {grade}
          </div>
          <div className="conclusion-text">
            <h4>
              {grade === 'A' && 'Excellent Investment Opportunity'}
              {grade === 'B' && 'Good Investment Opportunity'}
              {grade === 'C' && 'Fair Investment Opportunity'}
              {grade === 'D' && 'Poor Investment Opportunity'}
              {grade === 'F' && 'Avoid This Investment'}
            </h4>
            <p>
              This property generates {formatCurrency(metrics.netMonthlyCashFlow)} in monthly cash flow 
              with a {formatPercentage(metrics.capRate)} cap rate and {formatPercentage(metrics.cashOnCashReturn)} cash-on-cash return.
              {metrics.cashFlowBreakEven 
                ? ' The property is cash flow positive.' 
                : ' The property has negative cash flow and may require additional capital.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};