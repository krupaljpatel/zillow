import { APIKeyManager } from './apiKeyManager';
import { 
  APIResponse, 
  PropertySearchParams, 
  PropertyAPIResponse, 
  GeocodingResponse,
  APIProviderType 
} from '../types/api';

export class APIService {
  private apiManager: APIKeyManager;
  private static instance: APIService;

  private constructor() {
    this.apiManager = APIKeyManager.getInstance();
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  /**
   * Round-robin property search across multiple providers
   */
  public async searchProperties(params: PropertySearchParams): Promise<APIResponse<PropertyAPIResponse[]>> {
    const providers = this.apiManager.getAvailableProviders(APIProviderType.PROPERTY_DATA);
    
    for (const provider of providers) {
      if (!this.apiManager.checkRateLimit(provider.id)) {
        continue; // Skip if rate limited
      }

      try {
        let result: PropertyAPIResponse[] = [];

        switch (provider.id) {
          case 'rentcast':
            result = await this.searchRentCast(params, provider.apiKey);
            break;
          case 'particle_space':
            result = await this.searchParticleSpace(params, provider.apiKey);
            break;
          case 'realtor_rapidapi':
            result = await this.searchRealtorAPI(params, provider.apiKey);
            break;
          default:
            continue;
        }

        this.apiManager.recordAPIUsage(provider.id, true);
        
        return {
          success: true,
          data: result,
          provider: provider.name,
          remainingQuota: provider.monthlyLimit - provider.currentUsage
        };

      } catch (error) {
        console.error(`Error with ${provider.name}:`, error);
        this.apiManager.recordAPIUsage(provider.id, false);
        
        // Continue to next provider
        continue;
      }
    }

    return {
      success: false,
      error: 'All property data providers exhausted or unavailable',
      provider: 'none'
    };
  }

  /**
   * Round-robin geocoding across multiple providers
   */
  public async geocodeAddress(address: string): Promise<APIResponse<GeocodingResponse>> {
    const providers = this.apiManager.getAvailableProviders(APIProviderType.GEOCODING);
    
    for (const provider of providers) {
      if (!this.apiManager.checkRateLimit(provider.id)) {
        continue; // Skip if rate limited
      }

      try {
        let result: GeocodingResponse;

        switch (provider.id) {
          case 'google_geocoding':
            result = await this.geocodeGoogle(address, provider.apiKey);
            break;
          case 'mapbox_geocoding':
            result = await this.geocodeMapbox(address, provider.apiKey);
            break;
          case 'nominatim':
            result = await this.geocodeNominatim(address);
            break;
          default:
            continue;
        }

        this.apiManager.recordAPIUsage(provider.id, true);
        
        return {
          success: true,
          data: result,
          provider: provider.name,
          remainingQuota: provider.monthlyLimit - provider.currentUsage
        };

      } catch (error) {
        console.error(`Error with ${provider.name}:`, error);
        this.apiManager.recordAPIUsage(provider.id, false);
        
        // Continue to next provider
        continue;
      }
    }

    return {
      success: false,
      error: 'All geocoding providers exhausted or unavailable',
      provider: 'none'
    };
  }

  // RentCast API implementation
  private async searchRentCast(params: PropertySearchParams, apiKey: string): Promise<PropertyAPIResponse[]> {
    const searchParams = new URLSearchParams();
    
    if (params.address) searchParams.append('address', params.address);
    if (params.city) searchParams.append('city', params.city);
    if (params.state) searchParams.append('state', params.state);
    if (params.zipCode) searchParams.append('zipCode', params.zipCode);

    const response = await fetch(`https://api.rentcast.io/v1/listings?${searchParams}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`RentCast API error: ${response.status}`);
    }

    const data = await response.json();
    
    return this.normalizeRentCastResponse(data);
  }

  // Particle Space API implementation
  private async searchParticleSpace(params: PropertySearchParams, apiKey: string): Promise<PropertyAPIResponse[]> {
    const searchParams = new URLSearchParams();
    
    if (params.address) searchParams.append('address', params.address);
    if (params.city) searchParams.append('city', params.city);
    if (params.state) searchParams.append('state', params.state);

    const response = await fetch(`https://api.particlespace.com/v1/property/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Particle Space API error: ${response.status}`);
    }

    const data = await response.json();
    
    return this.normalizeParticleSpaceResponse(data);
  }

  // RapidAPI Realtor implementation
  private async searchRealtorAPI(params: PropertySearchParams, apiKey: string): Promise<PropertyAPIResponse[]> {
    const searchParams = {
      city: params.city,
      state_code: params.state,
      limit: 20,
      offset: 0
    };

    const response = await fetch('https://realtor.p.rapidapi.com/properties/v2/list-for-sale', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'realtor.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      throw new Error(`Realtor API error: ${response.status}`);
    }

    const data = await response.json();
    
    return this.normalizeRealtorResponse(data);
  }

  // Google Geocoding implementation
  private async geocodeGoogle(address: string, apiKey: string): Promise<GeocodingResponse> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`Google Geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      addressComponents: this.parseGoogleAddressComponents(result.address_components)
    };
  }

  // Mapbox Geocoding implementation
  private async geocodeMapbox(address: string, apiKey: string): Promise<GeocodingResponse> {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Mapbox Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.features.length) {
      throw new Error('Mapbox Geocoding: No results found');
    }

    const result = data.features[0];
    
    return {
      lat: result.center[1],
      lng: result.center[0],
      formattedAddress: result.place_name,
      addressComponents: this.parseMapboxAddressComponents(result.context)
    };
  }

  // Nominatim (OpenStreetMap) implementation
  private async geocodeNominatim(address: string): Promise<GeocodingResponse> {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.length) {
      throw new Error('Nominatim: No results found');
    }

    const result = data[0];
    
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      formattedAddress: result.display_name,
      addressComponents: this.parseNominatimAddressComponents(result.address)
    };
  }

  // Response normalizers
  private normalizeRentCastResponse(data: any): PropertyAPIResponse[] {
    if (!data.properties) return [];
    
    return data.properties.map((property: any) => ({
      id: property.id || `rentcast_${Date.now()}_${Math.random()}`,
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      zipCode: property.zipCode || '',
      price: property.price || property.listPrice,
      rentEstimate: property.rentEstimate,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.squareFeet,
      propertyType: property.propertyType,
      yearBuilt: property.yearBuilt,
      images: property.photos || [],
      source: 'RentCast',
      lastUpdated: new Date()
    }));
  }

  private normalizeParticleSpaceResponse(data: any): PropertyAPIResponse[] {
    if (!data.results) return [];
    
    return data.results.map((property: any) => ({
      id: property.propertyId || `particle_${Date.now()}_${Math.random()}`,
      address: property.address?.full || '',
      city: property.address?.city || '',
      state: property.address?.state || '',
      zipCode: property.address?.zipCode || '',
      price: property.valuation?.value,
      rentEstimate: property.rental?.estimate,
      bedrooms: property.building?.bedrooms,
      bathrooms: property.building?.bathrooms,
      squareFeet: property.building?.size,
      propertyType: property.building?.type,
      yearBuilt: property.building?.yearBuilt,
      source: 'Particle Space',
      lastUpdated: new Date()
    }));
  }

  private normalizeRealtorResponse(data: any): PropertyAPIResponse[] {
    if (!data.properties) return [];
    
    return data.properties.map((property: any) => ({
      id: property.property_id || `realtor_${Date.now()}_${Math.random()}`,
      address: `${property.address?.line} ${property.address?.line2 || ''}`.trim(),
      city: property.address?.city || '',
      state: property.address?.state_code || '',
      zipCode: property.address?.postal_code || '',
      price: property.price,
      bedrooms: property.beds,
      bathrooms: property.baths,
      squareFeet: property.building_size?.size,
      propertyType: property.prop_type,
      yearBuilt: property.year_built,
      images: property.photos?.map((photo: any) => photo.href) || [],
      listingUrl: property.rdc_web_url,
      source: 'Realtor.com',
      lastUpdated: new Date()
    }));
  }

  // Address component parsers
  private parseGoogleAddressComponents(components: any[]): any {
    const result: any = {};
    
    components.forEach(component => {
      const types = component.types;
      if (types.includes('street_number') || types.includes('route')) {
        result.street = (result.street || '') + ' ' + component.long_name;
      }
      if (types.includes('locality')) result.city = component.long_name;
      if (types.includes('administrative_area_level_1')) result.state = component.short_name;
      if (types.includes('postal_code')) result.zipCode = component.long_name;
      if (types.includes('country')) result.country = component.long_name;
    });
    
    return result;
  }

  private parseMapboxAddressComponents(context: any[]): any {
    const result: any = {};
    
    if (context) {
      context.forEach(item => {
        if (item.id.includes('place')) result.city = item.text;
        if (item.id.includes('region')) result.state = item.short_code?.replace('US-', '');
        if (item.id.includes('postcode')) result.zipCode = item.text;
        if (item.id.includes('country')) result.country = item.text;
      });
    }
    
    return result;
  }

  private parseNominatimAddressComponents(address: any): any {
    return {
      street: [address.house_number, address.road].filter(Boolean).join(' '),
      city: address.city || address.town || address.village,
      state: address.state,
      zipCode: address.postcode,
      country: address.country
    };
  }
}