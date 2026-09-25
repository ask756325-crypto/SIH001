import React, { useState, useRef, useEffect } from 'react';
import {
  Sprout,
  Globe,
  LogOut,
  ShieldCheck,
  Wifi,
  WifiOff,
  Sparkles,
  Bell,
  MapPin,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { Language, User } from '../../types';
import { userNamesMap } from '../../data/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user: User | null;
  onLogout?: () => void;
  isOnline?: boolean;
  onOpenAIStudio?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenPriceAlerts?: () => void;
  currentLocation?: string | null;
  onDetectLocation?: () => void;
  isDetectingLocation?: boolean;
}

const LANGUAGES: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
];

export function Header({
  language,
  onLanguageChange,
  user,
  onLogout,
  isOnline = true,
  onOpenAIStudio,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenPriceAlerts,
  currentLocation,
  onDetectLocation,
  isDetectingLocation = false,
}: HeaderProps) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserDisplayName = (name: string): string => {
    if (userNamesMap[name]) {
      const entry = (userNamesMap[name] as any)[language];
      if (entry) return entry;
    }
    return name;
  };

  const getRoleLabel = () => {
    if (user?.type === 'farmer') {
      switch (language) {
        case 'ml': return 'പരിശോധിച്ച കർഷകൻ';
        case 'hi': return 'सत्यापित किसान';
        case 'te': return 'ధృవీకరించబడిన రైతు';
        default: return 'Verified Farmer';
      }
    } else {
      switch (language) {
        case 'ml': return 'പരിശോധിച്ച വാങ്ങുന്നയാൾ';
        case 'hi': return 'सत्यापित खरीदार';
        case 'te': return 'ధృవీకరించబడిన కొనుగోలుదారు';
        default: return 'Verified Buyer';
      }
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-green-700/20 bg-emerald-700 px-3 sm:px-6 py-2.5 text-white shadow-md">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm shadow-xs">
          <Sprout className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-none">
            {language === 'ml' ? 'ഫാം ഡയറക്ട്' : language === 'hi' ? 'फार्मडायरेक्ट' : language === 'te' ? 'ఫార్మ్‌డైరెక్ట్' : 'FarmDirect'}
          </span>
          <span className="text-[10px] text-emerald-200/90 tracking-wide font-medium">
            {language === 'ml' ? 'നേരിട്ടുള്ള വിപണി' : language === 'hi' ? 'सीधा कृषि बाज़ार' : language === 'te' ? 'నేరుగా వ్యవసాయ విపణి' : 'Direct Market Access'}
          </span>
        </div>
      </div>

      {/* Zone 2: User Status & Location & Trust */}
      {user && (
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-medium text-emerald-100 border border-emerald-600/40">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span>{getRoleLabel()}</span>
            <span className="text-emerald-400">·</span>
            <span className="font-semibold text-white">{getUserDisplayName(user.name)}</span>
          </div>

          {/* Location status badge */}
          {onDetectLocation && (
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="flex items-center gap-1.5 rounded-full bg-emerald-900/60 hover:bg-emerald-800/90 px-3 py-1 text-xs text-emerald-100 border border-emerald-600/30 transition-colors cursor-pointer"
              title="Detect Live GPS Location"
            >
              <Navigation className={`h-3 w-3 text-emerald-300 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span className="max-w-[130px] truncate text-[11px] font-medium">
                {currentLocation || (language === 'ml' ? 'ലൊക്കേഷൻ' : language === 'hi' ? 'स्थान' : language === 'te' ? 'ప్రాంతం' : 'Live GPS')}
              </span>
            </button>
          )}

          <div className="flex items-center gap-1 text-[11px] text-emerald-200">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-300">
                <Wifi className="h-3 w-3" />
                <span>Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Zone 3: Actions (Notifications + Price Alerts + AI Studio + Language dropdown + Logout) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Real-Time Notification Bell */}
        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-800/70 text-emerald-100 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
            title="Notifications & Price Alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-emerald-700 animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        {/* AI Creative Studio */}
        {onOpenAIStudio && (
          <button
            onClick={onOpenAIStudio}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300/40 bg-gradient-to-r from-amber-500/20 to-emerald-800/80 px-2 sm:px-3 py-1.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/30 cursor-pointer shadow-xs"
            title="AI Creative Studio"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span className="hidden xs:inline sm:inline">AI Studio</span>
          </button>
        )}

        {/* 4-Language Dropdown Selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-800/70 px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
            title="Select Language"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-300" />
            <span>{currentLangObj.nativeName}</span>
            <ChevronDown className="h-3 w-3 text-emerald-300" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white shadow-xl border border-emerald-100 py-1.5 text-gray-800 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                Choose Language
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                    language === lang.code
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out */}
        {user && onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-800/40 p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium text-emerald-100 transition-colors hover:bg-red-600 hover:text-white cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {language === 'ml' ? 'ലോഗ് ഔട്ട്' : language === 'hi' ? 'लॉग आउट' : language === 'te' ? 'లాగ్ అవుట్' : 'Sign Out'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}

