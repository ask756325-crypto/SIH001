import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AppNotification,
  Language,
  PriceAlert,
  ProduceItem,
  ProduceStatus,
  Screen,
  User,
  UserType,
} from './types';
import { initialProduceListings, governmentPrices, initialUsers } from './data/mockData';
import { Header } from './components/common/Header';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { TutorialScreen } from './components/screens/TutorialScreen';
import { FarmerDashboard } from './components/screens/FarmerDashboard';
import { BuyerMarketplace } from './components/screens/BuyerMarketplace';
import { AddProduceScreen } from './components/screens/AddProduceScreen';
import { ListingDetailScreen } from './components/screens/ListingDetailScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { PaymentEscrowScreen } from './components/screens/PaymentEscrowScreen';
import { DeliveryConfirmationScreen } from './components/screens/DeliveryConfirmationScreen';
import { AIFarmStudioModal } from './components/common/AIFarmStudioModal';
import { PriceAlertModal } from './components/common/PriceAlertModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { requestUserLocation } from './utils/geolocation';
import {
  subscribeToProduceListings,
  seedInitialProduceIfEmpty,
  createProduceListingInDb,
  updateProduceStatusInDb,
  saveUserProfile,
  savePriceAlertInDb,
  deletePriceAlertFromDb,
  saveNotificationInDb,
} from './services/firebaseService';
import { Bell, ArrowRight, X } from 'lucide-react';

const INITIAL_ALERTS: PriceAlert[] = [
  {
    id: 'alert-tomato',
    buyerId: 'buyer-default',
    cropName: 'Tomato',
    targetPrice: 28,
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'alert-onion',
    buyerId: 'buyer-default',
    cropName: 'Onion',
    targetPrice: 32,
    createdAt: new Date().toISOString(),
    active: true,
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'price_alert',
    title: 'Price Drop Alert: Tomato!',
    message: 'Fresh country tomatoes in Thiruvananthapuram dropped to ₹26/kg, beating your target of ₹28/kg!',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    read: false,
    cropName: 'Tomato',
    targetPrice: 28,
    currentPrice: 26,
    produceId: 'prod-1',
  },
  {
    id: 'notif-2',
    type: 'system',
    title: 'Live GPS & Multilingual Support Activated',
    message: 'FarmDirect now supports English, മലയാളം, हिन्दी, and తెలుగు with real device camera and GPS location integration.',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    read: true,
  },
];

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [produceList, setProduceList] = useState<ProduceItem[]>(initialProduceListings);
  const [selectedListing, setSelectedListing] = useState<ProduceItem | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showAIStudio, setShowAIStudio] = useState<boolean>(false);

  // Price Alerts & Notifications state
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const stored = localStorage.getItem('farmdirect_price_alerts');
      return stored ? JSON.parse(stored) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem('farmdirect_notifications');
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState(false);
  const [preselectedAlertCrop, setPreselectedAlertCrop] = useState<string | undefined>();
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [activeToastAlert, setActiveToastAlert] = useState<{
    notification: AppNotification;
    item?: ProduceItem;
  } | null>(null);

  // Ref to prevent duplicate notifications during a session
  const notifiedCombosRef = useRef<Set<string>>(new Set());

  // Save alerts and notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('farmdirect_price_alerts', JSON.stringify(priceAlerts));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [priceAlerts]);

  useEffect(() => {
    try {
      localStorage.setItem('farmdirect_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [notifications]);

  // Real-time price monitoring system: check if market listings drop below target prices
  useEffect(() => {
    if (!produceList || produceList.length === 0) return;

    priceAlerts.forEach((alert) => {
      if (!alert.active) return;

      const matchingItem = produceList.find(
        (item) =>
          item.status === 'available' &&
          item.cropName.toLowerCase() === alert.cropName.toLowerCase() &&
          item.pricePerKg <= alert.targetPrice
      );

      if (matchingItem) {
        const comboKey = `${alert.id}_${matchingItem.id}_${matchingItem.pricePerKg}`;
        if (!notifiedCombosRef.current.has(comboKey)) {
          notifiedCombosRef.current.add(comboKey);

          const newNotif: AppNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: 'price_alert',
            title: `Price Drop: ${matchingItem.cropName}!`,
            message: `Fresh ${matchingItem.cropName} is available at ₹${matchingItem.pricePerKg}/kg in ${matchingItem.farmerVillage} (Your target: ₹${alert.targetPrice}/kg)!`,
            timestamp: new Date().toISOString(),
            read: false,
            cropName: matchingItem.cropName,
            targetPrice: alert.targetPrice,
            currentPrice: matchingItem.pricePerKg,
            produceId: matchingItem.id,
          };

          setNotifications((prev) => [newNotif, ...prev]);
          saveNotificationInDb(newNotif).catch(() => {});

          // Trigger prominent real-time banner toast
          setActiveToastAlert({ notification: newNotif, item: matchingItem });
        }
      }
    });
  }, [produceList, priceAlerts, user]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Seed initial produce to Firestore if empty, and listen to real-time changes
    seedInitialProduceIfEmpty(initialProduceListings);
    const unsubscribe = subscribeToProduceListings((items) => {
      if (items && items.length > 0) {
        setProduceList(items);
      }
    });

    // Deep link handler for physical market QR code scans
    const params = new URLSearchParams(window.location.search);
    const produceId = params.get('produce');
    if (produceId) {
      const item = initialProduceListings.find((p) => p.id === produceId);
      if (item) {
        setSelectedListing(item);
        setUser(initialUsers[10]); // Default buyer profile for instant access
        setCurrentScreen('listing-detail');
      }
    }

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoginSuccess = async (type: UserType, aadharNumber: string, googleUser?: User) => {
    let activeUser: User;
    if (googleUser) {
      activeUser = {
        ...googleUser,
        type,
        aadharNumber: aadharNumber || googleUser.aadharNumber,
      };
    } else {
      const matchedUser =
        initialUsers.find((u) => u.type === type) ||
        (type === 'farmer' ? initialUsers[0] : initialUsers[10]);

      activeUser = {
        ...matchedUser,
        aadharNumber: aadharNumber || matchedUser.aadharNumber,
      };
    }

    setUser(activeUser);
    saveUserProfile(activeUser).catch(() => {});

    const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${activeUser.id}`);
    if (!hasCompletedOnboarding) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen(type === 'farmer' ? 'farmer-dashboard' : 'buyer-marketplace');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedListing(null);
    setCurrentScreen('welcome');
  };

  const handleNavigate = (targetScreen: string, item?: ProduceItem) => {
    if (item) {
      setSelectedListing(item);
    }
    setCurrentScreen(targetScreen as Screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProduce = async (newProduce: Partial<ProduceItem>) => {
    const customId = `prod-${Date.now()}`;
    const item: ProduceItem = {
      id: customId,
      farmerId: user?.id || 'farmer1',
      farmerName: user?.name || 'Farmer',
      farmerVillage: newProduce.farmerVillage || user?.village || 'Thiruvananthapuram',
      cropName: newProduce.cropName || 'Tomato',
      quantity: newProduce.quantity || 100,
      pricePerKg: newProduce.pricePerKg || 25,
      negotiable: newProduce.negotiable ?? true,
      status: 'available',
      imageUrl: newProduce.imageUrl || '/images/crops/tomato.jpg',
      postedDate: new Date().toISOString().split('T')[0],
    };

    setProduceList((prev) => [item, ...prev]);
    setCurrentScreen('farmer-dashboard');
    createProduceListingInDb(item, customId).catch((err) =>
      console.warn('Produce created in state; Firestore sync scheduled:', err)
    );
  };

  const handleProduceStatusChange = async (id: string, newStatus: ProduceStatus) => {
    setProduceList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    updateProduceStatusInDb(id, newStatus).catch((err) =>
      console.warn('Status updated in state; Firestore sync scheduled:', err)
    );
  };

  const handleAddAlert = (cropName: string, targetPrice: number) => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      buyerId: user?.id || 'buyer-1',
      cropName,
      targetPrice,
      createdAt: new Date().toISOString(),
      active: true,
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
    savePriceAlertInDb(newAlert).catch(() => {});
  };

  const handleDeletePriceAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
    deletePriceAlertFromDb(id).catch(() => {});
  };

  const handleTogglePriceAlert = (id: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, active: !a.active };
          savePriceAlertInDb(updated).catch(() => {});
          return updated;
        }
        return a;
      })
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (notif.produceId) {
      const match = produceList.find((p) => p.id === notif.produceId);
      if (match) {
        setSelectedListing(match);
        setCurrentScreen('listing-detail');
      }
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
  };

  const handleDetectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      const loc = await requestUserLocation();
      setCurrentLocation(loc.formattedText);
      if (user && loc.district) {
        const updatedUser = { ...user, village: loc.district };
        setUser(updatedUser);
        saveUserProfile(updatedUser).catch(() => {});
      }
    } catch (err: any) {
      console.warn('Location detection failed:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const allAvailableCrops = React.useMemo(() => {
    const set = new Set<string>();
    produceList.forEach((p) => set.add(p.cropName));
    governmentPrices.forEach((g) => set.add(g.cropName));
    ['Tomato', 'Onion', 'Potato', 'Carrot', 'Green Beans', 'Chili', 'Banana'].forEach((c) => set.add(c));
    return Array.from(set);
  }, [produceList]);

  const activeListing = selectedListing || produceList[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-200">
      {/* Universal Header if logged in and not on full-bleed welcome/onboarding */}
      {user && currentScreen !== 'welcome' && currentScreen !== 'onboarding' && (
        <Header
          language={language}
          onLanguageChange={setLanguage}
          user={user}
          onLogout={handleLogout}
          isOnline={isOnline}
          onOpenAIStudio={() => setShowAIStudio(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          onOpenPriceAlerts={() => {
            setPreselectedAlertCrop(undefined);
            setIsPriceAlertModalOpen(true);
          }}
          currentLocation={currentLocation}
          onDetectLocation={handleDetectLocation}
          isDetectingLocation={isDetectingLocation}
        />
      )}

      {/* Real-time Price Drop Toast Notification */}
      <AnimatePresence>
        {activeToastAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg bg-emerald-900/95 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 backdrop-blur-md flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-amber-950 font-black shadow-md animate-bounce">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  {activeToastAlert.notification.title}
                </p>
                <p className="text-xs text-white/95 line-clamp-2 mt-0.5">
                  {activeToastAlert.notification.message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {activeToastAlert.item && (
                <button
                  onClick={() => {
                    setSelectedListing(activeToastAlert.item!);
                    setCurrentScreen('listing-detail');
                    setActiveToastAlert(null);
                  }}
                  className="rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <span>View</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => setActiveToastAlert(null)}
                className="text-white/60 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-center py-1.5 px-4 text-xs font-semibold">
          {language === 'en'
            ? 'Offline Mode: Changes will sync once internet connection is restored.'
            : 'ഓഫ്‌ലൈൻ മോഡ്: ഇന്റർനെറ്റ് ലഭ്യമാകുമ്പോൾ വിവരങ്ങൾ സമന്വയിപ്പിക്കും.'}
        </div>
      )}

      {/* Screen Router with Animated Transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentScreen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WelcomeScreen
                language={language}
                onLanguageChange={setLanguage}
                onLoginSuccess={handleLoginSuccess}
              />
            </motion.div>
          )}

          {currentScreen === 'onboarding' && user && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TutorialScreen
                language={language}
                user={user}
                onComplete={() =>
                  setCurrentScreen(
                    user.type === 'farmer' ? 'farmer-dashboard' : 'buyer-marketplace'
                  )
                }
                onSkip={() =>
                  setCurrentScreen(
                    user.type === 'farmer' ? 'farmer-dashboard' : 'buyer-marketplace'
                  )
                }
              />
            </motion.div>
          )}

          {currentScreen === 'farmer-dashboard' && user && (
            <motion.div
              key="farmer-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FarmerDashboard
                language={language}
                user={user}
                produceList={produceList}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                onStatusChange={handleProduceStatusChange}
              />
            </motion.div>
          )}

          {currentScreen === 'buyer-marketplace' && user && (
            <motion.div
              key="buyer-marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <BuyerMarketplace
                language={language}
                user={user}
                produceList={produceList}
                governmentPrices={governmentPrices}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                onOpenPriceAlerts={(crop) => {
                  setPreselectedAlertCrop(crop);
                  setIsPriceAlertModalOpen(true);
                }}
                activeAlertsCount={priceAlerts.filter((a) => a.active).length}
              />
            </motion.div>
          )}

          {currentScreen === 'add-produce' && user && (
            <motion.div
              key="add-produce"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <AddProduceScreen
                language={language}
                user={user}
                governmentPrices={governmentPrices}
                onNavigate={handleNavigate}
                onBack={() => setCurrentScreen('farmer-dashboard')}
                onAddProduce={handleAddProduce}
              />
            </motion.div>
          )}

          {currentScreen === 'listing-detail' && user && (
            <motion.div
              key="listing-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ListingDetailScreen
                language={language}
                user={user}
                listing={activeListing}
                governmentPrices={governmentPrices}
                farmers={initialUsers}
                onNavigate={handleNavigate}
                onBack={() =>
                  setCurrentScreen(
                    user.type === 'farmer' ? 'farmer-dashboard' : 'buyer-marketplace'
                  )
                }
              />
            </motion.div>
          )}

          {currentScreen === 'chat' && user && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="h-[calc(100vh-61px)]"
            >
              <ChatScreen
                language={language}
                user={user}
                listing={activeListing}
                partner={initialUsers.find((u) => u.name === activeListing.farmerName)}
                onNavigate={handleNavigate}
                onBack={() =>
                  setCurrentScreen(
                    user.type === 'farmer' ? 'farmer-dashboard' : 'buyer-marketplace'
                  )
                }
              />
            </motion.div>
          )}

          {currentScreen === 'payment-escrow' && user && (
            <motion.div
              key="payment-escrow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PaymentEscrowScreen
                language={language}
                user={user}
                listing={activeListing}
                onNavigate={handleNavigate}
                onBack={() => setCurrentScreen('listing-detail')}
              />
            </motion.div>
          )}

          {currentScreen === 'delivery-confirmation' && user && (
            <motion.div
              key="delivery-confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <DeliveryConfirmationScreen
                language={language}
                user={user}
                listing={activeListing}
                onNavigate={handleNavigate}
                onComplete={() =>
                  setCurrentScreen(
                    user.type === 'farmer' ? 'farmer-dashboard' : 'buyer-marketplace'
                  )
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Real-time Price Alert Creation and Management Modal */}
      <PriceAlertModal
        isOpen={isPriceAlertModalOpen}
        onClose={() => setIsPriceAlertModalOpen(false)}
        language={language}
        alerts={priceAlerts}
        onAddAlert={handleAddAlert}
        onDeleteAlert={handleDeletePriceAlert}
        onToggleAlert={handleTogglePriceAlert}
        availableCrops={allAvailableCrops}
        governmentPrices={governmentPrices}
        produceList={produceList}
        preselectedCrop={preselectedAlertCrop}
      />

      {/* Real-time Notification System Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        language={language}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearAll={handleClearNotifications}
        onSelectListing={(produceId) => {
          const match = produceList.find((p) => p.id === produceId);
          if (match) {
            setSelectedListing(match);
            setCurrentScreen('listing-detail');
          }
          setNotifications((prev) =>
            prev.map((n) => (n.produceId === produceId ? { ...n, read: true } : n))
          );
        }}
        produceList={produceList}
      />

      {/* AI Studio & Generative Tools Modal (Voice, Images, Veo Video & Music) */}
      <AIFarmStudioModal
        isOpen={showAIStudio}
        onClose={() => setShowAIStudio(false)}
        language={language}
        activeProduce={selectedListing}
      />
    </div>
  );
}
