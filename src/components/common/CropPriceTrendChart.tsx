import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';
import { GovernmentPrice, Language, ProduceItem } from '../../types';
import { cropNamesMap } from '../../data/translations';

interface CropPriceTrendChartProps {
  language: Language;
  selectedCrop: string;
  onCropChange: (crop: string) => void;
  availableCrops: string[];
  governmentPrices?: GovernmentPrice[];
  produceList?: ProduceItem[];
}

interface PriceDataPoint {
  date: string;
  dayNumber: number;
  directPrice: number;
  mandiPrice: number;
  retailPrice: number;
}

// Generate deterministic 30-day historical data based on crop base price and market dynamics
function generate30DayHistoricalData(
  crop: string,
  govPrices?: GovernmentPrice[],
  currentListings?: ProduceItem[]
): {
  data: PriceDataPoint[];
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChangePercent: number;
  avgSavings: number;
} {
  // Determine baseline price
  const gov = govPrices?.find((g) => g.cropName.toLowerCase() === crop.toLowerCase());
  const listing = currentListings?.find((p) => p.cropName.toLowerCase() === crop.toLowerCase());

  let basePrice = gov?.averagePrice || (listing ? listing.pricePerKg : 25);
  if (crop.toLowerCase().includes('cardamom')) basePrice = 1450;
  if (crop.toLowerCase().includes('chili')) basePrice = 65;
  if (crop.toLowerCase().includes('banana')) basePrice = 45;

  // Generate 30 days of data ending today
  const today = new Date();
  const data: PriceDataPoint[] = [];

  // Deterministic seed based on crop name string chars
  const seed = crop.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  let currentWalkingPrice = basePrice * (0.92 + (seed % 15) / 100);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Smooth daily fluctuation with gentle momentum
    const daySeed = (seed * 31 + i * 17) % 100;
    const fluctuationFactor = (daySeed - 48) / 350; // -0.08 to +0.08
    currentWalkingPrice = Math.max(basePrice * 0.7, currentWalkingPrice * (1 + fluctuationFactor));

    const mandiRate = Math.round(currentWalkingPrice * (1.06 + ((daySeed % 7) - 3) / 100));
    const directRate = Math.round(currentWalkingPrice * (0.94 - ((daySeed % 5) - 2) / 100));
    const retailRate = Math.round(mandiRate * 1.25);

    data.push({
      date: dateStr,
      dayNumber: 30 - i,
      directPrice: Math.max(1, directRate),
      mandiPrice: Math.max(1, mandiRate),
      retailPrice: Math.max(1, retailRate),
    });
  }

  // Anchor last day to actual live direct price if available
  if (listing && data.length > 0) {
    data[data.length - 1].directPrice = listing.pricePerKg;
    if (gov) {
      data[data.length - 1].mandiPrice = gov.averagePrice;
    }
  }

  const directPrices = data.map((d) => d.directPrice);
  const minPrice = Math.min(...directPrices);
  const maxPrice = Math.max(...directPrices);
  const firstPrice = directPrices[0];
  const lastPrice = directPrices[directPrices.length - 1];
  const priceChangePercent = Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1));

  // Avg savings between direct and retail
  const totalDirect = data.reduce((sum, d) => sum + d.directPrice, 0);
  const totalRetail = data.reduce((sum, d) => sum + d.retailPrice, 0);
  const avgSavings = Math.round(((totalRetail - totalDirect) / totalRetail) * 100);

  return {
    data,
    currentPrice: lastPrice,
    minPrice,
    maxPrice,
    priceChangePercent,
    avgSavings,
  };
}

export function CropPriceTrendChart({
  language,
  selectedCrop,
  onCropChange,
  availableCrops,
  governmentPrices,
  produceList,
}: CropPriceTrendChartProps) {
  const isEn = language === 'en';
  const [activeSeries, setActiveSeries] = useState<{
    direct: boolean;
    mandi: boolean;
    retail: boolean;
  }>({
    direct: true,
    mandi: true,
    retail: true,
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Active crop selection fallback
  const activeCrop = selectedCrop && selectedCrop !== 'all' ? selectedCrop : availableCrops[0] || 'Tomato';

  const { data, currentPrice, minPrice, maxPrice, priceChangePercent, avgSavings } = useMemo(() => {
    return generate30DayHistoricalData(activeCrop, governmentPrices, produceList);
  }, [activeCrop, governmentPrices, produceList]);

  const translatedCropName = isEn
    ? activeCrop
    : cropNamesMap[activeCrop]?.ml || activeCrop;

  const isUp = priceChangePercent >= 0;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const direct = payload.find((p: any) => p.dataKey === 'directPrice')?.value;
      const mandi = payload.find((p: any) => p.dataKey === 'mandiPrice')?.value;
      const retail = payload.find((p: any) => p.dataKey === 'retailPrice')?.value;

      return (
        <div className="rounded-xl border border-gray-200 bg-white/95 p-3 shadow-xl backdrop-blur-md text-xs">
          <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-2 flex items-center justify-between gap-4">
            <span>{label}</span>
            <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {translatedCropName}
            </span>
          </div>
          <div className="space-y-1.5">
            {direct !== undefined && (
              <div className="flex items-center justify-between gap-4 text-emerald-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  {isEn ? 'FarmDirect Price' : 'ഫാംഡയറക്ട് വില'}:
                </span>
                <span className="font-bold text-sm">₹{direct}/kg</span>
              </div>
            )}
            {mandi !== undefined && (
              <div className="flex items-center justify-between gap-4 text-amber-700 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {isEn ? 'APMC Mandi Rate' : 'മാർക്കറ്റ് നിരക്ക്'}:
                </span>
                <span>₹{mandi}/kg</span>
              </div>
            )}
            {retail !== undefined && (
              <div className="flex items-center justify-between gap-4 text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  {isEn ? 'Traditional Retail' : 'റീട്ടെയിൽ നിരക്ക്'}:
                </span>
                <span className="line-through">₹{retail}/kg</span>
              </div>
            )}
            {direct !== undefined && retail !== undefined && (
              <div className="pt-1.5 mt-1 border-t border-gray-100 text-[11px] text-emerald-800 font-bold flex justify-between">
                <span>{isEn ? 'Direct Savings:' : 'ലാഭം:'}</span>
                <span>₹{retail - direct}/kg ({Math.round(((retail - direct) / retail) * 100)}%)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6 rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Header & Crop Picker */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                {isEn
                  ? 'Historical 30-Day Price Trends'
                  : 'കഴിഞ്ഞ 30 ദിവസത്തെ വിപണി വില ട്രെൻഡുകൾ'}
              </h3>
              <span className="hidden xs:inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                {isEn ? 'APMC Mandi Grounded' : 'തത്സമയം'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isEn
                ? 'Compare direct farm-gate pricing with wholesale Mandi benchmarks and retail rates.'
                : 'ഫാം ഗേറ്റ് വിലയും വിപണി വിലയും താരതമ്യം ചെയ്യുക.'}
            </p>
          </div>

          {/* Crop Selector Dropdown & Collapse button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={activeCrop}
                onChange={(e) => onCropChange(e.target.value)}
                className="h-9 rounded-xl border border-gray-300 bg-white px-3 pr-8 text-xs font-bold text-gray-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                {availableCrops.map((crop) => (
                  <option key={crop} value={crop}>
                    {isEn ? crop : cropNamesMap[crop]?.ml || crop}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
              title={isExpanded ? 'Collapse Chart' : 'Expand Chart'}
            >
              <span className="hidden sm:inline">{isExpanded ? (isEn ? 'Hide' : 'മറയ്ക്കുക') : (isEn ? 'Show' : 'കാണിക്കുക')}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Crop Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-gray-500 shrink-0">
            {isEn ? 'Popular:' : 'പ്രധാന വിളകൾ:'}
          </span>
          {availableCrops.slice(0, 8).map((crop) => {
            const isSelected = activeCrop.toLowerCase() === crop.toLowerCase();
            return (
              <button
                key={crop}
                onClick={() => onCropChange(crop)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {isEn ? crop : cropNamesMap[crop]?.ml || crop}
              </button>
            );
          })}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5">
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase block">
                {isEn ? 'Current Direct Rate' : 'നിലവിലെ ഫാം വില'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-emerald-950">₹{currentPrice}</span>
                <span className="text-xs text-emerald-700 font-medium">/ kg</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                {isEn ? 'Direct from verified farmers' : 'കർഷകരിൽ നിന്ന് നേരിട്ട്'}
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-slate-50 p-3">
              <span className="text-[11px] font-semibold text-gray-500 uppercase block">
                {isEn ? '30-Day Trend' : '30 ദിവസത്തെ മാറ്റം'}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {isUp ? (
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                )}
                <span className={`text-xl font-extrabold ${isUp ? 'text-red-700' : 'text-emerald-700'}`}>
                  {isUp ? `+${priceChangePercent}%` : `${priceChangePercent}%`}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {isUp
                  ? isEn ? 'Seasonal demand tightening' : 'ഡിമാൻഡ് വർദ്ധിക്കുന്നു'
                  : isEn ? 'Favorable harvest supply' : 'വിളവ് അനുകൂലമാണ്'}
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-slate-50 p-3">
              <span className="text-[11px] font-semibold text-gray-500 uppercase block">
                {isEn ? '30-Day Range (Low / High)' : 'വില പരിധി (കുറവ് / ഉയർച്ച)'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-gray-800">₹{minPrice}</span>
                <span className="text-xs text-gray-400">to</span>
                <span className="text-base font-bold text-gray-900">₹{maxPrice}</span>
              </div>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {isEn ? 'Direct modal volatility' : 'വില വ്യതിയാനം'}
              </span>
            </div>

            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <span className="text-[11px] font-semibold text-teal-800 uppercase block">
                {isEn ? 'Direct Buyer Advantage' : 'നേരിട്ടുള്ള ലാഭം'}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-teal-900">~{avgSavings}%</span>
                <span className="text-xs text-teal-700 font-bold">{isEn ? 'Lower' : 'കുറവ്'}</span>
              </div>
              <span className="text-[10px] text-teal-700 font-medium block mt-0.5">
                {isEn ? 'vs middleman retail markups' : 'ഇടനിലക്കാർ ഇല്ലാത്തതിനാൽ'}
              </span>
            </div>
          </div>

          {/* Interactive Series Toggle Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-600 mr-1">
                {isEn ? 'Display Series:' : 'ഗ്രാഫ് ലൈനുകൾ:'}
              </span>

              <button
                type="button"
                onClick={() => setActiveSeries((prev) => ({ ...prev, direct: !prev.direct }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  activeSeries.direct
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-200" />
                <span>{isEn ? 'FarmDirect Price' : 'ഫാംഡയറക്ട് വില'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSeries((prev) => ({ ...prev, mandi: !prev.mandi }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  activeSeries.mandi
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-200" />
                <span>{isEn ? 'APMC Mandi Rate' : 'മാർക്കറ്റ് നിരക്ക്'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSeries((prev) => ({ ...prev, retail: !prev.retail }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  activeSeries.retail
                    ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span>{isEn ? 'Traditional Retail' : 'റീട്ടെയിൽ നിരക്ക്'}</span>
              </button>
            </div>

            <div className="text-[11px] text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{isEn ? 'Last 30 Calendar Days' : 'കഴിഞ്ഞ 30 ദിവസങ്ങൾ'}</span>
            </div>
          </div>

          {/* Recharts LineChart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(val) => `₹${val}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />

                {activeSeries.retail && (
                  <Line
                    type="monotone"
                    dataKey="retailPrice"
                    name={isEn ? 'Traditional Retail' : 'റീട്ടെയിൽ നിരക്ക്'}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 4, stroke: '#64748b', strokeWidth: 2, fill: '#fff' }}
                  />
                )}

                {activeSeries.mandi && (
                  <Line
                    type="monotone"
                    dataKey="mandiPrice"
                    name={isEn ? 'APMC Mandi Rate' : 'മാർക്കറ്റ് നിരക്ക്'}
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, stroke: '#d97706', strokeWidth: 2, fill: '#fff' }}
                  />
                )}

                {activeSeries.direct && (
                  <Line
                    type="monotone"
                    dataKey="directPrice"
                    name={isEn ? 'FarmDirect Price' : 'ഫാംഡയറക്ട് വില'}
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 2, fill: '#059669' }}
                    activeDot={{ r: 6, stroke: '#047857', strokeWidth: 2, fill: '#fff' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Note */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-gray-500 gap-1.5">
            <div className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                {isEn
                  ? 'FarmDirect prices reflect direct farm-gate offers protected by Escrow.'
                  : 'ഫാംഡയറക്ട് വിലകൾ എസ്ക്രോ വഴി സുരക്ഷിതമായ കർഷക വിലകളാണ്.'}
              </span>
            </div>
            <span className="font-semibold text-emerald-700">
              {isEn ? 'Zero Commission · Transparent Pricing' : 'കമ്മീഷനില്ല · സുതാര്യമായ നിരക്ക്'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
