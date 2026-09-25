import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Send,
  IndianRupee,
  Phone,
  Check,
  CheckCheck,
  Clock,
  Mic,
  Shield,
  CreditCard,
  Sparkles,
  MapPin,
  Store,
} from 'lucide-react';
import { ChatMessage, Language, ProduceItem, User } from '../../types';
import {
  chatTranslations,
  cropNamesMap,
  userNamesMap,
  villageNamesMap,
} from '../../data/translations';
import { generateFarmerResponse } from '../../utils/chatBot';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface ChatScreenProps {
  language: Language;
  user: User;
  listing: ProduceItem;
  partner?: User;
  onNavigate: (screen: string, item?: ProduceItem) => void;
  onBack: () => void;
}

export function ChatScreen({
  language,
  user,
  listing,
  partner,
  onNavigate,
  onBack,
}: ChatScreenProps) {
  const t = chatTranslations[language];

  const getTranslatedCrop = (name: string): string => {
    if (language === 'ml' && cropNamesMap[name]) {
      return cropNamesMap[name].ml;
    }
    return name;
  };

  const getTranslatedUser = (name: string): string => {
    if (language === 'ml' && userNamesMap[name]) {
      return userNamesMap[name].ml;
    }
    return name;
  };

  const partnerName = partner?.name || listing.farmerName || 'Farmer';
  const partnerRole = user.type === 'farmer' ? 'buyer' : 'farmer';

  // Initial welcome greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialText =
      language === 'en'
        ? `Namaskaram! I am interested in your fresh ${listing.cropName} harvest (${listing.quantity} kg at ₹${listing.pricePerKg}/kg).`
        : `നമസ്കാരം, നിങ്ങളുടെ പുതിയ ${getTranslatedCrop(listing.cropName)} ഉൽപ്പന്നത്തിൽ എനിക്ക് താൽപ്പര്യമുണ്ട്.`;

    const initialReply = generateFarmerResponse(
      initialText,
      language,
      partnerRole,
      listing,
      partnerName,
      []
    );

    return [
      {
        id: '1',
        senderId: user.id,
        message: initialText,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        type: 'text',
      },
      {
        id: '2',
        senderId: 'partner',
        message: initialReply,
        timestamp: new Date().toISOString(),
        type: 'text',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState(listing.pricePerKg.toString());
  const [agreedPrice, setAgreedPrice] = useState(listing.pricePerKg);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Suggested prompt chips
  const suggestions =
    language === 'en'
      ? [
          "What's the harvest date and freshness?",
          'Is the price negotiable for bulk?',
          'Can you deliver by tomorrow morning?',
          'Can I visit your farm in Kerala?',
          'Is this 100% organic and pesticide-free?',
        ]
      : [
          'ഇപ്പോഴത്തെ ഗുണനിലവാരം എങ്ങനെ?',
          'വില കുറയ്ക്കാമോ?',
          'നാളെ രാവിലെ ഡെലിവർ ചെയ്യാമോ?',
          'ഓർഗാനിക് കൃഷിയാണോ?',
          'ഫാം സന്ദർശിക്കാൻ പറ്റുമോ?',
        ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      message: text,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Contextual auto-reply
    setTimeout(() => {
      setIsTyping(false);
      const replyText = generateFarmerResponse(
        text,
        language,
        partnerRole,
        { ...listing, pricePerKg: agreedPrice },
        partnerName,
        [...messages, userMsg]
      );

      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'partner',
        message: replyText,
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setMessages((prev) => [...prev, replyMsg]);
    }, 1000 + Math.random() * 800);
  };

  const handleMakeOffer = () => {
    const num = parseFloat(offerPrice);
    if (isNaN(num) || num <= 0) return;

    setShowOfferModal(false);

    const offerMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      message: `${t.offerMade}: ₹${num} ${t.perKg}`,
      timestamp: new Date().toISOString(),
      type: 'offer',
      offerAmount: num,
      status: 'pending',
    };

    setMessages((prev) => [...prev, offerMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const ratio = num / listing.pricePerKg;

      if (ratio >= 0.85) {
        // Accept offer
        setAgreedPrice(num);
        setMessages((prev) =>
          prev.map((m) => (m.id === offerMsg.id ? { ...m, status: 'accepted' } : m))
        );

        const acceptText =
          language === 'en'
            ? `Deal accepted! ₹${num}/kg is fair for both of us. Please proceed with Escrow payment so I can prepare dispatch!`
            : `ഓഫർ സ്വീകരിച്ചു! ₹${num}/കിലോ എനിക്ക് സമ്മതമാണ്. ഉൽപ്പന്നം തയ്യാറാക്കാൻ എസ്ക്രോ പേയ്മെന്റിലേക്ക് കടക്കുക!`;

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            senderId: 'partner',
            message: acceptText,
            timestamp: new Date().toISOString(),
            type: 'text',
          },
        ]);
      } else {
        // Counter offer
        const counter = Math.round((listing.pricePerKg + num) / 2);
        setMessages((prev) =>
          prev.map((m) => (m.id === offerMsg.id ? { ...m, status: 'rejected' } : m))
        );

        const counterText =
          language === 'en'
            ? `₹${num}/kg is too low for this grade. The best I can offer is ₹${counter}/kg. Let me know if that works!`
            : `₹${num}/കിലോ വളരെ കുറവാണ്. എനിക്ക് നൽകാൻ സാധിക്കുന്ന ഏറ്റവും കുറഞ്ഞ നിരക്ക് ₹${counter}/കിലോ ആണ്.`;

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            senderId: 'partner',
            message: counterText,
            timestamp: new Date().toISOString(),
            type: 'text',
          },
        ]);
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans">
      {/* Top Chat Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-3 shadow-md z-20 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              {partnerName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base leading-tight">
                  {getTranslatedUser(partnerName)}
                </h2>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-100">
                {language === 'en' ? 'Active now · Verified Direct Farmer' : 'ലൈവ് · പരിശോധിച്ച കർഷകൻ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOfferModal(true)}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <IndianRupee className="h-3.5 w-3.5" />
              <span>{t.makeOffer}</span>
            </button>

            <button
              onClick={() => onNavigate('payment-escrow', { ...listing, pricePerKg: agreedPrice })}
              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{language === 'en' ? 'Buy Now' : 'വാങ്ങുക'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Produce Context Sub-Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 shrink-0 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img
              src={listing.imageUrl}
              alt={listing.cropName}
              className="h-7 w-7 rounded object-cover border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/crops/tomato.jpg';
              }}
            />
            <span className="font-semibold text-gray-800">
              {getTranslatedCrop(listing.cropName)} ({listing.quantity} kg)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">{t.currentPrice}:</span>
            <span className="font-bold text-emerald-700 text-sm">₹{agreedPrice}/kg</span>
            {agreedPrice !== listing.pricePerKg && (
              <span className="text-[10px] text-gray-400 line-through">₹{listing.pricePerKg}</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Security Banner */}
          <div className="text-center py-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-medium text-emerald-800">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {language === 'en'
                  ? 'All negotiations covered by FarmDirect Escrow Guarantee'
                  : 'എല്ലാ ചർച്ചകളും എസ്ക്രോ സുരക്ഷയിൽ സംരക്ഷിക്കപ്പെട്ടിരിക്കുന്നു'}
              </span>
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === user.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {msg.type === 'offer' ? (
                  /* Custom Offer Card in Chat */
                  <div
                    className={`rounded-2xl p-4 max-w-sm border shadow-sm ${
                      isMe
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <IndianRupee className="h-4 w-4 text-amber-600" />
                      <span className="font-bold text-sm">
                        {language === 'en' ? 'Proposed Custom Offer' : 'നിർദ്ദേശിച്ച ഓഫർ'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 mb-1">
                      ₹{msg.offerAmount} <span className="text-xs font-normal text-gray-500">/ kg</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {language === 'en' ? 'Total proposed deal value:' : 'മൊത്തം മൂല്യം:'}{' '}
                      <strong>₹{((msg.offerAmount || 0) * listing.quantity).toLocaleString()}</strong>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.status === 'accepted' && (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="h-3 w-3" /> {t.offerAccepted}
                        </span>
                      )}
                      {msg.status === 'rejected' && (
                        <span className="font-bold text-red-600">{t.offerRejected}</span>
                      )}
                      {msg.status === 'pending' && (
                        <span className="font-medium text-amber-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {language === 'en' ? 'Reviewing...' : 'പരിശോധിക്കുന്നു...'}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard Text Bubble */
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-md text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isMe ? 'text-emerald-100' : 'text-gray-400'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <CheckCheck className="h-3 w-3 text-emerald-200" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-full w-fit border border-gray-200">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
              </span>
              <span>{partnerName} {language === 'en' ? 'is replying...' : 'മറുപടി നൽകുന്നു...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="bg-slate-100 px-4 py-2 border-t border-gray-200 overflow-x-auto shrink-0 scrollbar-none">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {suggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Message Input Box */}
      <div className="bg-white border-t border-gray-200 p-3 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={t.typeMessage}
            className="flex-1 h-11 text-sm bg-slate-50 border-gray-300 rounded-xl"
          />

          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Make Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-amber-300" />
                  <span>{t.makeOffer}</span>
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {language === 'en'
                    ? `Current price: ₹${listing.pricePerKg}/kg for ${getTranslatedCrop(listing.cropName)}`
                    : `നിലവിലെ വില: ₹${listing.pricePerKg}/കിലോ`}
                </p>
              </div>

              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {language === 'en' ? 'Your Proposed Price (₹/kg)' : 'നിങ്ങളുടെ ഓഫർ വില (₹/കിലോ)'}
                  </label>
                  <Input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="text-2xl font-bold text-center h-14 font-mono text-emerald-700 border-2 border-emerald-400"
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span>{language === 'en' ? 'Estimated Total:' : 'മൊത്തം തുക:'}</span>
                    <strong className="text-gray-900 font-bold">
                      ₹{((parseFloat(offerPrice) || 0) * listing.quantity).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setShowOfferModal(false)}
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    {language === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
                  </Button>
                  <Button
                    onClick={handleMakeOffer}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    {language === 'en' ? 'Submit Offer' : 'ഓഫർ അയക്കുക'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
