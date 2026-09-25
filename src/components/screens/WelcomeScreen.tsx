import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Shield, CheckCircle2, Clock, Users, ArrowRight, Languages } from 'lucide-react';
import { Language, User, UserType } from '../../types';
import { authTranslations } from '../../data/translations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { signInWithGoogle } from '../../services/firebaseService';

interface WelcomeScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (type: UserType, aadharNumber: string, googleUser?: User) => void;
}

export function WelcomeScreen({
  language,
  onLanguageChange,
  onLoginSuccess,
}: WelcomeScreenProps) {
  const [step, setStep] = useState<'select' | 'aadhar' | 'otp'>('select');
  const [userType, setUserType] = useState<UserType>('farmer');
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const t = authTranslations[language];

  const handleRoleSelect = (type: UserType) => {
    setUserType(type);
    setStep('aadhar');
    setError('');
  };

  const handleVerifyAadhar = async () => {
    const cleanNum = aadharNumber.replace(/[\s-]/g, '');
    if (cleanNum.length < 12) {
      setError(t.invalidAadhar);
      return;
    }
    setIsVerifying(true);
    setError('');
    // Simulate government Aadhar verification
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsVerifying(false);
    setStep('otp');
  };

  const handleOtpLogin = () => {
    if (otp.length === 4) {
      onLoginSuccess(userType, aadharNumber);
    }
  };

  const handleQuickDemoFill = () => {
    setAadharNumber('1234-5678-9012');
    setError('');
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsVerifying(true);
      setError('');
      const loggedInUser = await signInWithGoogle();
      if (loggedInUser) {
        onLoginSuccess(loggedInUser.type, loggedInUser.aadharNumber || 'Aadhar-Verified', loggedInUser);
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setError(language === 'en' ? 'Google sign-in completed or simulated.' : 'ഗൂഗിൾ ലോഗിൻ പൂർത്തിയാക്കി.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 overflow-hidden font-sans">
      {/* Decorative animated ambient glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-2xl"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-72 h-72 bg-emerald-300/10 rounded-full blur-2xl"
          animate={{ y: [0, 40, 0], x: [0, -25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"
          animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Language Switcher in top corner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-full bg-black/25 p-1 backdrop-blur-md border border-white/20 shadow-lg"
      >
        <div className="flex items-center px-2 py-1 text-white/80">
          <Languages className="h-3.5 w-3.5 mr-1 text-emerald-300" />
        </div>
        {[
          { code: 'en' as const, label: 'EN' },
          { code: 'ml' as const, label: 'മലയാളം' },
          { code: 'hi' as const, label: 'हिन्दी' },
          { code: 'te' as const, label: 'తెలుగు' },
        ].map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              language === lang.code
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </motion.div>

      {/* Hero Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-8 z-10 max-w-lg"
      >
        <div className="mb-4 flex justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 p-4 backdrop-blur-md border border-white/30 shadow-xl"
          >
            <Sprout className="h-12 w-12 text-white" />
          </motion.div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
          {t.appTitle}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-emerald-100 font-medium drop-shadow">
          {t.subtitle}
        </p>
      </motion.div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/40 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="text-center pb-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      {language === 'en' ? 'Select Your Account Type' : 'അക്കൗണ്ട് തരം തിരഞ്ഞെടുക്കുക'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'en'
                        ? 'Direct connection, zero middleman commission'
                        : 'ഇടനിലക്കാരില്ലാതെ നേരിട്ട് ഇടപാടുകൾ'}
                    </p>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleRoleSelect('farmer')}
                      className="w-full h-18 bg-emerald-600 hover:bg-emerald-700 text-white text-xl flex items-center justify-between px-6 font-bold shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <Sprout className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-bold">{t.farmerLogin}</div>
                          <div className="text-xs font-normal text-emerald-100">
                            {language === 'en' ? 'Sell produce directly' : 'ഉൽപ്പന്നങ്ങൾ വിൽക്കുക'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </motion.div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 tracking-wider">
                      {t.or}
                    </span>
                    <div className="flex-grow border-t border-gray-200" />
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleRoleSelect('buyer')}
                      variant="outline"
                      className="w-full h-18 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xl flex items-center justify-between px-6 font-bold shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-emerald-700" />
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-bold">{t.buyerLogin}</div>
                          <div className="text-xs font-normal text-emerald-600">
                            {language === 'en' ? 'Source fresh harvests' : 'പുതിയ വിളവുകൾ വാങ്ങുക'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-emerald-600" />
                    </Button>
                  </motion.div>

                  {/* Google Sign-in with Firebase Auth */}
                  <div className="relative my-3 pt-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500 font-semibold">
                        {language === 'en' ? 'Or login securely with' : 'അല്ലെങ്കിൽ'}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isVerifying}
                    variant="outline"
                    className="w-full h-12 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2.5 font-bold text-gray-700 shadow-2xs cursor-pointer"
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{language === 'en' ? 'Sign in with Google (Firebase)' : 'ഗൂഗിൾ ലോഗിൻ (ഫയർബേസ്)'}</span>
                  </Button>
                </CardContent>
              </motion.div>
            )}

            {step === 'aadhar' && (
              <motion.div
                key="aadhar"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl flex items-center justify-center gap-2 text-emerald-800">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <span>{userType === 'farmer' ? t.farmerLogin : t.buyerLogin}</span>
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {language === 'en'
                      ? 'Government UIDAI verified identity'
                      : 'ഗവൺമെന്റ് പരിശോധിച്ച തിരിച്ചറിയൽ'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        {t.aadharNumber}
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickDemoFill}
                        className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        {language === 'en' ? 'Use Demo Aadhar' : 'ഡെമോ നമ്പർ ഉപയോഗിക്കുക'}
                      </button>
                    </div>
                    <Input
                      type="text"
                      placeholder={t.aadharPlaceholder}
                      value={aadharNumber}
                      onChange={(e) => {
                        setAadharNumber(e.target.value);
                        setError('');
                      }}
                      className="text-lg h-14 text-center tracking-widest font-mono font-semibold border-2 border-gray-300 focus-visible:border-emerald-500"
                      maxLength={14}
                    />
                    {error && (
                      <p className="text-xs font-medium text-red-600 mt-2">{error}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleVerifyAadhar}
                    disabled={!aadharNumber || isVerifying}
                    className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-md flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <Clock className="h-5 w-5 animate-spin" />
                        <span>{t.verifying}</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        <span>{t.verifyAadhar}</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setStep('select')}
                    variant="ghost"
                    className="w-full text-sm font-medium text-gray-600"
                  >
                    {t.back}
                  </Button>
                </CardContent>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl flex items-center justify-center gap-2 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>{t.enterOTP}</span>
                  </CardTitle>
                  <p className="text-xs text-gray-500">{t.otpSentToAadhar}</p>
                  <p className="text-xs font-mono font-medium text-emerald-700">
                    Aadhar: ****-****-{aadharNumber.replace(/[\s-]/g, '').slice(-4) || '9012'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-2">
                  <div>
                    <Input
                      type="number"
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.slice(0, 4))}
                      className="text-3xl h-16 text-center tracking-[0.5em] font-mono font-bold border-2 border-emerald-400"
                      maxLength={4}
                      autoFocus
                    />
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-500">
                        {language === 'en' ? 'Demo OTP code:' : 'ഡെമോ OTP കോഡ്:'}{' '}
                        <strong className="text-emerald-700 font-mono">1234</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp('1234')}
                        className="font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        {language === 'en' ? 'Auto Fill' : 'ഓട്ടോ ഫിൽ'}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleOtpLogin}
                    disabled={otp.length !== 4}
                    className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-md"
                  >
                    {t.login}
                  </Button>

                  <Button
                    onClick={() => setStep('aadhar')}
                    variant="ghost"
                    className="w-full text-sm font-medium text-gray-600"
                  >
                    {t.back}
                  </Button>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* UIDAI Security Banner */}
        <div className="mt-6 text-center text-xs text-white/90 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/20 px-3.5 py-2">
            <Shield className="h-4 w-4 text-emerald-300" />
            <span>
              {language === 'en'
                ? 'Government-Verified Direct Trade Network'
                : 'സർക്കാർ അംഗീകൃത നേരിട്ടുള്ള വ്യാപാര ശൃംഖല'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
