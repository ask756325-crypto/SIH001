import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  IndianRupee,
  TrendingUp,
  Plus,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  ChevronRight,
  Filter,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Language, ProduceItem, ProduceStatus, User } from '../../types';
import {
  farmerDashboardTranslations,
  cropNamesMap,
  userNamesMap,
  villageNamesMap,
} from '../../data/translations';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { WeatherForecastWidget } from '../common/WeatherForecastWidget';
import { ProduceQRModal } from '../common/ProduceQRModal';
import { AIFarmStudioModal } from '../common/AIFarmStudioModal';

interface FarmerDashboardProps {
  language: Language;
  user: User;
  produceList: ProduceItem[];
  onNavigate: (screen: string, item?: ProduceItem) => void;
  onLogout: () => void;
  onStatusChange?: (id: string, newStatus: ProduceStatus) => void;
}

export function FarmerDashboard({
  language,
  user,
  produceList,
  onNavigate,
  onLogout,
  onStatusChange,
}: FarmerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'pending' | 'sold'>('all');
  const [selectedQRListing, setSelectedQRListing] = useState<ProduceItem | null>(null);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);

  const t = farmerDashboardTranslations[language];

  // Farmer's own listings
  const myListings = produceList.filter((p) => p.farmerId === user.id || p.farmerName === user.name);

  // Filter by tab
  const filteredListings = myListings.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  // Calculate earnings
  const soldEarnings = myListings
    .filter((k) => k.status === 'sold')
    .reduce((acc, cur) => acc + cur.quantity * cur.pricePerKg, 0);
  const totalProjected = soldEarnings + myListings
    .filter((k) => k.status === 'available' || k.status === 'pending')
    .reduce((acc, cur) => acc + cur.quantity * cur.pricePerKg, 0);

  const getTranslatedCrop = (name: string): string => {
    if (language === 'ml' && cropNamesMap[name]) {
      return cropNamesMap[name].ml;
    }
    return name;
  };

  const getTranslatedVillage = (name: string): string => {
    if (language === 'ml' && villageNamesMap[name]) {
      return villageNamesMap[name].ml;
    }
    return name;
  };

  const getTranslatedUser = (name: string): string => {
    if (language === 'ml' && userNamesMap[name]) {
      return userNamesMap[name].ml;
    }
    return name;
  };

  const getStatusBadge = (status: ProduceStatus) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold">
            {t.available}
          </Badge>
        );
      case 'sold':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold">
            {t.sold}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold">
            {t.pending}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
      {/* Top Banner with Stats */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {t.dashboard}
                </h1>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
                  {language === 'en' ? 'Farmer Hub' : 'കർഷക കേന്ദ്രം'}
                </span>
              </div>
              <p className="text-emerald-100 text-sm mt-1">
                {t.welcome}, <strong className="text-white font-bold">{getTranslatedUser(user.name)}</strong>
                {' '}({getTranslatedVillage(user.village)})
              </p>
            </div>

            {/* Quick actions: AI Studio & Add Produce */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Button
                onClick={() => setShowAIModal(true)}
                variant="outline"
                className="bg-emerald-800/80 hover:bg-emerald-800 text-amber-200 border border-amber-300/40 font-bold text-xs sm:text-sm px-3.5 py-2.5 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>{language === 'en' ? 'AI Market Studio' : 'എഐ സ്റ്റുഡിയോ'}</span>
              </Button>

              <Button
                onClick={() => onNavigate('add-produce')}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-4 py-2.5 shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t.addProduce}</span>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur-md p-4 border border-white/20">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
                <IndianRupee className="h-4 w-4" />
                <span>{t.earnings} ({language === 'en' ? 'Realized' : 'ലഭിച്ചത്'})</span>
              </div>
              <div className="text-2xl font-black text-white mt-1">
                ₹{soldEarnings.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-200 mt-1">
                {language === 'en' ? 'Disbursed directly via Escrow' : 'എസ്ക്രോ വഴി നേരിട്ട് നൽകിയത്'}
              </div>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-md p-4 border border-white/20">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>{t.totalEarnings} ({language === 'en' ? 'Estimated Total' : 'മൊത്തം പ്രതീക്ഷിതം'})</span>
              </div>
              <div className="text-2xl font-black text-white mt-1">
                ₹{totalProjected.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-200 mt-1">
                {myListings.length} {language === 'en' ? 'total crop listings' : 'മൊത്തം ലിസ്റ്റിംഗുകൾ'}
              </div>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-md p-4 border border-white/20">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
                <Package className="h-4 w-4" />
                <span>{language === 'en' ? 'Active Volume' : 'സജീവ സ്റ്റോക്ക്'}</span>
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {myListings
                  .filter((p) => p.status === 'available')
                  .reduce((acc, cur) => acc + cur.quantity, 0)}{' '}
                <span className="text-base font-normal text-emerald-200">{t.kg}</span>
              </div>
              <div className="text-[11px] text-emerald-200 mt-1">
                {language === 'en' ? 'Ready for immediate dispatch' : 'ഉടൻ അയക്കാൻ തയ്യാറാണ്'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Localized Weather & Harvest Forecast Widget */}
        <WeatherForecastWidget
          language={language}
          defaultRegion={user.village || 'Thiruvananthapuram'}
        />

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <div className="flex items-center gap-1 sm:gap-2">
            {(
              [
                { id: 'all', label: language === 'en' ? 'All Listings' : 'എല്ലാം', count: myListings.length },
                { id: 'available', label: t.available, count: myListings.filter((p) => p.status === 'available').length },
                { id: 'pending', label: t.pending, count: myListings.filter((p) => p.status === 'pending').length },
                { id: 'sold', label: t.sold, count: myListings.filter((p) => p.status === 'sold').length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <Button
            onClick={() => onNavigate('add-produce')}
            size="sm"
            className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>{t.addProduce}</span>
          </Button>
        </div>

        {/* Listings Grid / List */}
        {filteredListings.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-gray-300">
            <CardContent className="space-y-3">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Package className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {t.noListings}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {t.startSelling}
              </p>
              <Button
                onClick={() => onNavigate('add-produce')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>{t.addProduce}</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredListings.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.cropName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/crops/tomato.jpg';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">
                          {getTranslatedCrop(item.cropName)}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{getTranslatedVillage(item.farmerVillage)}</span>
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs mb-3">
                    <div>
                      <span className="text-gray-500 block text-[11px]">{language === 'en' ? 'Stock' : 'സ്റ്റോക്ക്'}</span>
                      <strong className="text-gray-800 font-semibold text-sm">
                        {item.quantity} {t.kg}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">{language === 'en' ? 'Price' : 'വില'}</span>
                      <strong className="text-emerald-700 font-bold text-sm">
                        ₹{item.pricePerKg} <span className="font-normal text-xs text-gray-500">/ {t.kg}</span>
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.postedDate).toLocaleDateString()}</span>
                    </span>
                    <span>
                      {item.negotiable ? (
                        <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                          {language === 'en' ? 'Negotiable' : 'വില ചർച്ചയാകാം'}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {language === 'en' ? 'Fixed Price' : 'സ്ഥിരവില'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Button
                    onClick={() => onNavigate('listing-detail', item)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  >
                    <span>{language === 'en' ? 'View Details' : 'വിശദാംശങ്ങൾ'}</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>

                  <Button
                    onClick={() => setSelectedQRListing(item)}
                    variant="outline"
                    size="sm"
                    className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 px-2.5 flex items-center gap-1"
                    title={language === 'en' ? 'Generate Market QR Code' : 'മാർക്കറ്റ് ക്യുആർ കോഡ്'}
                  >
                    <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{language === 'en' ? 'QR Code' : 'ക്യുആർ'}</span>
                  </Button>

                  {item.status === 'available' && onStatusChange && (
                    <Button
                      onClick={() => onStatusChange(item.id, 'sold')}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3"
                      title={language === 'en' ? 'Mark this listing as Sold' : 'വിറ്റതായി രേഖപ്പെടുത്തുക'}
                    >
                      {language === 'en' ? 'Mark Sold' : 'വിറ്റു'}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Produce Market QR Code Modal */}
      <ProduceQRModal
        isOpen={!!selectedQRListing}
        onClose={() => setSelectedQRListing(null)}
        listing={selectedQRListing}
        language={language}
      />

      {/* AI Creative Studio Modal (Live Voice, Image, Video, Music, Mandi Search) */}
      <AIFarmStudioModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        language={language}
        activeProduce={selectedQRListing || myListings[0] || null}
      />
    </div>
  );
}
