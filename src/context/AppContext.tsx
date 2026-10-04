import React, { createContext, useContext, useState, useEffect } from 'react';
import { WeatherData, WeatherRisk } from '../types/weather';
import { FarmContext } from '../types/farm';
import { openMeteoService } from '../services/weather/openMeteoService';
import { calculateWeatherRisks } from '../services/weather/riskEngine';
import { geocodingService } from '../services/location/geocodingService';
import { Language } from '../utils/translations';

export type ActiveTab = 'dashboard' | 'weather' | 'alerts' | 'crops' | 'market' | 'aichat';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  setLocation: (name: string, lat?: number, lon?: number) => void;
  farmContext: FarmContext;
  updateFarmContext: (updates: Partial<FarmContext>) => void;
  weatherData: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  weatherRisks: WeatherRisk[];
  refetchWeather: () => void;
  // Selected market choices across app
  selectedMarketCommodity: string;
  setSelectedMarketCommodity: (c: string) => void;
  selectedMarketDistrict: string;
  setSelectedMarketDistrict: (d: string) => void;
  selectedMarketName: string;
  setSelectedMarketName: (m: string) => void;
}

const DEFAULT_FARM_CONTEXT: FarmContext = {
  crop: 'Rice',
  season: 'Kharif',
  soil: 'Clay / Loamy',
  water: 'Moderate / Canal',
  stage: 'Vegetative',
  district: 'Bilaspur',
  state: 'Chhattisgarh'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Language state with localStorage persistence
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('climatecheck_lang');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('climatecheck_lang', lang);
  };

  const [locationName, setLocationName] = useState<string>('Bilaspur, Chhattisgarh');
  const [latitude, setLatitude] = useState<number | null>(22.0797);
  const [longitude, setLongitude] = useState<number | null>(82.1391);
  const [farmContext, setFarmContext] = useState<FarmContext>(DEFAULT_FARM_CONTEXT);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherRisks, setWeatherRisks] = useState<WeatherRisk[]>([]);

  // Market selections
  const [selectedMarketCommodity, setSelectedMarketCommodity] = useState<string>('Rice');
  const [selectedMarketDistrict, setSelectedMarketDistrict] = useState<string>('Bilaspur');
  const [selectedMarketName, setSelectedMarketName] = useState<string>('Bilaspur');

  const loadWeather = async (lat: number | null, lon: number | null, locName: string) => {
    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      setWeatherData(null);
      setWeatherRisks([]);
      setWeatherError("Coordinates unavailable for the selected location. Please select your location from the search list.");
      setWeatherLoading(false);
      return;
    }

    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await openMeteoService.fetchWeather(lat, lon, locName);
      setWeatherData(data);
      const risks = calculateWeatherRisks(data);
      setWeatherRisks(risks);
    } catch (err: any) {
      setWeatherData(null);
      setWeatherRisks([]);
      setWeatherError("Weather data is temporarily unavailable. Please try again.");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(latitude, longitude, locationName);
  }, [latitude, longitude, locationName]);

  const setLocation = async (name: string, lat?: number, lon?: number) => {
    setLocationName(name);
    const [dist, st] = name.split(',').map(s => s.trim());
    if (dist) {
      setSelectedMarketDistrict(dist);
      setSelectedMarketName(dist);
      setFarmContext(prev => ({ ...prev, district: dist, state: st || prev.state }));
    }

    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
      setLatitude(lat);
      setLongitude(lon);
    } else {
      // Resolve coordinates asynchronously via Open-Meteo Geocoding API
      setWeatherLoading(true);
      try {
        const results = await geocodingService.searchLocation(name);
        if (results && results.length > 0) {
          setLatitude(results[0].latitude);
          setLongitude(results[0].longitude);
        } else {
          setLatitude(null);
          setLongitude(null);
          setWeatherData(null);
          setWeatherRisks([]);
          setWeatherError(`Coordinates unavailable for "${name}". Please select a location from the search list.`);
          setWeatherLoading(false);
        }
      } catch (err) {
        setLatitude(null);
        setLongitude(null);
        setWeatherData(null);
        setWeatherRisks([]);
        setWeatherError(`Unable to resolve coordinates for "${name}". Please try again.`);
        setWeatherLoading(false);
      }
    }
  };

  const updateFarmContext = (updates: Partial<FarmContext>) => {
    setFarmContext(prev => ({ ...prev, ...updates }));
  };

  const refetchWeather = () => {
    loadWeather(latitude, longitude, locationName);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        locationName,
        latitude,
        longitude,
        setLocation,
        farmContext,
        updateFarmContext,
        weatherData,
        weatherLoading,
        weatherError,
        weatherRisks,
        refetchWeather,
        selectedMarketCommodity,
        setSelectedMarketCommodity,
        selectedMarketDistrict,
        setSelectedMarketDistrict,
        selectedMarketName,
        setSelectedMarketName
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
