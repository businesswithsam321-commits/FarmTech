import React, { useState } from 'react';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { geocodingService, GeocodingResult } from '../../services/location/geocodingService';
import { t } from '../../utils/translations';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LOCATIONS: { name: string; lat: number; lon: number }[] = [
  { name: 'Bilaspur, Chhattisgarh', lat: 22.0797, lon: 82.1391 },
  { name: 'Raipur, Chhattisgarh', lat: 21.2514, lon: 81.6296 },
  { name: 'Durg, Chhattisgarh', lat: 21.1904, lon: 81.2849 },
  { name: 'Rajnandgaon, Chhattisgarh', lat: 21.1014, lon: 81.0347 },
  { name: 'Korba, Chhattisgarh', lat: 22.3595, lon: 82.7501 },
  { name: 'Ambikapur, Chhattisgarh', lat: 23.1214, lon: 83.1979 },
  { name: 'Jagdalpur, Chhattisgarh', lat: 19.0744, lon: 82.0222 }
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { setLocation, language } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (locName: string, lat?: number, lon?: number) => {
    setLocation(locName, lat, lon);
    onClose();
  };

  const handleGeoDetect = () => {
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg(t('gpsError', language));
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const locName = await geocodingService.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setLocation(locName, pos.coords.latitude, pos.coords.longitude);
        } catch {
          setLocation("Bilaspur, Chhattisgarh", pos.coords.latitude, pos.coords.longitude);
        } finally {
          setDetecting(false);
          onClose();
        }
      },
      () => {
        setDetecting(false);
        setErrorMsg(t('gpsDenied', language));
      },
      { timeout: 8000 }
    );
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (val.trim().length >= 3) {
      setSearching(true);
      const res = await geocodingService.searchLocation(val.trim());
      setSearchResults(res);
      setSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      const top = searchResults[0];
      handleSelect(`${top.name}, ${top.admin1 || 'Chhattisgarh'}`, top.latitude, top.longitude);
    } else if (searchInput.trim()) {
      handleSelect(searchInput.trim().includes(',') ? searchInput.trim() : `${searchInput.trim()}, Chhattisgarh`);
    }
  };

  const filteredPresets = PRESET_LOCATIONS.filter(p => p.name.toLowerCase().includes(searchInput.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-display">{t('selectFarmLocation', language)}</h2>
              <p className="text-xs text-stone-500">{t('openMeteoSub', language)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <button
            onClick={handleGeoDetect}
            disabled={detecting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 text-emerald-400 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? t('detectingGps', language) : t('useGps', language)}</span>
          </button>

          {errorMsg && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-tight">
              {errorMsg}
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              {t('orSearchCity', language)}
            </span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder', language)}
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-700"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>

          {searching && (
            <div className="text-xs text-stone-500 py-1 text-center">{t('searchingOpenMeteo', language)}</div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1 border-t border-stone-200">
              <div className="text-[10px] uppercase font-bold text-stone-400">{t('openMeteoResults', language)}</div>
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(`${res.name}, ${res.admin1 || 'Chhattisgarh'}`, res.latitude, res.longitude)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 hover:border-emerald-700 text-stone-800 font-medium text-xs text-left hover:bg-emerald-50/50 transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{res.name}, {res.admin1 || 'CG'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{t('selectBtn', language)}</span>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
              {filteredPresets.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleSelect(loc.name, loc.lat, loc.lon)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 hover:border-emerald-700 text-stone-800 font-medium text-xs text-left hover:bg-emerald-50/50 transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{loc.name}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{t('selectBtn', language)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400">
          <span>{t('poweredByGeocoding', language)}</span>
          <button onClick={onClose} className="font-semibold text-stone-600 hover:underline">{t('closeBtn', language)}</button>
        </div>
      </div>
    </div>
  );
};
