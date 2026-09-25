import React from 'react';
import { Bell, CheckCheck, Trash2, X, Sparkles, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { AppNotification, Language, ProduceItem } from '../../types';
import { cropNamesMap } from '../../data/translations';
import { Button } from '../ui/Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectListing: (produceId: string) => void;
  produceList?: ProduceItem[];
}

export function NotificationDrawer({
  isOpen,
  onClose,
  language,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSelectListing,
  produceList,
}: NotificationDrawerProps) {
  const isEn = language === 'en';

  const t = {
    en: {
      title: 'Notifications & Price Alerts',
      unread: 'unread',
      markRead: 'Mark all read',
      clearAll: 'Clear all',
      empty: 'No notifications right now',
      emptySub: 'Create price alerts to receive instant notifications on flash deals!',
      viewDeal: 'View Deal',
      close: 'Close',
    },
    ml: {
      title: 'അറിയിപ്പുകളും വില അലേർട്ടുകളും',
      unread: 'വായിക്കാത്തവ',
      markRead: 'എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക',
      clearAll: 'എല്ലാം മായ്ക്കുക',
      empty: 'ഇപ്പോൾ അറിയിപ്പുകളൊന്നുമില്ല',
      emptySub: 'വില കുറയുമ്പോൾ അറിയിപ്പുകൾ ലഭിക്കാൻ വില അലേർട്ടുകൾ സജ്ജമാക്കുക!',
      viewDeal: 'ഡീൽ കാണുക',
      close: 'അടയ്ക്കുക',
    },
    hi: {
      title: 'अधिसूचनाएं और मूल्य अलर्ट',
      unread: 'अपठित',
      markRead: 'सभी पढ़े गए चिह्नित करें',
      clearAll: 'सभी हटाएं',
      empty: 'अभी कोई सूचनाएं नहीं हैं',
      emptySub: 'सस्ते दामों की सूचना पाने के लिए मूल्य अलर्ट बनाएं!',
      viewDeal: 'सौदा देखें',
      close: 'बंद करें',
    },
    te: {
      title: 'నోటిఫికేషన్‌లు & ధర హెచ్చరికలు',
      unread: 'చదవనివి',
      markRead: 'అన్నీ చదివినట్లు గుర్తించు',
      clearAll: 'అన్నీ తొలగించు',
      empty: 'ప్రస్తుతం నోటిఫికేషన్‌లు ఏవీ లేవు',
      emptySub: 'ధరలు తగ్గినప్పుడు హెచ్చరికలు పొందడానికి ధర అలర్ట్‌లు సెట్ చేయండి!',
      viewDeal: 'ఆఫర్ చూడండి',
      close: 'మూసివేయి',
    },
  }[language] || {
    title: 'Notifications & Price Alerts',
    unread: 'unread',
    markRead: 'Mark all read',
    clearAll: 'Clear all',
    empty: 'No notifications right now',
    emptySub: 'Create price alerts to receive instant notifications on flash deals!',
    viewDeal: 'View Deal',
    close: 'Close',
  };

  const getTranslatedCrop = (name?: string): string => {
    if (!name) return '';
    if (cropNamesMap[name]) {
      const entry = (cropNamesMap[name] as any)[language];
      if (entry) return entry;
    }
    return name;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <Bell className="h-4 w-4 text-amber-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{t.title}</h3>
              <p className="text-[11px] text-emerald-200">
                {unreadCount} {t.unread}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Toolbar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 bg-slate-50 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllAsRead}
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>{t.markRead}</span>
            </button>
            <button
              onClick={onClearAll}
              className="text-gray-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.clearAll}</span>
            </button>
          </div>
        )}

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Bell className="h-8 w-8 text-gray-300" />
              </div>
              <h4 className="font-bold text-sm text-gray-700">{t.empty}</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">{t.emptySub}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const matchedListing = produceList?.find((p) => p.id === n.produceId);

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !n.read
                      ? 'border-emerald-300 bg-emerald-50/70 shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                      <TrendingDown className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-xs text-gray-900 truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {n.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed mb-2">
                        {n.message}
                      </p>

                      {n.produceId && (
                        <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                          {n.currentPrice && (
                            <span className="text-xs font-black text-emerald-800">
                              ₹{n.currentPrice}/kg
                            </span>
                          )}

                          <Button
                            onClick={() => {
                              onSelectListing(n.produceId!);
                              onClose();
                            }}
                            size="sm"
                            className="h-7 px-2.5 text-[11px] font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <span>{t.viewDeal}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
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
