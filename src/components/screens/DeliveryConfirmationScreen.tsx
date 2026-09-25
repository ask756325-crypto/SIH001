import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Truck,
  CheckCircle,
  Clock,
  Phone,
  Star,
  Shield,
  MessageSquare,
  AlertCircle,
  Package,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Language, ProduceItem, User } from '../../types';
import {
  deliveryTranslations,
  cropNamesMap,
  userNamesMap,
  villageNamesMap,
} from '../../data/translations';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Switch';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface DeliveryConfirmationScreenProps {
  language: Language;
  user: User;
  listing: ProduceItem;
  onNavigate: (screen: string) => void;
  onComplete: () => void;
}

export function DeliveryConfirmationScreen({
  language,
  user,
  listing,
  onNavigate,
  onComplete,
}: DeliveryConfirmationScreenProps) {
  const [isDelivered, setIsDelivered] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const t = deliveryTranslations[language];

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

  const handleConfirmDelivery = () => {
    setIsDelivered(true);
    setIsCompleted(true);
  };

  const handleFinishReview = () => {
    onComplete();
  };

  // Feedback & Payout Release Completed Screen
  if (isCompleted) {
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
                <h2 className="text-2xl font-bold text-emerald-800">{t.paymentReleased}</h2>
                <p className="text-xs text-gray-500 mt-1">{t.thankYou}</p>
                <p className="text-sm font-bold text-emerald-700 mt-2">
                  ₹{totalAmount.toLocaleString()} {language === 'en' ? 'transferred to farmer' : 'കർഷകന് കൈമാറി'}
                </p>
              </div>

              {/* Star Rating Feedback */}
              <div className="rounded-xl bg-slate-50 p-4 border border-gray-200 text-center space-y-3">
                <h3 className="font-bold text-sm text-gray-800">{t.rateExperience}</h3>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-left mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {t.writeReview}
                  </label>
                  <Textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value.slice(0, 200))}
                    placeholder={t.reviewPlaceholder}
                    rows={3}
                    className="text-xs"
                  />
                  <div className="text-[10px] text-gray-400 text-right mt-1">
                    {review.length}/200
                  </div>
                </div>
              </div>

              <Button
                onClick={handleFinishReview}
                className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
              >
                {t.done}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-4 shadow-md sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-emerald-300" />
            <h1 className="text-lg font-bold tracking-tight">{t.delivery}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Status Tracker */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-gray-100 pb-3">
            <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <span>{t.orderStatus}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {/* Step 1: Escrow Held */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{t.paymentHeld}</div>
                  <div className="text-[11px] text-gray-500">₹{totalAmount.toLocaleString()} in secure holding</div>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold text-xs">
                {language === 'en' ? 'Protected' : 'സംരക്ഷിതം'}
              </Badge>
            </div>

            {/* Step 2: Produce Delivery */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{t.awaitingDelivery}</div>
                  <div className="text-[11px] text-gray-500">
                    {language === 'en' ? 'Direct transport from Andhra Pradesh farm' : 'ഫാമിൽ നിന്നും നേരിട്ട് ഡെലിവറി'}
                  </div>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold text-xs">
                {language === 'en' ? 'In Progress' : 'പുരോഗമിക്കുന്നു'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Farmer Dispatcher Profile */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-gray-100 pb-3">
            <CardTitle className="text-sm font-bold text-gray-800">
              {t.farmerDetails}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
                  {listing.farmerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {getTranslatedUser(listing.farmerName)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {getTranslatedVillage(listing.farmerVillage)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`Calling farmer ${listing.farmerName}...`)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{t.call}</span>
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
              <div className="font-semibold text-gray-800">{t.deliveryInstructions}</div>
              <p className="text-[11px] leading-relaxed">
                {language === 'en'
                  ? 'Please inspect the produce weight and quality upon handover before releasing the escrow payment.'
                  : 'ഉൽപ്പന്നങ്ങൾ കൈപ്പറ്റുന്നതിന് മുൻപ് തൂക്കവും ഗുണനിലവാരവും പരിശോധിച്ച് ഉറപ്പാക്കുക.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Checklist & Release Payout */}
        <Card className="border border-emerald-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-gray-900">{t.confirmDelivery}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{t.confirmationText}</p>
              </div>
            </div>

            <Button
              onClick={handleConfirmDelivery}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg cursor-pointer"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{t.confirmButton}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
