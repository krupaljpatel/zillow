import { useState, useEffect } from 'react';
import { APIService } from '../utils/apiService';
import { APIKeyManager } from '../utils/apiKeyManager';
import { 
  PropertySearchParams, 
  PropertyAPIResponse, 
  GeocodingResponse,
  APIResponse,
  APIProvider,
  APIUsageStats
} from '../types/api';

export const useAPIService = () => {
  const [apiService] = useState(() => APIService.getInstance());
  const [apiManager] = useState(() => APIKeyManager.getInstance());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProperties = async (params: PropertySearchParams): Promise<PropertyAPIResponse[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.searchProperties(params);
      
      if (!response.success) {
        throw new Error(response.error || 'Search failed');
      }
      
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address: string): Promise<GeocodingResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.geocodeAddress(address);
      
      if (!response.success) {
        throw new Error(response.error || 'Geocoding failed');
      }
      
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Geocoding failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchProperties,
    geocodeAddress,
    loading,
    error,
    apiManager
  };
};

export const useAPIStats = () => {
  const [apiManager] = useState(() => APIKeyManager.getInstance());
  const [stats, setStats] = useState<{ provider: APIProvider; stats: APIUsageStats }[]>([]);

  const refreshStats = () => {
    const allStats = apiManager.getAllProviderStats();
    setStats(allStats);
  };

  useEffect(() => {
    refreshStats();
    
    // Refresh stats every minute
    const interval = setInterval(refreshStats, 60000);
    return () => clearInterval(interval);
  }, [apiManager]);

  const updateAPIKey = (providerId: string, newKey: string): boolean => {
    const success = apiManager.updateAPIKey(providerId, newKey);
    if (success) {
      refreshStats();
    }
    return success;
  };

  const getAvailableProviders = (type?: any) => {
    return apiManager.getAvailableProviders(type);
  };

  const resetMonthlyUsage = (providerId: string) => {
    apiManager.resetMonthlyUsage(providerId);
    refreshStats();
  };

  return {
    stats,
    refreshStats,
    updateAPIKey,
    getAvailableProviders,
    resetMonthlyUsage
  };
};