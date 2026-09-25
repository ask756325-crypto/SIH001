import React, { useState } from 'react';
import { Bell, BellRing, Plus, Trash2, X, TrendingDown, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { GovernmentPrice, Language, PriceAlert, ProduceItem } from '../../types';
import { cropNamesMap } from '../../data/translations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  alerts: PriceAlert[];
  onAddAlert: (cropName: string, targetPrice: number) => void;
  onDeleteAlert: (alertId: string) => void;
  onToggleAlert: (alertId: string) => void;
  availableCrops: string[];
  governmentPrices?: GovernmentPrice[];
  produceList?: ProduceItem[];
  preselectedCrop?: string;
}

export function PriceAlertModal({
  isOpen,
  onClose,
  language,
  alerts,
  onAddAlert,
  onDeleteAlert,
  onToggleAlert,
  availableCrops,
  governmentPrices,
  produceList,
  preselectedCrop,
}: PriceAlertModalProps) {
  const [selectedCrop, setSelectedCrop] = useState<string>(preselectedCrop || availableCrops[0] || 'Tomato');
  const [targetPrice, setTargetPrice] = useState<string>('20');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (preselectedCrop) {
      setSelectedCrop(preselectedCrop);
    }
  }, [preselectedCrop, isOpen]);

  const t = {
    en: {
      title: 'Real-Time Price Alerts',
      subtitle: 'Get notified immediately when crop prices drop to your target',
      createAlert: 'Create New Alert',
      crop: 'Crop',
      targetPrice: 'Target Price (₹/kg)',
      targetPriceHelp: 'We will notify you the moment a verified farmer posts at or below this price.',
      currentMandiRate: 'Current APMC Mandi Rate:',
      lowestMarketRate: 'Lowest FarmDirect Live Listing:',
      setAlertBtn: 'Set Price Alert',
      yourAlerts: 'Your Active Price Alerts',
      noAlerts: 'No price alerts set yet. Create one above to catch flash deals!',
      active: 'Active',
      inactive: 'Paused',
      delete: 'Delete',
      triggered: 'Matched Deal!',
      close: 'Close',
    },
    ml: {
      title: 'തത്സമയ വില അലേർട്ടുകൾ',
      subtitle: 'വില നിങ്ങളുടെ ലക്ഷ്യത്തിൽ എത്തുമ്പോൾ ഉടൻ അറിയിപ്പ് നേടുക',
      createAlert: 'പുതിയ അലേർട്ട് സജ്ജീകരിക്കുക',
      crop: 'വിള',
      targetPrice: 'ലക്ഷ്യ വില (₹/കിലോ)',
      targetPriceHelp: 'ഈ വിലയിലോ അതിൽ താഴെയോ വിള വരുമ്പോൾ ഞങ്ങൾ നിങ്ങളെ അറിയിക്കും.',
      currentMandiRate: 'നിലവിലെ മാർക്കറ്റ് നിരക്ക്:',
      lowestMarketRate: 'ഏറ്റവും കുറഞ്ഞ ലൈവ് വില:',
      setAlertBtn: 'അലേർട്ട് സജ്ജമാക്കുക',
      yourAlerts: 'നിങ്ങളുടെ സജീവ അലേർട്ടുകൾ',
      noAlerts: 'ഇതുവരെ അലേർട്ടുകളൊന്നും സജ്ജീകരിച്ചിട്ടില്ല.',
      active: 'സജീവം',
      inactive: 'താൽക്കാലികമായി നിർത്തി',
      delete: 'നീക്കം ചെയ്യുക',
      triggered: 'ഡീൽ ലഭ്യം!',
      close: 'അടയ്ക്കുക',
    },
    hi: {
      title: 'रीयल-टाइम मूल्य अलर्ट',
      subtitle: 'जब फसल की कीमत आपके लक्ष्य तक गिरे तो तुरंत सूचना पाएं',
      createAlert: 'नया अलर्ट बनाएं',
      crop: 'फसल',
      targetPrice: 'लक्षित मूल्य (₹/किग्रा)',
      targetPriceHelp: 'जब कोई किसान इस भाव या इससे कम पर फसल डालेगा, आपको तुरंत सूचना मिलेगी।',
      currentMandiRate: 'वर्तमान मंडी भाव:',
      lowestMarketRate: 'सबसे कम लाइव फार्म भाव:',
      setAlertBtn: 'प्राइस अलर्ट सेट करें',
      yourAlerts: 'आपके सक्रिय अलर्ट',
      noAlerts: 'कोई मूल्य अलर्ट सेट नहीं है। छूट पाने के लिए ऊपर से बनाएं!',
      active: 'सक्रिय',
      inactive: 'रोका गया',
      delete: 'हटाएं',
      triggered: 'सस्ता सौदा उपलब्ध!',
      close: 'बंद करें',
    },
    te: {
      title: 'రియల్-టైమ్ ధర హెచ్చరికలు',
      subtitle: 'పంట ధర మీ లక్ష్యానికి తగ్గినప్పుడు వెంటనే నోటిఫికేషన్ పొందండి',
      createAlert: 'కొత్త హెచ్చరికను సెట్ చేయండి',
      crop: 'పంట',
      targetPrice: 'టార్గెట్ ధర (₹/కేజీ)',
      targetPriceHelp: 'రైతు ఈ ధరకు లేదా అంతకంటే తక్కువకు లిస్ట్ చేసిన వెంటనే మీకు హెచ్చరిక వస్తుంది.',
      currentMandiRate: 'ప్రస్తుత మార్కెట్ రేటు:',
      lowestMarketRate: 'అతి తక్కువ లైవ్ రేటు:',
      setAlertBtn: 'ధర అలర్ట్ సెట్ చేయండి',
      yourAlerts: 'మీ క్రియాశీల అలర్ట్‌లు',
      noAlerts: 'ధర అలర్ట్‌లు ఏవీ లేవు. తక్కువ ధరకు కొనడానికి పైనుండి సెట్ చేయండి!',
      active: 'క్రియాశీలం',
      inactive: 'పాజ్ చేయబడింది',
      delete: 'తొలగించండి',
      triggered: 'మంచి ఆఫర్ లభ్యం!',
      close: 'మూసివేయి',
    },
  }[language] || {
    title: 'Real-Time Price Alerts',
    subtitle: 'Get notified immediately when crop prices drop to your target',
    createAlert: 'Create New Alert',
    crop: 'Crop',
    targetPrice: 'Target Price (₹/kg)',
    targetPriceHelp: 'We will notify you the moment a verified farmer posts at or below this price.',
    currentMandiRate: 'Current APMC Mandi Rate:',
    lowestMarketRate: 'Lowest FarmDirect Live Listing:',
    setAlertBtn: 'Set Price Alert',
    yourAlerts: 'Your Active Price Alerts',
    noAlerts: 'No price alerts set yet. Create one above to catch flash deals!',
    active: 'Active',
    inactive: 'Paused',
    delete: 'Delete',
    triggered: 'Matched Deal!',
    close: 'Close',
  };

  const getTranslatedCrop = (name: string): string => {
    if (cropNamesMap[name]) {
      const entry = (cropNamesMap[name] as any)[language];
      if (entry) return entry;
    }
    return name;
  };

  // Find reference rates for selected crop
  const mandiRate = governmentPrices?.find((g) => g.cropName.toLowerCase() === selectedCrop.toLowerCase());
  const lowestListing = produceList
    ?.filter((p) => p.cropName.toLowerCase() === selectedCrop.toLowerCase() && p.status === 'available')
    .sort((a, b) => a.pricePerKg - b.pricePerKg)[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPrice);
    if (!priceNum || priceNum <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    onAddAlert(selectedCrop, priceNum);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-emerald-100 overflow-hidden text-gray-900 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-800 to-teal-800 p-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <BellRing className="h-5 w-5 text-amber-300 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">{t.title}</h3>
              <p className="text-xs text-emerald-100">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Create Alert Form */}
          <form onSubmit={handleSubmit} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-emerald-700" />
              <span>{t.createAlert}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.crop}</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 shadow-2xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {availableCrops.map((c) => (
                    <option key={c} value={c}>
                      {getTranslatedCrop(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.targetPrice}</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={targetPrice}
                  onChange={(e) => {
                    setTargetPrice(e.target.value);
                    setError('');
                  }}
                  className="h-10 text-xs font-bold bg-white"
                  placeholder="e.g. 22"
                  required
                />
              </div>
            </div>

            {/* Reference Market Benchmarks */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-600 bg-white/80 rounded-lg p-2.5 border border-emerald-100/80 gap-2">
              <div>
                <span className="text-gray-500">{t.currentMandiRate} </span>
                <span className="font-bold text-amber-700">
                  {mandiRate ? `₹${mandiRate.averagePrice}/kg` : '₹25/kg'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">{t.lowestMarketRate} </span>
                <span className="font-bold text-emerald-700">
                  {lowestListing ? `₹${lowestListing.pricePerKg}/kg` : 'No live listing'}
                </span>
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

            <Button
              type="submit"
              className="w-full h-10 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bell className="h-4 w-4" />
              <span>{t.setAlertBtn}</span>
            </Button>
          </form>

          {/* List of Active Alerts */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {t.yourAlerts} ({alerts.length})
              </h4>
            </div>

            {alerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p>{t.noAlerts}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => {
                  const matchingListing = produceList?.find(
                    (p) =>
                      p.cropName.toLowerCase() === alert.cropName.toLowerCase() &&
                      p.pricePerKg <= alert.targetPrice &&
                      p.status === 'available'
                  );

                  return (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        matchingListing
                          ? 'border-emerald-300 bg-emerald-50/80 shadow-xs'
                          : alert.active
                          ? 'border-gray-200 bg-white'
                          : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            matchingListing
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <TrendingDown className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">
                              {getTranslatedCrop(alert.cropName)}
                            </span>
                            <span className="text-xs font-extrabold text-emerald-800">
                              ≤ ₹{alert.targetPrice}/kg
                            </span>
                            {matchingListing && (
                              <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-bold animate-pulse">
                                {t.triggered} (₹{matchingListing.pricePerKg}/kg)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            Created: {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleAlert(alert.id)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                            alert.active
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          }`}
                        >
                          {alert.active ? t.active : t.inactive}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={t.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-xs border-gray-300 text-gray-700 px-4"
          >
            {t.close}
          </Button>
        </div>
      </div>
    </div>
  );
}
