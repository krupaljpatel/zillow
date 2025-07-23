import React from 'react';
import { Property, InvestmentMetrics } from '../types/property';
import { calculateInvestmentMetrics, getInvestmentGrade } from '../utils/investmentCalculator';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  showFullDetails?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onClick,
  showFullDetails = false 
}) => {
  const metrics = calculateInvestmentMetrics(property);
  const grade = getInvestmentGrade(metrics);

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
      case 'A': return '#22c55e'; // green
      case 'B': return '#3b82f6'; // blue
      case 'C': return '#f59e0b'; // amber
      case 'D': return '#f97316'; // orange
      case 'F': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getCashFlowColor = (cashFlow: number): string => {
    if (cashFlow > 500) return '#22c55e'; // green
    if (cashFlow > 200) return '#3b82f6'; // blue
    if (cashFlow >= 0) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div 
      className={`property-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="property-header">
        <div className="property-title">
          <h3>{property.address}</h3>
          <p className="property-location">
            {property.city}, {property.state} {property.zipCode}
          </p>
        </div>
        
        <div className="investment-grade" style={{ backgroundColor: getGradeColor(grade) }}>
          {grade}
        </div>
      </div>

      <div className="property-basics">
        <div className="property-details">
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
          {property.squareFeet && <span>{property.squareFeet.toLocaleString()} sqft</span>}
          <span className="property-type">{property.propertyType}</span>
        </div>
        
        <div className="property-price">
          <span className="price">{formatCurrency(property.purchasePrice)}</span>
          <span className="rent">Rent: {formatCurrency(property.monthlyRent)}/mo</span>
        </div>
      </div>

      <div className="investment-metrics">
        <div className="metrics-grid">
          <div className="metric">
            <span className="metric-label">Cap Rate</span>
            <span className="metric-value">{formatPercentage(metrics.capRate)}</span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Cash Flow</span>
            <span 
              className="metric-value"
              style={{ color: getCashFlowColor(metrics.netMonthlyCashFlow) }}
            >
              {formatCurrency(metrics.netMonthlyCashFlow)}/mo
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Cash-on-Cash</span>
            <span className="metric-value">{formatPercentage(metrics.cashOnCashReturn)}</span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Total ROI</span>
            <span className="metric-value">{formatPercentage(metrics.totalROI)}</span>
          </div>
        </div>

        {showFullDetails && (
          <div className="detailed-metrics">
            <div className="metrics-section">
              <h4>Monthly Analysis</h4>
              <div className="metric-row">
                <span>Mortgage Payment:</span>
                <span>{formatCurrency(metrics.monthlyMortgagePayment)}</span>
              </div>
              <div className="metric-row">
                <span>Operating Expenses:</span>
                <span>{formatCurrency(metrics.monthlyOperatingExpenses)}</span>
              </div>
              <div className="metric-row">
                <span>Net Cash Flow:</span>
                <span style={{ color: getCashFlowColor(metrics.netMonthlyCashFlow) }}>
                  {formatCurrency(metrics.netMonthlyCashFlow)}
                </span>
              </div>
            </div>

            <div className="metrics-section">
              <h4>Annual Analysis</h4>
              <div className="metric-row">
                <span>Gross Rent:</span>
                <span>{formatCurrency(metrics.annualGrossRent)}</span>
              </div>
              <div className="metric-row">
                <span>Net Operating Income:</span>
                <span>{formatCurrency(metrics.annualNetOperatingIncome)}</span>
              </div>
              <div className="metric-row">
                <span>Annual Cash Flow:</span>
                <span>{formatCurrency(metrics.annualCashFlow)}</span>
              </div>
            </div>

            <div className="metrics-section">
              <h4>Break-Even Analysis</h4>
              <div className="metric-row">
                <span>Break-Even Rent:</span>
                <span>{formatCurrency(metrics.breakEvenRent)}</span>
              </div>
              <div className="metric-row">
                <span>Status:</span>
                <span style={{ color: metrics.cashFlowBreakEven ? '#22c55e' : '#ef4444' }}>
                  {metrics.cashFlowBreakEven ? 'Profitable' : 'Loss'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="property-footer">
        {property.zillowUrl && (
          <a 
            href={property.zillowUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="external-link"
            onClick={(e) => e.stopPropagation()}
          >
            View on Zillow
          </a>
        )}
        
        {property.realtorUrl && (
          <a 
            href={property.realtorUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="external-link"
            onClick={(e) => e.stopPropagation()}
          >
            View on Realtor.com
          </a>
        )}
        
        <span className="date-added">
          Added: {property.dateAdded.toLocaleDateString()}
        </span>
      </div>

      {property.notes && (
        <div className="property-notes">
          <p>{property.notes}</p>
        </div>
      )}
    </div>
  );
};