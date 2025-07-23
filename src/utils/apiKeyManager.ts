import { APIProvider, APIUsageStats, APIProviderType } from '../types/api';

export class APIKeyManager {
  private providers: Map<string, APIProvider> = new Map();
  private usageStats: Map<string, APIUsageStats> = new Map();
  private static instance: APIKeyManager;

  private constructor() {
    this.initializeProviders();
    this.loadUsageStats();
  }

  public static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  private initializeProviders(): void {
    const providers: APIProvider[] = [
      // Property Data APIs
      {
        id: 'rentcast',
        name: 'RentCast',
        apiKey: import.meta.env.VITE_RENTCAST_API_KEY || '',
        baseUrl: 'https://api.rentcast.io/v1',
        monthlyLimit: 50,
        currentUsage: 0,
        lastReset: new Date(),
        active: !!import.meta.env.VITE_RENTCAST_API_KEY,
        priority: 1,
        rateLimit: { requestsPerSecond: 1 }
      },
      {
        id: 'particle_space',
        name: 'Particle Space',
        apiKey: import.meta.env.VITE_PARTICLE_SPACE_API_KEY || '',
        baseUrl: 'https://api.particlespace.com/v1',
        monthlyLimit: 50,
        currentUsage: 0,
        lastReset: new Date(),
        active: !!import.meta.env.VITE_PARTICLE_SPACE_API_KEY,
        priority: 2,
        rateLimit: { requestsPerSecond: 1 }
      },
      {
        id: 'realtor_rapidapi',
        name: 'Realtor (RapidAPI)',
        apiKey: import.meta.env.VITE_RAPIDAPI_KEY || '',
        baseUrl: 'https://realtor.p.rapidapi.com',
        monthlyLimit: 500,
        dailyLimit: 100,
        currentUsage: 0,
        lastReset: new Date(),
        active: !!import.meta.env.VITE_RAPIDAPI_KEY,
        priority: 3,
        rateLimit: { requestsPerSecond: 2 }
      },
      
      // Geocoding APIs
      {
        id: 'google_geocoding',
        name: 'Google Geocoding',
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        baseUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        monthlyLimit: 40000, // $200 credit
        currentUsage: 0,
        lastReset: new Date(),
        active: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        priority: 1,
        rateLimit: { requestsPerSecond: 50 }
      },
      {
        id: 'mapbox_geocoding',
        name: 'Mapbox Geocoding',
        apiKey: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
        baseUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
        monthlyLimit: 100000,
        currentUsage: 0,
        lastReset: new Date(),
        active: !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
        priority: 2,
        rateLimit: { requestsPerMinute: 600 }
      },
      {
        id: 'nominatim',
        name: 'OpenStreetMap Nominatim',
        apiKey: '', // No key required
        baseUrl: 'https://nominatim.openstreetmap.org/search',
        monthlyLimit: 999999, // Unlimited but rate limited
        currentUsage: 0,
        lastReset: new Date(),
        active: true,
        priority: 3,
        rateLimit: { requestsPerSecond: 1 }
      },

      // Scraping Services
      {
        id: 'apify',
        name: 'Apify',
        apiKey: import.meta.env.VITE_APIFY_API_TOKEN || '',
        baseUrl: 'https://api.apify.com/v2',
        monthlyLimit: 2500, // $5 credit equivalent
        currentUsage: 0,
        lastReset: new Date(),
        active: !!import.meta.env.VITE_APIFY_API_TOKEN,
        priority: 1,
        rateLimit: { requestsPerSecond: 2 }
      },
      {
        id: 'scrapingbee',
        name: 'ScrapingBee',
        apiKey: import.meta.env.VITE_SCRAPINGBEE_API_KEY || '',
        baseUrl: 'https://app.scrapingbee.com/api/v1',
        monthlyLimit: 1000,
        currentUsage: 0,
        lastReset: new Date(),
        active: !!import.meta.env.VITE_SCRAPINGBEE_API_KEY,
        priority: 2,
        rateLimit: { requestsPerSecond: 1 }
      }
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
      if (!this.usageStats.has(provider.id)) {
        this.usageStats.set(provider.id, {
          providerId: provider.id,
          requestsToday: 0,
          requestsThisMonth: 0,
          lastRequestTime: new Date(0),
          errorCount: 0,
          successCount: 0
        });
      }
    });
  }

  private loadUsageStats(): void {
    try {
      const saved = localStorage.getItem('apiUsageStats');
      if (saved) {
        const stats = JSON.parse(saved) as Record<string, APIUsageStats>;
        Object.entries(stats).forEach(([id, stat]) => {
          this.usageStats.set(id, {
            ...stat,
            lastRequestTime: new Date(stat.lastRequestTime)
          });
        });
      }
    } catch (error) {
      console.error('Failed to load API usage stats:', error);
    }
  }

  private saveUsageStats(): void {
    try {
      const statsObject: Record<string, APIUsageStats> = {};
      this.usageStats.forEach((stats, id) => {
        statsObject[id] = stats;
      });
      localStorage.setItem('apiUsageStats', JSON.stringify(statsObject));
    } catch (error) {
      console.error('Failed to save API usage stats:', error);
    }
  }

  public getAvailableProviders(type?: APIProviderType): APIProvider[] {
    const allProviders = Array.from(this.providers.values());
    let filteredProviders = allProviders.filter(p => p.active && p.apiKey);

    if (type) {
      filteredProviders = this.filterByType(filteredProviders, type);
    }

    // Filter out providers that have exceeded their limits
    filteredProviders = filteredProviders.filter(provider => {
      const stats = this.usageStats.get(provider.id);
      if (!stats) return true;

      const now = new Date();
      const isNewMonth = now.getMonth() !== provider.lastReset.getMonth() || 
                        now.getFullYear() !== provider.lastReset.getFullYear();

      if (isNewMonth) {
        this.resetMonthlyUsage(provider.id);
        return true;
      }

      if (provider.dailyLimit) {
        const isNewDay = now.toDateString() !== new Date(stats.lastRequestTime).toDateString();
        if (isNewDay) {
          stats.requestsToday = 0;
        }
        if (stats.requestsToday >= provider.dailyLimit) {
          return false;
        }
      }

      return stats.requestsThisMonth < provider.monthlyLimit;
    });

    // Sort by priority (lower number = higher priority)
    return filteredProviders.sort((a, b) => a.priority - b.priority);
  }

  private filterByType(providers: APIProvider[], type: APIProviderType): APIProvider[] {
    switch (type) {
      case APIProviderType.PROPERTY_DATA:
        return providers.filter(p => ['rentcast', 'particle_space', 'realtor_rapidapi'].includes(p.id));
      case APIProviderType.GEOCODING:
        return providers.filter(p => ['google_geocoding', 'mapbox_geocoding', 'nominatim'].includes(p.id));
      case APIProviderType.SCRAPING:
        return providers.filter(p => ['apify', 'scrapingbee'].includes(p.id));
      default:
        return providers;
    }
  }

  public getNextAvailableProvider(type?: APIProviderType): APIProvider | null {
    const availableProviders = this.getAvailableProviders(type);
    return availableProviders.length > 0 ? availableProviders[0] : null;
  }

  public recordAPIUsage(providerId: string, success: boolean): void {
    const provider = this.providers.get(providerId);
    const stats = this.usageStats.get(providerId);
    
    if (!provider || !stats) return;

    const now = new Date();
    stats.lastRequestTime = now;
    stats.requestsThisMonth++;
    stats.requestsToday++;

    if (success) {
      stats.successCount++;
    } else {
      stats.errorCount++;
    }

    provider.currentUsage++;
    this.saveUsageStats();
  }

  public resetMonthlyUsage(providerId: string): void {
    const provider = this.providers.get(providerId);
    const stats = this.usageStats.get(providerId);
    
    if (!provider || !stats) return;

    provider.currentUsage = 0;
    provider.lastReset = new Date();
    stats.requestsThisMonth = 0;
    this.saveUsageStats();
  }

  public getProviderStats(providerId: string): APIUsageStats | null {
    return this.usageStats.get(providerId) || null;
  }

  public getAllProviderStats(): { provider: APIProvider; stats: APIUsageStats }[] {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      provider,
      stats: this.usageStats.get(id)!
    }));
  }

  public updateAPIKey(providerId: string, newKey: string): boolean {
    const provider = this.providers.get(providerId);
    if (!provider) return false;

    provider.apiKey = newKey;
    provider.active = !!newKey;
    return true;
  }

  public checkRateLimit(providerId: string): boolean {
    const provider = this.providers.get(providerId);
    const stats = this.usageStats.get(providerId);
    
    if (!provider || !stats || !provider.rateLimit) return true;

    const now = Date.now();
    const timeSinceLastRequest = now - stats.lastRequestTime.getTime();

    if (provider.rateLimit.requestsPerSecond) {
      const minInterval = 1000 / provider.rateLimit.requestsPerSecond;
      return timeSinceLastRequest >= minInterval;
    }

    if (provider.rateLimit.requestsPerMinute) {
      const minInterval = 60000 / provider.rateLimit.requestsPerMinute;
      return timeSinceLastRequest >= minInterval;
    }

    return true;
  }
}