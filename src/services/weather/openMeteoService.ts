import { WeatherData, CurrentWeather, DailyForecast } from '../../types/weather';
import { getWeatherConditionText, getWeatherIcon } from '../../utils/wmoCodes';

export class OpenMeteoService {
  async fetchWeather(lat: number, lon: number, locationName: string): Promise<WeatherData> {
    if (lat === undefined || lon === undefined || lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      throw new Error("Invalid location coordinates.");
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm&timezone=auto`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status}`);
    }
    const data = await res.json();

    if (!data || !data.current || !data.daily) {
      throw new Error("Invalid response format from Open-Meteo API.");
    }

    const [district, state] = locationName.split(',').map(s => s.trim());

    const weatherCode = data.current.weather_code ?? 0;

    const current: CurrentWeather = {
      temperature: Math.round(data.current.temperature_2m ?? 0),
      apparentTemperature: Math.round(data.current.apparent_temperature ?? data.current.temperature_2m ?? 0),
      humidity: Math.round(data.current.relative_humidity_2m ?? 0),
      precipitation: Number((data.current.precipitation ?? 0).toFixed(1)),
      rainProbability: Math.round(data.daily.precipitation_probability_max?.[0] ?? 0),
      windSpeed: Math.round(data.current.wind_speed_10m ?? 0),
      weatherCode: weatherCode,
      conditionText: getWeatherConditionText(weatherCode, 'en'),
      isDay: data.current.is_day === 1,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daily: DailyForecast[] = (data.daily.time ?? []).map((timeStr: string, idx: number) => {
      const d = new Date(timeStr);
      const dayName = idx === 0 ? 'Today' : daysOfWeek[d.getDay()];
      const code = data.daily.weather_code?.[idx] ?? 0;
      return {
        date: timeStr,
        dayName,
        weatherCode: code,
        conditionText: getWeatherConditionText(code, 'en'),
        tempMax: Math.round(data.daily.temperature_2m_max?.[idx] ?? 0),
        tempMin: Math.round(data.daily.temperature_2m_min?.[idx] ?? 0),
        precipitationSum: Number((data.daily.precipitation_sum?.[idx] ?? 0).toFixed(1)),
        precipitationProbability: Math.round(data.daily.precipitation_probability_max?.[idx] ?? 0),
        windSpeedMax: Math.round(data.daily.wind_speed_10m_max?.[idx] ?? 0)
      };
    });

    return {
      current,
      daily,
      locationName,
      district: district || locationName,
      state: state || '',
      latitude: lat,
      longitude: lon,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}

export const openMeteoService = new OpenMeteoService();
export { getWeatherConditionText, getWeatherIcon };
