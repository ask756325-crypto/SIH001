import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Calendar,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { Language } from '../../types';
import { villageNamesMap } from '../../data/translations';

interface WeatherForecastWidgetProps {
  language: Language;
  defaultRegion?: string;
}

interface WeatherReport {
  region: string;
  currentTemp: number;
  condition: string;
  humidity: number;
  rainfallChance: number;
  windSpeedKm: number;
  harvestAdvisory: string;
  salesAdvisory: string;
  forecast: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainChance: number;
  }>;
}

interface GroundingSource {
  title: string;
  uri: string;
}

export const ANDHRA_PRADESH_DISTRICTS = [
  'Guntur',
  'Vijayawada',
  'Kurnool',
  'Visakhapatnam',
  'Tirupati',
  'Rajahmundry',
  'Eluru',
  'Anantapur',
  'Nellore',
  'Chittoor',
  'Kadapa',
  'Ongole',
  'Srikakulam',
  'Vizianagaram',
  'Kakinada',
  'Nandyal',
];

export function WeatherForecastWidget({
  language,
  defaultRegion = 'Guntur',
}: WeatherForecastWidgetProps) {
  const [region, setRegion] = useState(defaultRegion);
  const [weatherData, setWeatherData] = useState<WeatherReport | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);

  const t = {
    en: {
      title: 'Localized Weather & Harvest Advisory (Andhra Pradesh)',
      liveSearch: 'Live Search',
      subtitle: 'Grounded with Google Search for Andhra Pradesh harvest timing and Mandi transit planning',
      refresh: 'Refresh Forecast',
      loadingTitle: (dist: string) => `Retrieving Google Search weather data for ${dist}, Andhra Pradesh...`,
      loadingSub: 'Analyzing rainfall probability, humidity, and optimal harvest windows',
      apState: 'Andhra Pradesh',
      liveUpdated: 'Updated live via Google Search grounding',
      humidity: 'Humidity',
      highMoldRisk: 'High moisture / mold risk',
      optimalDrying: 'Optimal drying',
      rainChance: 'Rain Chance',
      wind: 'wind',
      harvestAdvice: 'Harvest Planning Advice',
      salesAdvice: 'Sales & Mandi Transport',
      harvestWindow: '3-Day Harvest Window',
      sources: 'Sources:',
      error: 'Unable to load real-time weather. Displaying offline agricultural advisory.',
    },
    te: {
      title: 'స్థానిక వాతావరణం & పంట కోత సలహా (ఆంధ్రప్రదేశ్)',
      liveSearch: 'లైవ్ సెర్చ్',
      subtitle: 'ఆంధ్రప్రదేశ్ పంట కోత సమయం మరియు మార్కెట్ రవాణా ప్రణాళిక కోసం గూగుల్ సెర్చ్ ఆధారం',
      refresh: 'తాజాకరించు',
      loadingTitle: (dist: string) => `${dist}, ఆంధ్రప్రదేశ్ వాతావరణ సమాచారం సేకరిస్తోంది...`,
      loadingSub: 'వర్షపాత అవకాశం, తేమ మరియు అనుకూలమైన కోత సమయాల విశ్లేషణ',
      apState: 'ఆంధ్రప్రదేశ్',
      liveUpdated: 'గూగుల్ సెర్చ్ ద్వారా ప్రత్యక్షంగా నవీకరించబడింది',
      humidity: 'తేమ శాతం',
      highMoldRisk: 'అధిక తేమ / బూజు ప్రమాదం',
      optimalDrying: 'ఆరబెట్టడానికి అనుకూలం',
      rainChance: 'వర్షం అవకాశం',
      wind: 'గాలి',
      harvestAdvice: 'పంట కోత ప్రణాళిక సలహా',
      salesAdvice: 'అమ్మకాలు & మార్కెట్ యార్డు రవాణా',
      harvestWindow: '3 రోజుల కోత విండో',
      sources: 'మూలాలు:',
      error: 'రియల్-టైమ్ వాతావరణం లోడ్ కాలేదు. ఆఫ్‌లైన్ వ్యవసాయ సలహా చూపబడుతోంది.',
    },
    hi: {
      title: 'स्थानीय मौसम और फसल कटाई सलाह (आंध्र प्रदेश)',
      liveSearch: 'लाइव सर्च',
      subtitle: 'आंध्र प्रदेश में फसल कटाई और मंडी परिवहन योजना के लिए गूगल सर्च से संचालित',
      refresh: 'ताज़ा करें',
      loadingTitle: (dist: string) => `${dist}, आंध्र प्रदेश के लिए लाइव मौसम डेटा प्राप्त किया जा रहा है...`,
      loadingSub: 'वर्षा की संभावना, आर्द्रता और फसल कटाई समय का विश्लेषण',
      apState: 'आंध्र प्रदेश',
      liveUpdated: 'गूगल सर्च ग्राउंडिंग के जरिए लाइव अपडेटेड',
      humidity: 'आर्द्रता',
      highMoldRisk: 'अधिक नमी का जोखिम',
      optimalDrying: 'सुखाने के लिए उत्तम',
      rainChance: 'बारिश की संभावना',
      wind: 'हवा',
      harvestAdvice: 'फसल कटाई योजना सलाह',
      salesAdvice: 'बिक्री और मंडी परिवहन',
      harvestWindow: '3-दिवसीय कटाई विंडो',
      sources: 'स्रोत:',
      error: 'रीयल-टाइम मौसम लोड करने में असमर्थ। ऑफ़लाइन कृषि सलाह प्रदर्शित की जा रही है।',
    },
    ml: {
      title: 'പ്രാദേശിക കാലാവസ്ഥയും വിളവെടുപ്പ് ഉപദേശവും (ആന്ധ്ര പ്രദേശ്)',
      liveSearch: 'തത്സമയം',
      subtitle: 'ആന്ധ്ര പ്രദേശ് വിളവെടുപ്പ് ആസൂത്രണത്തിനും മാണ്ഡി ഗതാഗതത്തിനുമുള്ള തത്സമയ കാലാവസ്ഥ വിശകലനം',
      refresh: 'പുതുക്കുക',
      loadingTitle: (dist: string) => `${dist}, ആന്ധ്ര പ്രദേശ് കാലാവസ്ഥാ വിവരങ്ങൾ ശേഖരിക്കുന്നു...`,
      loadingSub: 'മഴ സാധ്യതയും ഈർപ്പവും വിശകലനം ചെയ്യുന്നു',
      apState: 'ആന്ധ്ര പ്രദേശ്',
      liveUpdated: 'തത്സമയ വിവരങ്ങൾ',
      humidity: 'ഈർപ്പം',
      highMoldRisk: 'ഉയർന്ന ഈർപ്പം',
      optimalDrying: 'അനുയോജ്യം',
      rainChance: 'മഴ സാധ്യത',
      wind: 'കാറ്റ്',
      harvestAdvice: 'വിളവെടുപ്പ് ഉപദേശം',
      salesAdvice: 'വിപണനവും ഗതാഗതവും',
      harvestWindow: 'അടുത്ത 3 ദിവസത്തെ പ്രവചനം',
      sources: 'ഉറവിടങ്ങൾ:',
      error: 'കാലാവസ്ഥ വിവരങ്ങൾ ലഭ്യമാക്കാൻ സാധിച്ചില്ല. ഓഫ്‌ലൈൻ ഉപദേശം കാണിക്കുന്നു.',
    },
  }[language] || {
    title: 'Localized Weather & Harvest Advisory (Andhra Pradesh)',
    liveSearch: 'Live Search',
    subtitle: 'Grounded with Google Search for Andhra Pradesh harvest timing and Mandi transit planning',
    refresh: 'Refresh Forecast',
    loadingTitle: (dist: string) => `Retrieving Google Search weather data for ${dist}, Andhra Pradesh...`,
    loadingSub: 'Analyzing rainfall probability, humidity, and optimal harvest windows',
    apState: 'Andhra Pradesh',
    liveUpdated: 'Updated live via Google Search grounding',
    humidity: 'Humidity',
    highMoldRisk: 'High moisture / mold risk',
    optimalDrying: 'Optimal drying',
    rainChance: 'Rain Chance',
    wind: 'wind',
    harvestAdvice: 'Harvest Planning Advice',
    salesAdvice: 'Sales & Mandi Transport',
    harvestWindow: '3-Day Harvest Window',
    sources: 'Sources:',
    error: 'Unable to load real-time weather. Displaying offline agricultural advisory.',
  };

  const fetchWeather = async (targetRegion: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: targetRegion, language }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weather: ${response.statusText}`);
      }

      const data = await response.json();
      if (data?.weather) {
        setWeatherData(data.weather);
        setSources(data.sources || []);
        setIsLive(data.isLive ?? true);
      } else {
        throw new Error('Invalid weather payload');
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(region);
  }, [region, language]);

  const getTranslatedDistrict = (dist: string): string => {
    if (villageNamesMap[dist]) {
      const entry = (villageNamesMap[dist] as any)[language];
      if (entry) return entry;
    }
    return dist;
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('shower') || c.includes('thunder')) {
      return <CloudRain className="h-8 w-8 text-blue-500 animate-pulse" />;
    }
    if (c.includes('cloud')) {
      return <CloudSun className="h-8 w-8 text-amber-500" />;
    }
    return <Sun className="h-8 w-8 text-amber-500 animate-spin-slow" />;
  };

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 p-5 shadow-sm overflow-hidden mb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <CloudSun className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {t.title}
              </h2>
              {isLive && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
                  <span>{t.liveSearch}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Location selector + refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600 pointer-events-none" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={isLoading}
              className="h-9 rounded-lg border border-emerald-300 bg-white pl-8 pr-7 text-xs font-semibold text-gray-800 shadow-2xs hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
            >
              {ANDHRA_PRADESH_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {getTranslatedDistrict(dist)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchWeather(region)}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title={t.refresh}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <div className="flex justify-center">
            <CloudSun className="h-10 w-10 text-emerald-600 animate-bounce" />
          </div>
          <div className="text-sm font-semibold text-gray-700">
            {t.loadingTitle(getTranslatedDistrict(region))}
          </div>
          <p className="text-xs text-gray-400">
            {t.loadingSub}
          </p>
        </div>
      ) : weatherData ? (
        <div className="mt-4 space-y-4">
          {/* Current Temperature & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Primary weather card */}
            <div className="md:col-span-2 rounded-xl bg-white p-4 border border-emerald-100 shadow-2xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {getTranslatedDistrict(weatherData.region)}, {t.apState}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 tracking-tight">
                    {weatherData.currentTemp}°C
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {weatherData.condition}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  {t.liveUpdated}
                </div>
              </div>
              <div className="p-2 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                {getWeatherIcon(weatherData.condition)}
              </div>
            </div>

            {/* Humidity */}
            <div className="rounded-xl bg-white p-4 border border-emerald-100 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>{t.humidity}</span>
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">{weatherData.humidity}%</span>
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  {weatherData.humidity > 75
                    ? t.highMoldRisk
                    : t.optimalDrying}
                </span>
              </div>
            </div>

            {/* Rain Chance & Wind */}
            <div className="rounded-xl bg-white p-4 border border-emerald-100 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>{t.rainChance}</span>
                <CloudRain className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {weatherData.rainfallChance}%
                </span>
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  <Wind className="h-3 w-3 inline mr-1 text-gray-400" />
                  {weatherData.windSpeedKm} km/h {t.wind}
                </span>
              </div>
            </div>
          </div>

          {/* Actionable Agricultural Advisories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Harvest Planning Box */}
            <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/90 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>{t.harvestAdvice}</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {weatherData.harvestAdvisory}
              </p>
            </div>

            {/* Sales & Transport Box */}
            <div className="rounded-xl bg-amber-50/80 border border-amber-200/90 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{t.salesAdvice}</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {weatherData.salesAdvisory}
              </p>
            </div>
          </div>

          {/* 3-Day Forecast Strip */}
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div className="rounded-xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t.harvestWindow}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 divide-x divide-gray-100">
                {weatherData.forecast.map((fc, idx) => (
                  <div key={idx} className={`text-center ${idx > 0 ? 'pl-2' : ''}`}>
                    <span className="text-[11px] font-semibold text-gray-500 block">
                      {fc.day}
                    </span>
                    <div className="flex items-center justify-center gap-1 my-1">
                      <span className="text-sm font-bold text-gray-800">{fc.tempMax}°</span>
                      <span className="text-xs text-gray-400">/ {fc.tempMin}°</span>
                    </div>
                    <span className="text-[10px] text-gray-600 block truncate font-medium">
                      {fc.condition}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                      ☔ {fc.rainChance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grounding Attribution Sources */}
          {sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-gray-500">
              <span className="font-semibold text-gray-600 flex items-center gap-1">
                <Search className="h-3 w-3 text-emerald-600" />
                <span>{t.sources}</span>
              </span>
              {sources.slice(0, 3).map((src, sIdx) => (
                <a
                  key={sIdx}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-emerald-700 hover:text-emerald-900 border border-emerald-200 transition-colors hover:underline"
                >
                  <span className="truncate max-w-[180px]">{src.title}</span>
                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
