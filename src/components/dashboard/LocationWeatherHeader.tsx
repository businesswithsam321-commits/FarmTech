import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, CloudRain, Droplets, Wind, Thermometer, RefreshCw } from 'lucide-react';
import { t } from '../../utils/translations';
import { getWeatherConditionText, getWeatherIcon } from '../../utils/wmoCodes';

export const LocationWeatherHeader: React.FC = () => {
  const { locationName, weatherData, weatherLoading, weatherError, refetchWeather, farmContext, language } = useApp();

  if (weatherLoading) {
    return (
      <div className="bg-white border border-stone-300 rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-6 bg-stone-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (weatherError || !weatherData) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-rose-950 font-display">{t('weatherDataUnavailable', language)}</h3>
          <p className="text-xs text-rose-800 mt-1">{weatherError || t('weatherErrorDefault', language)}</p>
        </div>
        <button
          onClick={refetchWeather}
          className="px-4 py-2 bg-rose-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('retryWeather', language)}</span>
        </button>
      </div>
    );
  }

  const { current } = weatherData;
  const conditionText = getWeatherConditionText(current.weatherCode, language);
  const weatherIcon = getWeatherIcon(current.weatherCode);

  return (
    <div className="bg-white border border-stone-300 rounded-2xl p-5 md:p-6 shadow-xs relative overflow-hidden space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {t('currentLocationWeather', language)}
            </span>
            <span className="text-xs text-stone-300">•</span>
            <span className="text-xs text-emerald-800 font-medium">{t('updated', language)} {current.time}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 flex items-center gap-1.5">
              <MapPin className="w-6 h-6 text-emerald-800 shrink-0" />
              {locationName}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {t('calibratedFor', language)} <strong className="text-emerald-950 font-semibold">{farmContext.crop}</strong> ({farmContext.stage}) {t('in', language)} {farmContext.soil} {t('soilText', language)}
          </p>
        </div>

        {/* Temperature Badge */}
        <div className="flex items-center gap-4 bg-stone-100/90 border border-stone-300 rounded-2xl p-3.5 sm:px-5">
          <div className="text-4xl">{weatherIcon}</div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-950 font-display">
                {current.temperature}°C
              </span>
              <span className="text-xs text-stone-600 font-medium">{conditionText}</span>
            </div>
            <div className="text-xs text-stone-600">
              {t('feelsLike', language)} <strong className="font-semibold text-emerald-950">{current.apparentTemperature}°C</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-200">
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>{t('rainfallToday', language)}</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-emerald-950 font-display">
            {current.precipitation} mm
          </div>
          <div className="text-[11px] text-stone-600">{t('past24Hours', language)}</div>
        </div>

        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>{t('rainProbability', language)}</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-emerald-950 font-display">
            {current.rainProbability}%
          </div>
          <div className="text-[11px] text-amber-800 font-medium">{t('forecastMax', language)}</div>
        </div>

        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>{t('windSpeed', language)}</span>
            <Wind className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-xl font-bold text-emerald-950 font-display">
            {current.windSpeed} km/h
          </div>
          <div className="text-[11px] text-stone-600">{t('mildBreeze', language)}</div>
        </div>

        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>{t('humidity', language)}</span>
            <Thermometer className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-emerald-950 font-display">
            {current.humidity}%
          </div>
          <div className="text-[11px] text-emerald-800 font-medium">{t('relativeHumidity', language)}</div>
        </div>
      </div>
    </div>
  );
};
