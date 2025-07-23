export interface APIProvider {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  monthlyLimit: number;
  dailyLimit?: number;
  currentUsage: number;
  lastReset: Date;
  active: boolean;
  priority: number; // Lower number = higher priority
  rateLimit?: {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
  };
}

export interface APIUsageStats {
  providerId: string;
  requestsToday: number;
  requestsThisMonth: number;
  lastRequestTime: Date;
  errorCount: number;
  successCount: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
  remainingQuota?: number;
  rateLimitReset?: Date;
}

export interface PropertySearchParams {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
}

export interface PropertyAPIResponse {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price?: number;
  rentEstimate?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  propertyType?: string;
  yearBuilt?: number;
  lotSize?: number;
  images?: string[];
  description?: string;
  listingUrl?: string;
  source: string;
  lastUpdated: Date;
}

export interface GeocodingResponse {
  lat: number;
  lng: number;
  formattedAddress: string;
  addressComponents: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export enum APIProviderType {
  PROPERTY_DATA = 'property_data',
  GEOCODING = 'geocoding',
  MARKET_DATA = 'market_data',
  SCRAPING = 'scraping'
}