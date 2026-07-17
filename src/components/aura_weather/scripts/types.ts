export type WeatherState = 'storm' | 'sunny' | 'fog' | 'rain' | 'snow' | 'clear';

export interface WeatherTheme {
  gradient: [string, string, string, string];
  particleType: 'rain' | 'snow' | 'none';
  particleDensity: number;
  overlayOpacity: number;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  border: string;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  isDay: boolean;
  state: WeatherState;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  admin1?: string;
}

export interface MapCamera {
  center: { lng: number; lat: number };
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface ParticleConfig {
  count: number;
  speed: number;
  windInfluence: number;
  gravity: number;
  sizeRange: [number, number];
  opacityRange: [number, number];
}
