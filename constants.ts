import { ServerNode } from './types';

// Helper to distribute points on sphere roughly matching continents (simplified)
export const SERVERS: ServerNode[] = [
  { id: 'us-ny', city: 'New York', country: 'United States', countryCode: 'US', region: 'NA', lat: 40.7128, lng: -74.0060, load: 45, latency: 24, tags: ['streaming', 'general'] },
  { id: 'us-la', city: 'Los Angeles', country: 'United States', countryCode: 'US', region: 'NA', lat: 34.0522, lng: -118.2437, load: 62, latency: 35, tags: ['streaming', 'gaming'] },
  { id: 'uk-lon', city: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'EU', lat: 51.5074, lng: -0.1278, load: 78, latency: 12, tags: ['bbc', 'streaming'] },
  { id: 'de-ber', city: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'EU', lat: 52.5200, lng: 13.4050, load: 34, latency: 18, tags: ['privacy', 'p2p'] },
  { id: 'jp-tok', city: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'AS', lat: 35.6762, lng: 139.6503, load: 55, latency: 45, tags: ['anime', 'gaming'] },
  { id: 'sg-sin', city: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'AS', lat: 1.3521, lng: 103.8198, load: 22, latency: 50, tags: ['gaming', 'asia-hub'] },
  { id: 'au-syd', city: 'Sydney', country: 'Australia', countryCode: 'AU', region: 'OC', lat: -33.8688, lng: 151.2093, load: 40, latency: 60, tags: ['general'] },
  { id: 'br-sao', city: 'São Paulo', country: 'Brazil', countryCode: 'BR', region: 'SA', lat: -23.5505, lng: -46.6333, load: 67, latency: 70, tags: ['sports'] },
  { id: 'ca-tor', city: 'Toronto', country: 'Canada', countryCode: 'CA', region: 'NA', lat: 43.6532, lng: -79.3832, load: 30, latency: 28, tags: ['general'] },
  { id: 'ch-zur', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', region: 'EU', lat: 47.3769, lng: 8.5417, load: 15, latency: 20, tags: ['privacy', 'banking'] },
  { id: 'fr-par', city: 'Paris', country: 'France', countryCode: 'FR', region: 'EU', lat: 48.8566, lng: 2.3522, load: 42, latency: 15, tags: ['streaming'] },
  { id: 'in-mum', city: 'Mumbai', country: 'India', countryCode: 'IN', region: 'AS', lat: 19.0760, lng: 72.8777, load: 80, latency: 55, tags: ['general'] },
];

export const MOCK_USER_LOCATION = {
  lat: 25.2048, // Dubai (example starting point)
  lng: 55.2708
};
