import React, { useState } from 'react';
import { Property } from '../types/property';

interface PropertyFormProps {
  onSubmit: (property: Property) => void;
  initialData?: Partial<Property>;
  isLoading?: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'single-family',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    yearBuilt: 2000,
    purchasePrice: 300000,
    marketValue: 300000,
    monthlyRent: 2000,
    downPayment: 60000,
    interestRate: 7.0,
    loanTermYears: 30,
    monthlyPropertyTax: 400,
    monthlyInsurance: 150,
    monthlyHOA: 0,
    maintenancePercentage: 5,
    vacancyRate: 5,
    propertyManagementPercentage: 0,
    zillowUrl: '',
    realtorUrl: '',
    notes: '',
    ...initialData
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate loan amount
    const loanAmount = Math.max(0, (formData.purchasePrice || 0) - (formData.downPayment || 0));
    
    const property: Property = {
      id: `property_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      zipCode: formData.zipCode || '',
      propertyType: formData.propertyType as Property['propertyType'] || 'single-family',
      bedrooms: formData.bedrooms || 0,
      bathrooms: formData.bathrooms || 0,
      squareFeet: formData.squareFeet,
      yearBuilt: formData.yearBuilt,
      lotSize: formData.lotSize,
      purchasePrice: formData.purchasePrice || 0,
      marketValue: formData.marketValue || formData.purchasePrice || 0,
      monthlyRent: formData.monthlyRent || 0,
      downPayment: formData.downPayment || 0,
      loanAmount,
      interestRate: formData.interestRate || 0,
      loanTermYears: formData.loanTermYears || 30,
      monthlyPropertyTax: formData.monthlyPropertyTax || 0,
      monthlyInsurance: formData.monthlyInsurance || 0,
      monthlyHOA: formData.monthlyHOA || 0,
      maintenancePercentage: formData.maintenancePercentage || 5,
      vacancyRate: formData.vacancyRate || 5,
      propertyManagementPercentage: formData.propertyManagementPercentage || 0,
      zillowUrl: formData.zillowUrl,
      realtorUrl: formData.realtorUrl,
      dateAdded: new Date(),
      notes: formData.notes
    };
    
    onSubmit(property);
  };

  return (
    <div className="property-form">
      <h2>Property Investment Analysis</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        
        {/* Property Details Section */}
        <div className="form-section">
          <h3>Property Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="123 Main St"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Boston"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="MA"
                maxLength={2}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zipCode">Zip Code *</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                placeholder="02126"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="propertyType">Property Type</label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
              >
                <option value="single-family">Single Family</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="multi-family">Multi-Family</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="yearBuilt">Year Built</label>
              <input
                type="number"
                id="yearBuilt"
                name="yearBuilt"
                value={formData.yearBuilt || ''}
                onChange={handleChange}
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms || ''}
                onChange={handleChange}
                min="0"
                max="20"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="bathrooms">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms || ''}
                onChange={handleChange}
                min="0"
                max="20"
                step="0.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="squareFeet">Square Feet</label>
              <input
                type="number"
                id="squareFeet"
                name="squareFeet"
                value={formData.squareFeet || ''}
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lotSize">Lot Size (sq ft)</label>
              <input
                type="number"
                id="lotSize"
                name="lotSize"
                value={formData.lotSize || ''}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="form-section">
          <h3>Financial Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchasePrice">Purchase Price *</label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice || ''}
                onChange={handleChange}
                required
                min="0"
                step="1000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="marketValue">Current Market Value</label>
              <input
                type="number"
                id="marketValue"
                name="marketValue"
                value={formData.marketValue || ''}
                onChange={handleChange}
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="monthlyRent">Monthly Rent *</label>
              <input
                type="number"
                id="monthlyRent"
                name="monthlyRent"
                value={formData.monthlyRent || ''}
                onChange={handleChange}
                required
                min="0"
                step="50"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="downPayment">Down Payment *</label>
              <input
                type="number"
                id="downPayment"
                name="downPayment"
                value={formData.downPayment || ''}
                onChange={handleChange}
                required
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Loan Details Section */}
        <div className="form-section">
          <h3>Loan Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="interestRate">Interest Rate (%)</label>
              <input
                type="number"
                id="interestRate"
                name="interestRate"
                value={formData.interestRate || ''}
                onChange={handleChange}
                min="0"
                max="20"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="loanTermYears">Loan Term (years)</label>
              <input
                type="number"
                id="loanTermYears"
                name="loanTermYears"
                value={formData.loanTermYears || ''}
                onChange={handleChange}
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Operating Expenses Section */}
        <div className="form-section">
          <h3>Operating Expenses</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="monthlyPropertyTax">Monthly Property Tax</label>
              <input
                type="number"
                id="monthlyPropertyTax"
                name="monthlyPropertyTax"
                value={formData.monthlyPropertyTax || ''}
                onChange={handleChange}
                min="0"
                step="10"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="monthlyInsurance">Monthly Insurance</label>
              <input
                type="number"
                id="monthlyInsurance"
                name="monthlyInsurance"
                value={formData.monthlyInsurance || ''}
                onChange={handleChange}
                min="0"
                step="10"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="monthlyHOA">Monthly HOA</label>
              <input
                type="number"
                id="monthlyHOA"
                name="monthlyHOA"
                value={formData.monthlyHOA || ''}
                onChange={handleChange}
                min="0"
                step="10"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="maintenancePercentage">Maintenance (% of rent)</label>
              <input
                type="number"
                id="maintenancePercentage"
                name="maintenancePercentage"
                value={formData.maintenancePercentage || ''}
                onChange={handleChange}
                min="0"
                max="50"
                step="0.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vacancyRate">Vacancy Rate (%)</label>
              <input
                type="number"
                id="vacancyRate"
                name="vacancyRate"
                value={formData.vacancyRate || ''}
                onChange={handleChange}
                min="0"
                max="50"
                step="0.5"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="propertyManagementPercentage">Property Management (% of rent)</label>
              <input
                type="number"
                id="propertyManagementPercentage"
                name="propertyManagementPercentage"
                value={formData.propertyManagementPercentage || ''}
                onChange={handleChange}
                min="0"
                max="20"
                step="0.5"
              />
            </div>
          </div>
        </div>

        {/* External Links Section */}
        <div className="form-section">
          <h3>External Links (Optional)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="zillowUrl">Zillow URL</label>
              <input
                type="url"
                id="zillowUrl"
                name="zillowUrl"
                value={formData.zillowUrl || ''}
                onChange={handleChange}
                placeholder="https://www.zillow.com/homedetails/..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="realtorUrl">Realtor.com URL</label>
              <input
                type="url"
                id="realtorUrl"
                name="realtorUrl"
                value={formData.realtorUrl || ''}
                onChange={handleChange}
                placeholder="https://www.realtor.com/realestateandhomes-detail/..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes about this property..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Analyzing...' : 'Analyze Property'}
          </button>
        </div>
      </form>
    </div>
  );
};