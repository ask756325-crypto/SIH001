import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Sparkles,
  MapPin,
  IndianRupee,
  Package,
  Navigation,
} from 'lucide-react';
import { GovernmentPrice, Language, ProduceItem, User } from '../../types';
import {
  addProduceTranslations,
  cropNamesMap,
  villageNamesMap,
} from '../../data/translations';
import { getCropImage } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { requestUserLocation } from '../../utils/geolocation';

interface AddProduceScreenProps {
  language: Language;
  user: User;
  governmentPrices: GovernmentPrice[];
  onNavigate: (screen: string) => void;
  onBack: () => void;
  onAddProduce: (item: Partial<ProduceItem>) => void;
}

const AVAILABLE_CROPS = [
  'Tomato',
  'Onion',
  'Potato',
  'Corn',
  'Cabbage',
  'Carrot',
  'Green Beans',
  'Rice',
  'Wheat',
  'Spinach',
  'Cauliflower',
  'Brinjal',
  'Okra',
  'Cucumber',
  'Chili',
];

export function AddProduceScreen({
  language,
  user,
  governmentPrices,
  onNavigate,
  onBack,
  onAddProduce,
}: AddProduceScreenProps) {
  const [formData, setFormData] = useState({
    cropName: 'Tomato',
    customCrop: '',
    quantity: '',
    pricePerKg: '',
    location: user.village || 'Thiruvananthapuram',
    negotiable: true,
    photoTaken: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const t = addProduceTranslations[language];

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

  const selectedCrop = formData.cropName === 'Other' ? formData.customCrop : formData.cropName;
  const mandiRate = governmentPrices.find(
    (g) => g.cropName.toLowerCase() === selectedCrop.toLowerCase()
  );

  // Price comparison
  const priceEvaluation = (() => {
    if (!mandiRate || !formData.pricePerKg) return null;
    const price = parseFloat(formData.pricePerKg);
    if (isNaN(price)) return null;

    if (price <= mandiRate.averagePrice * 0.95) return 'below';
    if (price >= mandiRate.averagePrice * 1.05) return 'above';
    return 'fair';
  })();

  const handlePhotoCaptured = (dataUrl: string) => {
    setCustomPhotoUrl(dataUrl);
    setFormData((prev) => ({ ...prev, photoTaken: true }));
  };

  const handleDetectGPS = async () => {
    try {
      setIsDetectingLocation(true);
      setLocationError(null);
      const loc = await requestUserLocation();
      setFormData((prev) => ({ ...prev, location: loc.formattedText }));
      setGpsAccuracy(`GPS verified (±${Math.round(loc.coords.accuracy)}m)`);
    } catch (err: any) {
      console.warn('Geolocation error:', err);
      setLocationError(
        language === 'ml'
          ? 'ലൊക്കേഷൻ കണ്ടെത്താനായില്ല. ദയവായി അനുമതി നൽകുക.'
          : language === 'hi'
          ? 'स्थान प्राप्त नहीं हो सका। कृपया अनुमति दें।'
          : language === 'te'
          ? 'లొకేషన్ పొందలేకపోయాము. దయచేసి అనుమతి ఇవ్వండి.'
          : 'Unable to retrieve location. Please check browser permissions.'
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !formData.quantity || !formData.pricePerKg || !formData.location) {
      return;
    }

    const newProduce: Partial<ProduceItem> = {
      farmerId: user.id,
      farmerName: user.name,
      farmerVillage: formData.location,
      cropName: selectedCrop,
      quantity: parseInt(formData.quantity, 10),
      pricePerKg: parseFloat(formData.pricePerKg),
      negotiable: formData.negotiable,
      status: 'available',
      imageUrl: customPhotoUrl || getCropImage(selectedCrop),
      postedDate: new Date().toISOString().split('T')[0],
    };

    onAddProduce(newProduce);
    setIsSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="text-center shadow-xl border-emerald-100 overflow-hidden">
            <CardContent className="p-8">
              <div className="h-20 w-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-800 mb-2">{t.success}</h2>
              <p className="text-sm text-gray-600 mb-6">
                {language === 'en'
                  ? `Your ${getTranslatedCrop(selectedCrop)} listing is now broadcast directly to buyers across Andhra Pradesh.`
                  : `നിങ്ങളുടെ ${getTranslatedCrop(selectedCrop)} ലിസ്റ്റിംഗ് ഇപ്പോൾ ലൈവായി കാണാം.`}
              </p>

              <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2.5 text-left border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.cropName}:</span>
                  <span className="font-bold text-gray-800">{getTranslatedCrop(selectedCrop)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.quantity}:</span>
                  <span className="font-bold text-gray-800">{formData.quantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.pricePerKg}:</span>
                  <span className="font-bold text-emerald-700">₹{formData.pricePerKg} / kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'en' ? 'Total Value:' : 'മൊത്തം മൂല്യം:'}</span>
                  <span className="font-bold text-emerald-800">
                    ₹{(parseInt(formData.quantity || '0', 10) * parseFloat(formData.pricePerKg || '0')).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.negotiablePrice}:</span>
                  <span className="font-bold text-gray-800">{formData.negotiable ? t.yes : t.no}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-6 animate-pulse">
                {language === 'en' ? 'Redirecting to your dashboard...' : 'ഡാഷ്‌ബോർഡിലേക്ക് മാറ്റുന്നു...'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
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
            <h1 className="text-lg font-bold tracking-tight">{t.addProduce}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Crop Selection & Photo */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                <span>{language === 'en' ? 'Crop Information' : 'വിള വിവരങ്ങൾ'}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t.cropName} *
                </label>
                <select
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {AVAILABLE_CROPS.map((crop) => (
                    <option key={crop} value={crop}>
                      {getTranslatedCrop(crop)} ({crop})
                    </option>
                  ))}
                  <option value="Other">{t.customCrop}</option>
                </select>
              </div>

              {formData.cropName === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.cropNamePlaceholder} *
                  </label>
                  <Input
                    type="text"
                    value={formData.customCrop}
                    onChange={(e) => setFormData({ ...formData, customCrop: e.target.value })}
                    placeholder="e.g. Cardamom, Ginger, Pepper"
                    required
                  />
                </div>
              )}

              {/* Photo preview / live camera capture */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t.cropPhoto}
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-28 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0 shadow-inner">
                    <img
                      src={customPhotoUrl || getCropImage(selectedCrop)}
                      alt={selectedCrop}
                      className="h-full w-full object-cover"
                    />
                    {formData.photoTaken && (
                      <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      variant="outline"
                      size="sm"
                      className="text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Camera className="h-4 w-4 text-emerald-600" />
                      <span>{customPhotoUrl ? (language === 'ml' ? 'വീണ്ടും എടുക്കുക' : language === 'hi' ? 'दोबारा फोटो लें' : language === 'te' ? 'మళ్లీ తీయండి' : 'Retake Camera Photo') : t.takePhoto}</span>
                    </Button>
                    <p className="text-[11px] text-gray-500">
                      {language === 'ml'
                        ? 'ക്യാമറ ആക്‌സസ് ഉപയോഗിച്ച് പുതിയ വിളയുടെ ലൈവ് ചിത്രം എടുക്കുക'
                        : language === 'hi'
                        ? 'कैमरे से ताज़ी फसल की वास्तविक फोटो खींचें'
                        : language === 'te'
                        ? 'కెమెరా ద్వారా తాజా పంట లైవ్ ఫోటో తీయండి'
                        : 'Capture real-time photo of your fresh crop directly using device camera'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & APMC Mandi Guidance */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                <span>{language === 'en' ? 'Pricing & Quantity' : 'വിലയും അളവും'}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.quantity} *
                  </label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder={t.quantityPlaceholder}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.pricePerKg} *
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    placeholder={t.pricePlaceholder}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Andhra Pradesh Mandi Advisory Box */}
              {mandiRate && (
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-emerald-700" />
                      <span>{t.govtPrice} ({mandiRate.market})</span>
                    </span>
                    <span className="font-bold text-emerald-800">
                      ₹{mandiRate.minPrice} - ₹{mandiRate.maxPrice} / kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600 pt-1 border-t border-emerald-200/50">
                    <span>
                      {language === 'en' ? 'Mandi Average Rate:' : 'മാർക്കറ്റ് ശരാശരി:'}
                    </span>
                    <span className="font-bold text-gray-900">₹{mandiRate.averagePrice} / kg</span>
                  </div>

                  {priceEvaluation && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-gray-500 font-medium">{t.priceRecommendation}:</span>
                      {priceEvaluation === 'fair' && (
                        <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                          ✓ {t.fairPrice}
                        </span>
                      )}
                      {priceEvaluation === 'below' && (
                        <span className="rounded-md bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold">
                          ↓ {t.belowAvg} ({language === 'en' ? 'Fast sale' : 'പെട്ടെന്ന് വിൽക്കാം'})
                        </span>
                      )}
                      {priceEvaluation === 'above' && (
                        <span className="rounded-md bg-amber-600 text-white px-2 py-0.5 text-[10px] font-bold">
                          ↑ {t.aboveAvg} ({language === 'en' ? 'Premium grade' : 'പ്രീമിയം ഗുണനിലവാരം'})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Negotiable Price Switch */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{t.negotiablePrice}</div>
                  <div className="text-xs text-gray-500">
                    {language === 'en'
                      ? 'Allow buyers to propose custom offers in chat'
                      : 'വാങ്ങുന്നവർക്ക് ഓഫറുകൾ സമർപ്പിക്കാൻ അനുമതി'}
                  </div>
                </div>
                <Switch
                  checked={formData.negotiable}
                  onCheckedChange={(checked) => setFormData({ ...formData, negotiable: checked })}
                />
              </div>

              {/* Location with Real GPS Access */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    {t.location} *
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Navigation className={`h-3 w-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                    <span>
                      {isDetectingLocation
                        ? (language === 'ml' ? 'കണ്ടെത്തുന്നു...' : language === 'hi' ? 'खोज रहा है...' : language === 'te' ? 'కనుగొంటోంది...' : 'Detecting GPS...')
                        : (language === 'ml' ? 'ലൈവ് GPS കണ്ടെത്തുക' : language === 'hi' ? 'लाइव GPS स्थान लें' : language === 'te' ? 'లైవ్ GPS లొకేషన్' : 'Detect Live GPS')}
                    </span>
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t.locationPlaceholder}
                    className="pl-9"
                    required
                  />
                </div>
                {gpsAccuracy && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{gpsAccuracy}</span>
                  </p>
                )}
                {locationError && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1">
                    {locationError}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold shadow-lg cursor-pointer"
            >
              {t.postListing}
            </Button>
          </div>
        </form>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCaptured}
        language={language}
      />
    </div>
  );
}
