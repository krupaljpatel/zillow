import React, { useState, useEffect } from 'react';
import { Property } from './types/property';
import { PropertyForm } from './components/PropertyForm';
import { PropertyCard } from './components/PropertyCard';
import { PropertyList } from './components/PropertyList';
import { InvestmentAnalysis } from './components/InvestmentAnalysis';
import './App.css';

type ViewMode = 'form' | 'list' | 'analysis';

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('form');
  const [isLoading, setIsLoading] = useState(false);

  // Load properties from localStorage on component mount
  useEffect(() => {
    try {
      const savedProperties = localStorage.getItem('investmentProperties');
      if (savedProperties) {
        const parsed = JSON.parse(savedProperties);
        const propertiesWithDates = parsed.map((p: any) => ({
          ...p,
          dateAdded: new Date(p.dateAdded)
        }));
        setProperties(propertiesWithDates);
      }
    } catch (error) {
      console.error('Failed to load properties from localStorage:', error);
    }
  }, []);

  // Save properties to localStorage whenever properties change
  useEffect(() => {
    try {
      localStorage.setItem('investmentProperties', JSON.stringify(properties));
    } catch (error) {
      console.error('Failed to save properties to localStorage:', error);
    }
  }, [properties]);

  const handlePropertySubmit = (property: Property) => {
    setIsLoading(true);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      setProperties(prev => [property, ...prev]);
      setSelectedProperty(property);
      setCurrentView('analysis');
      setIsLoading(false);
    }, 500);
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView('analysis');
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    if (view === 'form') {
      setSelectedProperty(null);
    }
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    if (selectedProperty && selectedProperty.id === propertyId) {
      setSelectedProperty(null);
      setCurrentView('list');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Zillow Investment Analyzer</h1>
          <p>Analyze rental property investments with comprehensive financial metrics</p>
        </div>
        
        <nav className="app-nav">
          <button 
            className={`nav-button ${currentView === 'form' ? 'active' : ''}`}
            onClick={() => handleViewChange('form')}
          >
            Add Property
          </button>
          <button 
            className={`nav-button ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => handleViewChange('list')}
          >
            Properties ({properties.length})
          </button>
          {selectedProperty && (
            <button 
              className={`nav-button ${currentView === 'analysis' ? 'active' : ''}`}
              onClick={() => handleViewChange('analysis')}
            >
              Analysis
            </button>
          )}
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'form' && (
          <div className="view-container">
            <PropertyForm 
              onSubmit={handlePropertySubmit}
              isLoading={isLoading}
            />
          </div>
        )}

        {currentView === 'list' && (
          <div className="view-container">
            <PropertyList 
              properties={properties}
              onPropertySelect={handlePropertySelect}
            />
          </div>
        )}

        {currentView === 'analysis' && selectedProperty && (
          <div className="view-container">
            <div className="analysis-header">
              <button 
                className="back-button"
                onClick={() => setCurrentView('list')}
              >
                ← Back to Properties
              </button>
              <button 
                className="delete-button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this property?')) {
                    deleteProperty(selectedProperty.id);
                  }
                }}
              >
                Delete Property
              </button>
            </div>
            
            <InvestmentAnalysis 
              property={selectedProperty}
              showAdvanced={true}
            />
          </div>
        )}

        {properties.length === 0 && currentView === 'list' && (
          <div className="empty-state">
            <h2>No Properties Yet</h2>
            <p>Add your first investment property to get started with the analysis.</p>
            <button 
              className="btn-primary"
              onClick={() => handleViewChange('form')}
            >
              Add Your First Property
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Built with comprehensive investment analysis tools</p>
          <div className="footer-features">
            <span>✓ Cap Rate Analysis</span>
            <span>✓ Cash Flow Calculations</span>
            <span>✓ ROI Metrics</span>
            <span>✓ Multi-API Property Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;