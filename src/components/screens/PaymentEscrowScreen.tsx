import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Lock,
  CheckCircle,
  Clock,
  Smartphone,
  Building,
  CheckCircle2,
  AlertCircle,
  Truck,
  IndianRupee,
} from 'lucide-react';
import { Language, ProduceItem, User } from '../../types';
import {
  paymentTranslations,
  cropNamesMap,
  userNamesMap,
  villageNamesMap,
} from '../../data/translations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface PaymentEscrowScreenProps {
  language: Language;
  user: User;
  listing: ProduceItem;
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export function PaymentEscrowScreen({
  language,
  user,
  listing,
  onNavigate,
  onBack,
}: PaymentEscrowScreenProps) {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [aadharNumber, setAadharNumber] = useState(user.aadharNumber || '');
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [isVerifyingAadhar, setIsVerifyingAadhar] = useState(false);
  const [aadharError, setAadharError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  const t = paymentTranslations[language];

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

  const totalAmount = listing.quantity * listing.pricePerKg;

  const handleVerifyAadhar = async () => {
    const cleanNum = aadharNumber.replace(/[\s-]/g, '');
    if (cleanNum.length < 12) {
      setAadharError(t.aadharInvalid);
      return;
    }
    setIsVerifyingAadhar(true);
    setAadharError('');
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsVerifyingAadhar(false);
    setIsAadharVerified(true);
  };

  const handleProcessPayment = async () => {
    if (!isAadharVerified) {
      setAadharError(
        language === 'en'
          ? 'Please verify your Aadhar authorization first'
          : 'ദയവായി ആധാർ നമ്പർ പരിശോധിച്ച് ഉറപ്പാക്കുക'
      );
      return;
    }
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsPaymentSuccess(true);
  };

  // Payment Success Screen
  if (isPaymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="text-center shadow-xl border-emerald-100 overflow-hidden">
            <CardContent className="p-8 space-y-4">
              <div className="h-20 w-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-emerald-800">{t.success}</h2>
                <p className="text-xs text-gray-500 mt-1">{t.escrowMsg}</p>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>{language === 'en' ? 'Escrow Protection Activated' : 'എസ്ക്രോ സുരക്ഷ സജീവം'}</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">{t.nextStep}</p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-gray-200 p-3.5 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.crop}:</span>
                  <span className="font-bold text-gray-800">{getTranslatedCrop(listing.cropName)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.quantity}:</span>
                  <span className="font-bold text-gray-800">{listing.quantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.totalAmount}:</span>
                  <span className="font-bold text-emerald-700">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={() => onNavigate('delivery-confirmation')}
                className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md mt-2"
              >
                <Truck className="h-4 w-4 mr-2" />
                <span>{t.viewDelivery}</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Processing Loading State
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="p-8 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-pulse">
              <Clock className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-blue-900">{t.processing}</h2>
            <p className="text-xs text-gray-500">
              {language === 'en'
                ? 'Securing escrow funds with bank-grade encryption...'
                : 'ബാങ്ക് നിലവാരമുള്ള സുരക്ഷയോടെ എസ്ക്രോയിലേക്ക് മാറ്റുന്നു...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-lg font-bold tracking-tight">{t.payment}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Escrow Shield Explainer */}
        <Card className="border border-blue-200 bg-blue-50/70 shadow-xs">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-blue-900">{t.escrowTitle}</h3>
              <p className="text-xs text-blue-800 mt-1 leading-relaxed">{t.escrowDesc}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-gray-100 pb-3">
            <CardTitle className="text-sm font-bold text-gray-800">
              {t.orderSummary}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-3 text-xs divide-y divide-gray-100">
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-500">{t.crop}:</span>
              <span className="font-bold text-gray-900 text-sm">{getTranslatedCrop(listing.cropName)}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5 pb-2">
              <span className="text-gray-500">{t.quantity}:</span>
              <span className="font-bold text-gray-900">{listing.quantity} {t.kg}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5 pb-2">
              <span className="text-gray-500">{t.pricePerKg}:</span>
              <span className="font-bold text-emerald-700">₹{listing.pricePerKg} / {t.kg}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5">
              <span className="text-sm font-bold text-gray-800">{t.totalAmount}:</span>
              <span className="text-xl font-black text-emerald-800">₹{totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-gray-100 pb-3">
            <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>{t.paymentMethod}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'upi', label: t.upi, icon: Smartphone },
                { id: 'card', label: t.card, icon: CreditCard },
                { id: 'netbanking', label: language === 'en' ? 'Net Banking' : 'നെറ്റ് ബാങ്കിംഗ്', icon: Building },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1.5" />
                    <span className="text-xs">{method.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'upi' && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-gray-700">
                  {t.upiId}
                </label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder={language === 'en' ? 'Enter UPI ID (e.g. buyer@upi)' : 'UPI ഐഡി നൽകുക'}
                  className="h-11"
                />
                <div className="flex gap-2 mt-2">
                  {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map((suf) => (
                    <button
                      key={suf}
                      type="button"
                      onClick={() => setUpiId((prev) => (prev ? prev.split('@')[0] + suf : 'buyer' + suf))}
                      className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded cursor-pointer"
                    >
                      {suf}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* UIDAI Aadhar Authorization */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-gray-100 pb-3">
            <CardTitle className="text-sm font-bold text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>{t.aadharVerification}</span>
              </span>
              {isAadharVerified && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>{t.aadharVerified}</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            <p className="text-xs text-gray-500">
              {language === 'en'
                ? 'Government UIDAI verified authorization for escrow funds release'
                : 'എസ്ക്രോ ഇടപാടുകൾക്കുള്ള സർക്കാർ ആധാർ പരിശോധന'}
            </p>

            <div className="flex gap-2">
              <Input
                type="text"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                placeholder={t.aadharPlaceholder}
                className="font-mono text-sm tracking-wider"
                maxLength={14}
              />
              <Button
                onClick={handleVerifyAadhar}
                disabled={isVerifyingAadhar || isAadharVerified}
                variant="outline"
                className="shrink-0 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                {isVerifyingAadhar ? t.verifyingAadhar : isAadharVerified ? '✓ Verified' : t.verifyAadhar}
              </Button>
            </div>

            {aadharError && <p className="text-xs font-semibold text-red-600">{aadharError}</p>}
          </CardContent>
        </Card>

        {/* Submit Payment CTA */}
        <div className="pt-2">
          <Button
            onClick={handleProcessPayment}
            disabled={!isAadharVerified}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg disabled:opacity-50"
          >
            <Lock className="h-5 w-5 mr-2" />
            <span>
              {t.payNow} (₹{totalAmount.toLocaleString()})
            </span>
          </Button>

          <p className="text-[11px] text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
            <Shield className="h-3 w-3 text-emerald-600" />
            <span>
              {language === 'en'
                ? 'Protected under Andhra Pradesh APMC Direct Farmer Act'
                : language === 'te'
                ? 'ఆంధ్రప్రదేశ్ APMC ప్రత్యక్ష రైతు చట్టం ప్రకారం రక్షించబడింది'
                : language === 'hi'
                ? 'आंध्र प्रदेश APMC प्रत्यक्ष किसान अधिनियम के तहत सुरक्षित'
                : 'ആന്ധ്ര പ്രദേശ് APMC കർഷക നിയമപ്രകാരം സംരക്ഷിക്കപ്പെട്ടത്'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
