import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Store,
  ChevronRight,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Bell,
  Navigation,
} from 'lucide-react';
import { GovernmentPrice, Language, ProduceItem, User } from '../../types';
import {
  marketplaceTranslations,
  cropNamesMap,
  userNamesMap,
  villageNamesMap,
} from '../../data/translations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { CropPriceTrendChart } from '../common/CropPriceTrendChart';
import { requestUserLocation } from '../../utils/geolocation';

interface BuyerMarketplaceProps {
  language: Language;
  user: User;
  produceList: ProduceItem[];
  governmentPrices: GovernmentPrice[];
  onNavigate: (screen: string, item?: ProduceItem) => void;
  onLogout: () => void;
  onOpenPriceAlerts?: (crop?: string) => void;
  activeAlertsCount?: number;
}

export function BuyerMarketplace({
  language,
  user,
  produceList,
  governmentPrices,
  onNavigate,
  onLogout,
  onOpenPriceAlerts,
  activeAlertsCount = 0,
}: BuyerMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [trendCrop, setTrendCrop] = useState<string>('Tomato');
  const [showFilters, setShowFilters] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const t = marketplaceTranslations[language];

  const getTranslatedCrop = (name: string): string => {
    if (cropNamesMap[name]) {
      const entry = (cropNamesMap[name] as any)[language];
      if (entry) return entry;
    }
    return name;
  };

  const getTranslatedVillage = (name: string): string => {
    if (villageNamesMap[name]) {
      const entry = (villageNamesMap[name] as any)[language];
      if (entry) return entry;
    }
    return name;
  };

  const getTranslatedUser = (name: string): string => {
    if (userNamesMap[name]) {
      const entry = (userNamesMap[name] as any)[language];
      if (entry) return entry;
    }
    return name;
  };

  const handleDetectNearMe = async () => {
    try {
      setIsDetectingLocation(true);
      const loc = await requestUserLocation();
      if (loc.district) {
        setSelectedVillage(loc.district);
      }
    } catch (err) {
      console.warn('GPS error:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Distinct villages & crops for filter dropdowns
  const uniqueVillages = useMemo(() => {
    const set = new Set<string>();
    produceList.forEach((p) => set.add(p.farmerVillage));
    return Array.from(set);
  }, [produceList]);

  const uniqueCrops = useMemo(() => {
    const set = new Set<string>();
    produceList.forEach((p) => set.add(p.cropName));
    return Array.from(set);
  }, [produceList]);

  const allAvailableCrops = useMemo(() => {
    const set = new Set<string>();
    produceList.forEach((p) => set.add(p.cropName));
    governmentPrices.forEach((g) => set.add(g.cropName));
    ['Tomato', 'Onion', 'Potato', 'Carrot', 'Green Beans', 'Chili', 'Banana'].forEach((c) => set.add(c));
    return Array.from(set);
  }, [produceList, governmentPrices]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return produceList.filter((item) => {
      // Must be available or pending
      if (item.status === 'sold') return false;

      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.cropName.toLowerCase().includes(query) ||
        item.farmerName.toLowerCase().includes(query) ||
        item.farmerVillage.toLowerCase().includes(query) ||
        getTranslatedCrop(item.cropName).toLowerCase().includes(query) ||
        getTranslatedVillage(item.farmerVillage).toLowerCase().includes(query);

      // Village match
      const matchVillage = selectedVillage === 'all' || item.farmerVillage === selectedVillage;

      // Crop match
      const matchCrop = selectedCrop === 'all' || item.cropName === selectedCrop;

      return matchQuery && matchVillage && matchCrop;
    });
  }, [produceList, searchQuery, selectedVillage, selectedCrop, language]);

  // Helper to compare with APMC price
  const getPriceComparison = (item: ProduceItem) => {
    const mandi = governmentPrices.find((g) => g.cropName.toLowerCase() === item.cropName.toLowerCase());
    if (!mandi) return null;

    if (item.pricePerKg <= mandi.averagePrice * 0.95) {
      return {
        label: language === 'en' ? 'Below Mandi Rate' : 'മാർക്കറ്റ് നിരക്കിലും കുറവ്',
        style: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        savings: mandi.averagePrice - item.pricePerKg,
      };
    } else if (item.pricePerKg >= mandi.averagePrice * 1.05) {
      return {
        label: language === 'en' ? 'Premium Quality' : 'ഉയർന്ന ഗുണനിലവാരം',
        style: 'bg-amber-100 text-amber-800 border-amber-300',
        savings: 0,
      };
    }
    return {
      label: language === 'en' ? 'Fair Mandi Rate' : 'ന്യായമായ വിപണി വില',
      style: 'bg-blue-100 text-blue-800 border-blue-300',
      savings: 0,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
      {/* Top Marketplace Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-8 shadow-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Store className="h-6 w-6 text-emerald-300" />
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {t.marketplace}
                </h1>
              </div>
              <p className="text-emerald-100 text-sm mt-1">
                {t.welcome}, <strong className="text-white font-bold">{getTranslatedUser(user.name)}</strong>
                {' · '}{language === 'en' ? 'Direct Farm Fresh Produce' : 'നേരിട്ട് ഫാമിൽ നിന്നുള്ള ഉൽപ്പന്നങ്ങൾ'}
              </p>
            </div>
          </div>

          {/* Search Bar + Filter Trigger */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="pl-11 h-12 bg-white text-gray-900 text-sm rounded-xl border-0 shadow-lg focus-visible:ring-emerald-400 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`h-12 px-4 sm:px-5 rounded-xl border-white/30 text-white hover:bg-white/20 backdrop-blur-sm flex items-center gap-2 font-semibold shadow-md cursor-pointer ${
                showFilters ? 'bg-white/25' : 'bg-white/15'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>{t.filter}</span>
              {(selectedVillage !== 'all' || selectedCrop !== 'all') && (
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
              )}
            </Button>

            {onOpenPriceAlerts && (
              <Button
                onClick={() => onOpenPriceAlerts()}
                className="h-12 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 font-bold shadow-md cursor-pointer shrink-0"
                title="Set Price Alerts"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {language === 'ml' ? 'വില അലർട്ടുകൾ' : language === 'hi' ? 'मूल्य अलर्ट' : language === 'te' ? 'ధర అలర్టులు' : 'Price Alerts'}
                </span>
                {activeAlertsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-amber-800 text-[10px] font-black">
                    {activeAlertsCount}
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 rounded-xl bg-emerald-900/60 backdrop-blur-md border border-white/20 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-emerald-200 font-semibold">
                    {language === 'ml' ? 'ജില്ല / ഗ്രാമം' : language === 'hi' ? 'जिला / स्थान' : language === 'te' ? 'జిల్లా / ప్రాంతం' : 'District/Village'}
                  </label>
                  <button
                    onClick={handleDetectNearMe}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-200 hover:text-white bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-500/40 cursor-pointer"
                    title="Find nearest listings using GPS"
                  >
                    <Navigation className={`h-2.5 w-2.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                    <span>{isDetectingLocation ? 'GPS...' : (language === 'ml' ? 'സമീപത്ത് (GPS)' : language === 'hi' ? 'निकटतम (GPS)' : language === 'te' ? 'దగ్గరలో (GPS)' : 'Near Me (GPS)')}</span>
                  </button>
                </div>
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="w-full h-9 rounded-lg bg-white text-gray-800 px-3 text-xs font-medium border-0 focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="all">
                    {language === 'ml' ? 'എല്ലാ സ്ഥലങ്ങളും' : language === 'hi' ? 'सभी स्थान' : language === 'te' ? 'అన్ని ప్రాంతాలు' : 'All Locations in Kerala'}
                  </option>
                  {uniqueVillages.map((v) => (
                    <option key={v} value={v}>
                      {getTranslatedVillage(v)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-emerald-200 block mb-1 font-semibold">
                  {language === 'ml' ? 'വിള അനുസരിച്ച്' : language === 'hi' ? 'फसल अनुसार' : language === 'te' ? 'పంట ప్రకారం' : 'Filter by Crop'}
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCrop(val);
                    if (val !== 'all') {
                      setTrendCrop(val);
                    }
                  }}
                  className="w-full h-9 rounded-lg bg-white text-gray-800 px-3 text-xs font-medium border-0 focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="all">
                    {language === 'ml' ? 'എല്ലാ വിളകളും' : language === 'hi' ? 'सभी फसलें' : language === 'te' ? 'అన్ని పంటలు' : 'All Crops'}
                  </option>
                  {uniqueCrops.map((c) => (
                    <option key={c} value={c}>
                      {getTranslatedCrop(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSelectedVillage('all');
                    setSelectedCrop('all');
                    setSearchQuery('');
                  }}
                  variant="outline"
                  className="w-full h-9 bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20"
                >
                  {language === 'ml' ? 'ഫിൽട്ടറുകൾ റീസെറ്റ് ചെയ്യുക' : language === 'hi' ? 'फ़िल्टर हटाएं' : language === 'te' ? 'రీసెట్ చేయండి' : 'Reset Filters'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Produce Feed */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Historical 30-Day Crop Price Trends Line Chart using Recharts */}
        <div id="price-trend-section">
          <CropPriceTrendChart
            language={language}
            selectedCrop={trendCrop}
            onCropChange={(crop) => setTrendCrop(crop)}
            availableCrops={allAvailableCrops}
            governmentPrices={governmentPrices}
            produceList={produceList}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {t.freshProduce}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {filteredListings.length}{' '}
              {language === 'en'
                ? 'live direct harvest listings with Escrow buyer protection'
                : 'എസ്ക്രോ സുരക്ഷയുള്ള തത്സമയ ലിസ്റ്റിംഗുകൾ'}
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <Card className="text-center py-16 border-dashed border-2 border-gray-300">
            <CardContent className="space-y-3">
              <Store className="h-16 w-16 mx-auto text-gray-300 mb-2" />
              <h3 className="text-lg font-bold text-gray-700">{t.noResults}</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">{t.tryDifferent}</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedVillage('all');
                  setSelectedCrop('all');
                }}
                variant="outline"
                className="text-xs border-emerald-600 text-emerald-700 font-semibold mt-2"
              >
                {language === 'en' ? 'Reset Filters' : 'ഫിൽട്ടർ പുനഃക്രമീകരിക്കുക'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => {
              const comp = getPriceComparison(item);
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Crop Image Banner */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.cropName}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/crops/tomato.jpg';
                        }}
                      />
                      <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5">
                        <Badge className="bg-emerald-600 text-white font-bold text-[11px] shadow-sm">
                          {t.available}
                        </Badge>
                        {item.negotiable && (
                          <Badge className="bg-amber-600 text-white font-medium text-[10px] shadow-sm">
                            {t.negotiable}
                          </Badge>
                        )}
                      </div>

                      {/* Quick Chat Shortcut Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('chat', item);
                        }}
                        className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
                        title={t.contact}
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-white" />
                        <span>{language === 'en' ? 'Chat & Offer' : 'ചാറ്റ് & ഓഫർ'}</span>
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 leading-tight">
                            {getTranslatedCrop(item.cropName)}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>
                              {t.from} <strong className="text-gray-700 font-semibold">{getTranslatedVillage(item.farmerVillage)}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-emerald-700 leading-tight">
                            ₹{item.pricePerKg}
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium">/ {t.kg}</span>
                        </div>
                      </div>

                      {/* Stock & Mandi Comparison */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                        <span className="text-gray-600 font-medium">
                          {item.quantity} {t.kg} {language === 'en' ? 'available' : 'ലഭ്യമാണ്'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {comp && (
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${comp.style}`}>
                              {comp.label}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTrendCrop(item.cropName);
                              document.getElementById('price-trend-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-0.5"
                            title={language === 'en' ? 'View 30-Day Price Trend' : '30 ദിവസത്തെ വില ട്രെൻഡ് കാണുക'}
                          >
                            <span>📈</span>
                            <span>{language === 'en' ? 'Trend' : 'ട്രെൻഡ്'}</span>
                          </button>
                          {onOpenPriceAlerts && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenPriceAlerts(item.cropName);
                              }}
                              className="rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                              title="Set Price Drop Alert"
                            >
                              <Bell className="h-3 w-3 text-amber-600" />
                              <span>{language === 'ml' ? 'അലർട്ട്' : language === 'hi' ? 'अलर्ट' : language === 'te' ? 'అలర్ట్' : 'Alert'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Farmer credentials */}
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs">
                        <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.farmerName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">
                            {getTranslatedUser(item.farmerName)}
                          </p>
                          <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            <span>{language === 'en' ? 'Aadhar Verified Farmer' : 'പരിശോധിച്ച കർഷകൻ'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => onNavigate('listing-detail', item)}
                      variant="outline"
                      className="text-xs h-10 border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      {t.viewDetails}
                    </Button>

                    <Button
                      onClick={() => onNavigate('listing-detail', item)}
                      className="text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                    >
                      <span>{language === 'en' ? 'Buy Direct' : 'നേരിട്ട് വാങ്ങുക'}</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
