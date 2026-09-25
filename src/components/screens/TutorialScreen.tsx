import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Store,
  MessageCircle,
  Shield,
  Truck,
  TrendingUp,
  Star,
  Smartphone,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Language, User } from '../../types';
import { tutorialTranslations } from '../../data/translations';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

const tutorialIconMap: Record<string, React.ElementType> = {
  Users,
  Store,
  MessageCircle,
  Shield,
  Truck,
  TrendingUp,
  Star,
  Smartphone,
  IndianRupee,
};

interface TutorialScreenProps {
  language: Language;
  user: User;
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialScreen({
  language,
  user,
  onComplete,
  onSkip,
}: TutorialScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showFeaturesSummary, setShowFeaturesSummary] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const t = tutorialTranslations[language];
  const steps = t.steps[user.type] || t.steps.farmer;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const StepIcon = tutorialIconMap[currentStep?.icon] || Store;

  const handleNext = () => {
    if (isLastStep) {
      setShowFeaturesSummary(true);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (showFeaturesSummary) {
      setShowFeaturesSummary(false);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    onComplete();
  };

  if (showFeaturesSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  {t.features.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {language === 'en'
                    ? 'All features engineered specifically for Andhra Pradesh rural and commercial markets'
                    : 'ആന്ധ്ര പ്രദേശിലെ കർഷകർക്കും വാങ്ങുന്നവർക്കുമായി പ്രത്യേകം രൂപകൽപ്പന ചെയ്ത സവിശേഷതകൾ'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {t.features.items.map((item, idx) => {
                  const ItemIcon = tutorialIconMap[item.icon] || Store;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-start space-x-3.5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-100"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                        <ItemIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{t.previous}</span>
                </Button>

                <Button
                  onClick={handleFinish}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-8 text-base font-bold shadow-md"
                >
                  <span>{t.getStarted}</span>
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 overflow-hidden">
          {/* Top progress and controls */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {language === 'en' ? 'Step' : 'ഘട്ടം'} {currentStepIndex + 1} / {steps.length}
              </span>
              <div className="flex gap-1.5 ml-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentStepIndex
                        ? 'w-6 bg-emerald-600'
                        : i < currentStepIndex
                        ? 'w-2 bg-emerald-400'
                        : 'w-2 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-2 rounded-full border text-xs cursor-pointer transition-colors ${
                  isAudioEnabled
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
                title={isAudioEnabled ? 'Voice guide enabled' : 'Enable voice narration'}
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={onSkip}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2 py-1 rounded cursor-pointer"
              >
                {t.skip}
              </button>
            </div>
          </div>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-inner">
                  <StepIcon className="h-12 w-12" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {currentStep.title}
                </h2>
                <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                  {currentStep.description}
                </p>

                {/* Practical Tip Card */}
                {currentStep.tips && currentStep.tips.length > 0 && (
                  <div className="mx-auto max-w-md rounded-xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-left text-xs text-amber-900 flex items-start gap-2.5 mb-6">
                    <span className="font-bold text-amber-700 shrink-0">
                      {language === 'en' ? 'Pro Tip:' : 'പ്രത്യേക സൂചന:'}
                    </span>
                    <div className="space-y-1">
                      {currentStep.tips.map((tip, idx) => (
                        <div key={idx}>• {tip}</div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                variant="outline"
                className="flex items-center gap-1.5 text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{t.previous}</span>
              </Button>

              <Button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-6 text-sm font-bold shadow-md"
              >
                <span>{isLastStep ? t.complete : t.next}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
