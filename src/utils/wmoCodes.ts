import { Language } from './translations';

export interface WMOCodeInfo {
  en: string;
  hi: string;
  icon: string;
}

export const WMO_CODE_MAP: Record<number, WMOCodeInfo> = {
  0: { en: 'Clear sky', hi: 'साफ़ आसमान', icon: '☀️' },
  1: { en: 'Mainly clear', hi: 'मुख्यतः साफ़', icon: '🌤️' },
  2: { en: 'Partly cloudy', hi: 'आंशिक रूप से बादल', icon: '⛅' },
  3: { en: 'Overcast', hi: 'घने बादल', icon: '☁️' },
  45: { en: 'Fog', hi: 'कोहरा', icon: '🌫️' },
  48: { en: 'Depositing rime fog', hi: 'सघन कोहरा', icon: '🌫️' },
  51: { en: 'Light drizzle', hi: 'हल्की बूंदाबांदी', icon: '🌧️' },
  53: { en: 'Moderate drizzle', hi: 'मध्यम बूंदाबांदी', icon: '🌧️' },
  55: { en: 'Dense drizzle', hi: 'तेज़ बूंदाबांदी', icon: '🌧️' },
  56: { en: 'Light freezing drizzle', hi: 'हल्की बर्फीली बूंदाबांदी', icon: '🌧️' },
  57: { en: 'Dense freezing drizzle', hi: 'सघन बर्फीली बूंदाबांदी', icon: '🌧️' },
  61: { en: 'Slight rain', hi: 'हल्की बारिश', icon: '🌧️' },
  63: { en: 'Moderate rain', hi: 'मध्यम बारिश', icon: '🌧️' },
  65: { en: 'Heavy rain', hi: 'भारी बारिश', icon: '🌧️' },
  66: { en: 'Light freezing rain', hi: 'हल्की बर्फीली बारिश', icon: '🌧️' },
  67: { en: 'Heavy freezing rain', hi: 'भारी बर्फीली बारिश', icon: '🌧️' },
  71: { en: 'Slight snow fall', hi: 'हल्की बर्फबारी', icon: '🌨️' },
  73: { en: 'Moderate snow fall', hi: 'मध्यम बर्फबारी', icon: '🌨️' },
  75: { en: 'Heavy snow fall', hi: 'भारी बर्फबारी', icon: '🌨️' },
  77: { en: 'Snow grains', hi: 'बर्फ के कण', icon: '🌨️' },
  80: { en: 'Slight rain showers', hi: 'हल्की बारिश की बौछारें', icon: '🌦️' },
  81: { en: 'Moderate rain showers', hi: 'मध्यम बारिश की बौछारें', icon: '🌦️' },
  82: { en: 'Violent rain showers', hi: 'तेज़ बारिश की बौछारें', icon: '⛈️' },
  85: { en: 'Slight snow showers', hi: 'हल्की बर्फ की बौछारें', icon: '🌨️' },
  86: { en: 'Heavy snow showers', hi: 'भारी बर्फ की बौछारें', icon: '🌨️' },
  95: { en: 'Thunderstorm', hi: 'आंधी-तूफान', icon: '🌩️' },
  96: { en: 'Thunderstorm with slight hail', hi: 'ओलों के साथ आंधी', icon: '⛈️' },
  99: { en: 'Thunderstorm with heavy hail', hi: 'भारी ओलों के साथ तूफान', icon: '⛈️' },
};

export function getWeatherConditionText(code: number, lang: Language = 'en'): string {
  const info = WMO_CODE_MAP[code];
  if (!info) return lang === 'hi' ? 'आंशिक रूप से बादल' : 'Partly cloudy';
  return info[lang] || info.en;
}

export function getWeatherIcon(code: number): string {
  const info = WMO_CODE_MAP[code];
  return info ? info.icon : '⛅';
}
