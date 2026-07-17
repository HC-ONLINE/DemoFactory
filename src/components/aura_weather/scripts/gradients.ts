import type { WeatherState, WeatherTheme } from './types';

export const WEATHER_THEMES: Record<WeatherState, WeatherTheme> = {
  storm: {
    gradient: ['#1a0a2e', '#2d1b4e', '#4a2c7a', '#1e3a5f'],
    particleType: 'rain',
    particleDensity: 1.0,
    overlayOpacity: 0.8,
    textPrimary: '#e9d5ff',
    textSecondary: '#c4b5fd',
    textMuted: '#a78bfa',
    background: 'rgba(26, 10, 46, 0.6)',
    border: 'rgba(167, 139, 250, 0.3)',
  },
  sunny: {
    gradient: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
    particleType: 'none',
    particleDensity: 0,
    overlayOpacity: 0.5,
    textPrimary: '#fef3c7',
    textSecondary: '#fde68a',
    textMuted: '#fcd34d',
    background: 'rgba(146, 64, 14, 0.6)',
    border: 'rgba(252, 211, 77, 0.3)',
  },
  fog: {
    gradient: ['#6b7280', '#9ca3af', '#d1d5db', '#a7f3d0'],
    particleType: 'none',
    particleDensity: 0,
    overlayOpacity: 0.7,
    textPrimary: '#f9fafb',
    textSecondary: '#e5e7eb',
    textMuted: '#d1d5db',
    background: 'rgba(107, 114, 128, 0.6)',
    border: 'rgba(209, 213, 219, 0.3)',
  },
  rain: {
    gradient: ['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa'],
    particleType: 'rain',
    particleDensity: 0.7,
    overlayOpacity: 0.6,
    textPrimary: '#dbeafe',
    textSecondary: '#bfdbfe',
    textMuted: '#93c5fd',
    background: 'rgba(30, 58, 95, 0.6)',
    border: 'rgba(147, 197, 253, 0.3)',
  },
  snow: {
    gradient: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8'],
    particleType: 'snow',
    particleDensity: 0.8,
    overlayOpacity: 0.55,
    textPrimary: '#1e1b4b',
    textSecondary: '#312e81',
    textMuted: '#4338ca',
    background: 'rgba(224, 231, 255, 0.6)',
    border: 'rgba(67, 56, 202, 0.3)',
  },
  clear: {
    gradient: ['#0c4a6e', '#075985', '#0369a1', '#0284c7'],
    particleType: 'none',
    particleDensity: 0,
    overlayOpacity: 0.45,
    textPrimary: '#e0f2fe',
    textSecondary: '#bae6fd',
    textMuted: '#7dd3fc',
    background: 'rgba(12, 74, 110, 0.6)',
    border: 'rgba(125, 211, 252, 0.3)',
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function lerpColor(color1: string, color2: string, t: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  return rgbToHex(
    rgb1[0] + (rgb2[0] - rgb1[0]) * t,
    rgb1[1] + (rgb2[1] - rgb1[1]) * t,
    rgb1[2] + (rgb2[2] - rgb1[2]) * t
  );
}

export function interpolateTheme(
  from: WeatherTheme,
  to: WeatherTheme,
  progress: number
): WeatherTheme {
  const t = Math.max(0, Math.min(1, progress));

  const smoothT = t * t * (3 - 2 * t);

  return {
    gradient: [
      lerpColor(from.gradient[0], to.gradient[0], smoothT),
      lerpColor(from.gradient[1], to.gradient[1], smoothT),
      lerpColor(from.gradient[2], to.gradient[2], smoothT),
      lerpColor(from.gradient[3], to.gradient[3], smoothT),
    ],
    particleType: smoothT > 0.5 ? to.particleType : from.particleType,
    particleDensity:
      from.particleDensity + (to.particleDensity - from.particleDensity) * smoothT,
    overlayOpacity:
      from.overlayOpacity + (to.overlayOpacity - from.overlayOpacity) * smoothT,
    textPrimary: smoothT > 0.5 ? to.textPrimary : from.textPrimary,
    textSecondary: smoothT > 0.5 ? to.textSecondary : from.textSecondary,
    textMuted: smoothT > 0.5 ? to.textMuted : from.textMuted,
    background: smoothT > 0.5 ? to.background : from.background,
    border: smoothT > 0.5 ? to.border : from.border,
  };
}

export function getGradientCSS(theme: WeatherTheme): string {
  return `radial-gradient(ellipse at 30% 20%, ${theme.gradient[0]} 0%, ${theme.gradient[1]} 35%, ${theme.gradient[2]} 65%, ${theme.gradient[3]} 100%)`;
}

export function getThemeForState(state: WeatherState): WeatherTheme {
  return WEATHER_THEMES[state];
}
