import type { WeatherData, WeatherState, GeoLocation } from './types';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getWeatherState(code: number, isDay: boolean): WeatherState {
  if (code >= 95) return 'storm';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 1 && code <= 3) return isDay ? 'sunny' : 'clear';
  return 'clear';
}

function getCacheKey(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * 10) / 10;
  const roundedLng = Math.round(lng * 10) / 10;
  return `${roundedLat},${roundedLng}`;
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const cacheKey = getCacheKey(lat, lng);
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'is_day',
    ].join(','),
    timezone: 'auto',
  });

  const response = await fetch(`${WEATHER_API}?${params}`);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const json = await response.json();
  const current = json.current;

  const weatherData: WeatherData = {
    temperature: Math.round(current.temperature_2m),
    apparentTemperature: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
    cloudCover: current.cloud_cover,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    precipitation: current.precipitation,
    isDay: current.is_day === 1,
    state: getWeatherState(current.weather_code, current.is_day === 1),
  };

  weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

  return weatherData;
}

export async function searchCities(
  query: string,
  count: number = 5
): Promise<GeoLocation[]> {
  if (query.length < 2) return [];

  const params = new URLSearchParams({
    name: query,
    count: count.toString(),
    language: 'es',
    format: 'json',
  });

  const response = await fetch(`${GEOCODING_API}?${params}`);

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }

  const json = await response.json();

  if (!json.results) return [];

  return json.results.map((result: any) => ({
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country || '',
    admin1: result.admin1 || '',
  }));
}

const locationCache = new Map<string, GeoLocation>();

export async function reverseGeocode(lat: number, lng: number): Promise<GeoLocation> {
  const cacheKey = `${Math.round(lat * 10) / 10},${Math.round(lng * 10) / 10}`;

  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es&zoom=10`
    );

    if (!response.ok) {
      return { latitude: lat, longitude: lng, name: 'Ubicación desconocida', country: '' };
    }

    const data = await response.json();
    const address = data.address || {};

    const location: GeoLocation = {
      latitude: lat,
      longitude: lng,
      name: address.city || address.town || address.village || address.municipality || address.county || 'Ubicación',
      country: address.country || '',
      admin1: address.state || '',
    };

    locationCache.set(cacheKey, location);
    return location;
  } catch {
    return { latitude: lat, longitude: lng, name: 'Ubicación', country: '' };
  }
}

export function getWindDirectionLabel(direction: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(direction / 45) % 8;
  return directions[index];
}

export function getWeatherDescription(code: number, language: 'es' | 'en' = 'es'): string {
  const descriptions: Record<number, { es: string; en: string }> = {
    0: { es: 'Despejado', en: 'Clear' },
    1: { es: 'Principalmente despejado', en: 'Mainly clear' },
    2: { es: 'Parcialmente nublado', en: 'Partly cloudy' },
    3: { es: 'Nublado', en: 'Overcast' },
    45: { es: 'Niebla', en: 'Fog' },
    48: { es: 'Niebla con escarcha', en: 'Depositing rime fog' },
    51: { es: 'Lluvia ligera', en: 'Light drizzle' },
    53: { es: 'Lluvia moderada', en: 'Moderate drizzle' },
    55: { es: 'Lluvia densa', en: 'Dense drizzle' },
    61: { es: 'Lluvia leve', en: 'Slight rain' },
    63: { es: 'Lluvia moderada', en: 'Moderate rain' },
    65: { es: 'Lluvia fuerte', en: 'Heavy rain' },
    71: { es: 'Nieve leve', en: 'Slight snow' },
    73: { es: 'Nieve moderada', en: 'Moderate snow' },
    75: { es: 'Nieve fuerte', en: 'Heavy snow' },
    80: { es: 'Chubascos leves', en: 'Slight rain showers' },
    81: { es: 'Chubascos moderados', en: 'Moderate rain showers' },
    82: { es: 'Chubascos fuertes', en: 'Violent rain showers' },
    85: { es: 'Chubascos de nieve', en: 'Slight snow showers' },
    86: { es: 'Chubascos de nieve fuertes', en: 'Heavy snow showers' },
    95: { es: 'Tormenta', en: 'Thunderstorm' },
    96: { es: 'Tormenta con granizo', en: 'Thunderstorm with hail' },
    99: { es: 'Tormenta fuerte con granizo', en: 'Thunderstorm with heavy hail' },
  };

  return descriptions[code]?.[language] || (language === 'es' ? 'Desconocido' : 'Unknown');
}
