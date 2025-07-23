import React, { useState, useMemo } from 'react';
import { Property, PropertyFilters } from '../types/property';
import { PropertyCard } from './PropertyCard';
import { calculateInvestmentMetrics } from '../utils/investmentCalculator';

interface PropertyListProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  showFilters?: boolean;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onPropertySelect,
  showFilters = true
}) => {
  const [filters, setFilters] = useState<PropertyFilters>({
    minPrice: undefined,
    maxPrice: undefined,
    minRent: undefined,
    maxRent: undefined,
    propertyType: undefined,
    minCapRate: undefined,
    minCashFlow: undefined,
    state: '',
    city: ''
  });

  const [sortBy, setSortBy] = useState<'price' | 'rent' | 'capRate' | 'cashFlow' | 'dateAdded'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      // Price filters
      if (filters.minPrice && property.purchasePrice < filters.minPrice) return false;
      if (filters.maxPrice && property.purchasePrice > filters.maxPrice) return false;
      
      // Rent filters
      if (filters.minRent && property.monthlyRent < filters.minRent) return false;
      if (filters.maxRent && property.monthlyRent > filters.maxRent) return false;
      
      // Property type filter
      if (filters.propertyType && filters.propertyType.length > 0 && !filters.propertyType.includes(property.propertyType)) {
        return false;
      }
      
      // Location filters
      if (filters.state && property.state.toLowerCase() !== filters.state.toLowerCase()) return false;
      if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      
      // Investment metric filters
      if (filters.minCapRate || filters.minCashFlow) {
        const metrics = calculateInvestmentMetrics(property);
        if (filters.minCapRate && metrics.capRate < filters.minCapRate) return false;
        if (filters.minCashFlow && metrics.netMonthlyCashFlow < filters.minCashFlow) return false;
      }
      
      return true;
    });

    // Sort properties
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'price':
          aValue = a.purchasePrice;
          bValue = b.purchasePrice;
          break;
        case 'rent':
          aValue = a.monthlyRent;
          bValue = b.monthlyRent;
          break;
        case 'capRate':
          aValue = calculateInvestmentMetrics(a).capRate;
          bValue = calculateInvestmentMetrics(b).capRate;
          break;
        case 'cashFlow':
          aValue = calculateInvestmentMetrics(a).netMonthlyCashFlow;
          bValue = calculateInvestmentMetrics(b).netMonthlyCashFlow;
          break;
        case 'dateAdded':
        default:
          aValue = a.dateAdded.getTime();
          bValue = b.dateAdded.getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [properties, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      minRent: undefined,
      maxRent: undefined,
      propertyType: undefined,
      minCapRate: undefined,
      minCashFlow: undefined,
      state: '',
      city: ''
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="property-list">
      <div className="list-header">
        <h2>Properties ({filteredAndSortedProperties.length})</h2>
        
        <div className="list-controls">
          <div className="sort-controls">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="dateAdded">Date Added</option>
              <option value="price">Price</option>
              <option value="rent">Rent</option>
              <option value="capRate">Cap Rate</option>
              <option value="cashFlow">Cash Flow</option>
            </select>
            
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="filters-section">
          <h3>Filters</h3>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>Price Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Rent Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min Rent"
                  value={filters.minRent || ''}
                  onChange={(e) => handleFilterChange('minRent', e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max Rent"
                  value={filters.maxRent || ''}
                  onChange={(e) => handleFilterChange('maxRent', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Property Type</label>
              <div className="checkbox-group">
                {['single-family', 'condo', 'townhouse', 'multi-family'].map(type => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.propertyType?.includes(type as Property['propertyType']) || false}
                      onChange={(e) => {
                        const currentTypes = filters.propertyType || [];
                        if (e.target.checked) {
                          handleFilterChange('propertyType', [...currentTypes, type as Property['propertyType']]);
                        } else {
                          handleFilterChange('propertyType', currentTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    {type.replace('-', ' ')}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <div className="location-inputs">
                <input
                  type="text"
                  placeholder="State (e.g., MA)"
                  value={filters.state || ''}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Investment Metrics</label>
              <div className="metric-inputs">
                <input
                  type="number"
                  placeholder="Min Cap Rate (%)"
                  step="0.1"
                  value={filters.minCapRate || ''}
                  onChange={(e) => handleFilterChange('minCapRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <input
                  type="number"
                  placeholder="Min Cash Flow ($)"
                  value={filters.minCashFlow || ''}
                  onChange={(e) => handleFilterChange('minCashFlow', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button 
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="properties-grid">
        {filteredAndSortedProperties.length === 0 ? (
          <div className="no-properties">
            <h3>No properties found</h3>
            <p>
              {properties.length === 0 
                ? 'Add your first property to get started.' 
                : 'Try adjusting your filters or add more properties.'}
            </p>
          </div>
        ) : (
          filteredAndSortedProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => onPropertySelect?.(property)}
            />
          ))
        )}
      </div>

      {filteredAndSortedProperties.length > 0 && (
        <div className="list-summary">
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Average Price:</span>
              <span className="stat-value">
                {formatCurrency(
                  filteredAndSortedProperties.reduce((sum, p) => sum + p.purchasePrice, 0) / 
                  filteredAndSortedProperties.length
                )}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Average Rent:</span>
              <span className="stat-value">
                {formatCurrency(
                  filteredAndSortedProperties.reduce((sum, p) => sum + p.monthlyRent, 0) / 
                  filteredAndSortedProperties.length
                )}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Average Cap Rate:</span>
              <span className="stat-value">
                {(
                  filteredAndSortedProperties.reduce((sum, p) => sum + calculateInvestmentMetrics(p).capRate, 0) / 
                  filteredAndSortedProperties.length
                ).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};