import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  MessageCircle,
  IndianRupee,
  Calendar,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Phone,
  Truck,
  Shield,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { GovernmentPrice, Language, ProduceItem, User } from '../../types';
import {
  cropDetailsTranslations,
  cropNamesMap,
  userNamesMap,
  villageNamesMap,
} from '../../data/translations';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ProduceQRModal } from '../common/ProduceQRModal';

interface ListingDetailScreenProps {
  language: Language;
  user: User;
  listing: ProduceItem;
  governmentPrices: GovernmentPrice[];
  farmers: User[];
  onNavigate: (screen: string, item?: ProduceItem) => void;
  onBack: () => void;
}

export function ListingDetailScreen({
  language,
  user,
  listing,
  governmentPrices,
  farmers,
  onNavigate,
  onBack,
}: ListingDetailScreenProps) {
  const [showQR, setShowQR] = useState(false);
  const t = cropDetailsTranslations[language];

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

  const farmer = farmers.find(
    (f) => f.id === listing.farmerId || f.name.toLowerCase() === listing.farmerName.toLowerCase()
  );

  const mandiData = governmentPrices.find(
    (g) => g.cropName.toLowerCase() === listing.cropName.toLowerCase()
  );

  const priceEvaluation = (() => {
    if (!mandiData) return null;
    if (listing.pricePerKg <= mandiData.averagePrice * 0.95) return 'below';
    if (listing.pricePerKg >= mandiData.averagePrice * 1.05) return 'above';
    return 'fair';
  })();

  const totalValue = listing.quantity * listing.pricePerKg;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-4 shadow-md sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold tracking-tight">{t.cropDetails}</h1>
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-xs font-semibold cursor-pointer border border-white/20"
            title={language === 'en' ? 'Show Market Stall QR Code' : 'മാർക്കറ്റ് ക്യുആർ കോഡ്'}
          >
            <QrCode className="h-4 w-4 text-emerald-200" />
            <span>{language === 'en' ? 'Market QR' : 'ക്യുആർ കോഡ്'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Crop Hero Image */}
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-md bg-gray-200">
          <img
            src={listing.imageUrl}
            alt={listing.cropName}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/crops/tomato.jpg';
            }}
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white font-bold text-sm px-3 py-1 shadow-md">
              {getTranslatedCrop(listing.cropName)}
            </Badge>
          </div>
        </div>

        {/* Pricing Summary Card */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-5 space-y-3.5 divide-y divide-gray-100">
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm text-gray-500 font-medium">{t.quantity}</span>
              <span className="text-base font-bold text-gray-900">
                {listing.quantity} {t.kg}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 pb-2">
              <span className="text-sm text-gray-500 font-medium">{t.price}</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-emerald-700">
                  ₹{listing.pricePerKg} <span className="text-xs font-normal text-gray-400">/ {t.kg}</span>
                </span>
                {priceEvaluation && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      priceEvaluation === 'below'
                        ? 'bg-emerald-100 text-emerald-800'
                        : priceEvaluation === 'above'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {priceEvaluation === 'below'
                      ? t.belowAvg
                      : priceEvaluation === 'above'
                      ? t.aboveAvg
                      : t.atAvg}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 pb-2">
              <span className="text-sm text-gray-500 font-medium">{t.totalValue}</span>
              <span className="text-xl font-extrabold text-emerald-800">
                ₹{totalValue.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-sm text-gray-500 font-medium">{t.negotiable}</span>
              <Badge variant={listing.negotiable ? 'default' : 'secondary'} className="font-semibold text-xs">
                {listing.negotiable ? t.yes : t.no}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* APMC Mandi Benchmark Card */}
        {mandiData && (
          <Card className="border border-emerald-200/80 bg-emerald-50/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 border-b border-emerald-100">
              <CardTitle className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-emerald-700" />
                <span>{t.priceComparison}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t.govtPrice} ({mandiData.market}):</span>
                <span className="font-bold text-gray-900">
                  ₹{mandiData.minPrice} - ₹{mandiData.maxPrice} / kg
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{language === 'en' ? 'APMC Mandi Average:' : 'മാർക്കറ്റ് ശരാശരി:'}</span>
                <span className="font-bold text-gray-900">₹{mandiData.averagePrice} / kg</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 text-center border border-emerald-200 text-xs">
                <span className="text-gray-600 block text-[11px] mb-0.5">{t.fairPricing}</span>
                <span className="font-bold text-emerald-800">
                  {priceEvaluation === 'below'
                    ? language === 'en'
                      ? `Farmer price is ₹${mandiData.averagePrice - listing.pricePerKg}/kg lower than Mandi rate!`
                      : `മാർക്കറ്റ് നിരക്കിനേക്കാൾ ₹${mandiData.averagePrice - listing.pricePerKg}/kg കുറവാണ്!`
                    : priceEvaluation === 'above'
                    ? language === 'en'
                      ? 'Premium grade produce with organic/quality standards.'
                      : 'പ്രീമിയം ഗുണനിലവാരമുള്ള ഓർഗാനിക് ഉൽപ്പന്നം.'
                    : language === 'en'
                    ? 'Price matches Andhra Pradesh official APMC benchmarks.'
                    : language === 'te'
                    ? 'ధర ఆంధ్రప్రదేశ్ అధికారిక APMC మార్కెట్ ప్రమాణాలకు సమానం.'
                    : language === 'hi'
                    ? 'कीमत आंध्र प्रदेश आधिकारिक APMC बेंचमार्क से मेल खाती है।'
                    : 'ആന്ധ്ര പ്രദേശ് ഔദ്യോഗിക APMC വിപണി നിരക്കിന് തുല്യമാണ്.'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Farmer Profile Card */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                  {listing.farmerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    {getTranslatedUser(listing.farmerName)}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    <span>{getTranslatedVillage(listing.farmerVillage)}</span>
                  </p>
                  {farmer && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                        <span>{farmer.rating}</span>
                      </div>
                      <span className="text-gray-400 text-[10px]">·</span>
                      <span className="text-[11px] text-gray-500">
                        {farmer.totalReviews} {t.reviews}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {farmer?.phone && (
                <a
                  href={`tel:${farmer.phone}`}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{farmer.phone}</span>
                </a>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {t.postedOn}: {new Date(listing.postedDate).toLocaleDateString()}
                </span>
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{language === 'en' ? 'Aadhar Verified' : 'ആധാർ പരിശോധിച്ചു'}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Escrow Guarantee Highlight */}
        <div className="rounded-xl bg-blue-50/80 border border-blue-200/80 p-3.5 flex items-start gap-3 text-xs text-blue-900">
          <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-blue-900">
              {language === 'en' ? 'FarmDirect 100% Escrow Protection' : '100% എസ്ക്രോ സുരക്ഷ'}
            </span>
            <span className="text-blue-700 leading-relaxed mt-0.5 block">
              {language === 'en'
                ? 'Your payment is kept safely locked in escrow until you inspect and confirm quality produce delivery.'
                : 'ഉൽപ്പന്നങ്ങൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തിയ ശേഷം മാത്രമേ തുക കർഷകന് റിലീസ് ചെയ്യുകയുള്ളൂ.'}
            </span>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={() => onNavigate('chat', listing)}
            className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-md"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{t.chatWithFarmer}</span>
          </Button>

          {listing.negotiable && (
            <Button
              onClick={() => onNavigate('chat', listing)}
              variant="outline"
              className="w-full h-12 border-2 border-amber-600 text-amber-700 hover:bg-amber-50 text-sm font-bold flex items-center justify-center gap-2"
            >
              <IndianRupee className="h-4 w-4 text-amber-600" />
              <span>{t.makeOffer}</span>
            </Button>
          )}

          <Button
            onClick={() => onNavigate('payment-escrow', listing)}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-lg"
          >
            <CreditCard className="h-5 w-5" />
            <span>{t.buyNow} (₹{totalValue.toLocaleString()})</span>
          </Button>

          <Button
            onClick={() => setShowQR(true)}
            variant="outline"
            className="w-full h-11 border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-2"
          >
            <QrCode className="h-4 w-4 text-emerald-600" />
            <span>{language === 'en' ? 'Show Market Stall QR Sign' : 'മാർക്കറ്റ് സ്റ്റാൾ ക്യുആർ കോഡ് കാണിക്കുക'}</span>
          </Button>
        </div>
      </div>

      {/* Produce QR Code Modal */}
      <ProduceQRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        listing={listing}
        language={language}
      />
    </div>
  );
}
