import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  X,
  Download,
  Printer,
  Copy,
  Check,
  Share2,
  MapPin,
  ShieldCheck,
  Sprout,
  Store,
} from 'lucide-react';
import { Language, ProduceItem } from '../../types';
import { cropNamesMap, userNamesMap, villageNamesMap } from '../../data/translations';
import { Button } from '../ui/Button';

interface ProduceQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ProduceItem | null;
  language: Language;
}

export function ProduceQRModal({
  isOpen,
  onClose,
  listing,
  language,
}: ProduceQRModalProps) {
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !listing) return null;

  const isEn = language === 'en';

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

  // URL pointing directly to this produce item
  const shareUrl = `${window.location.origin}/?produce=${listing.id}&crop=${encodeURIComponent(
    listing.cropName
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('produce-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${listing.cropName}-FarmDirect-QR.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing.cropName} - Direct from ${listing.farmerName}`,
          text: `Buy fresh ${listing.cropName} (${listing.quantity} kg at ₹${listing.pricePerKg}/kg) directly from ${listing.farmerName} in ${listing.farmerVillage} with Escrow Protection on FarmDirect!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100 print:shadow-none print:border-none"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/15">
                <QrCode className="h-5 w-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">
                  {isEn ? 'Market Stall QR Code' : 'മാർക്കറ്റ് ക്യുആർ കോഡ്'}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  {isEn
                    ? 'Display at your physical market stall for instant buyer orders'
                    : 'വിപണിയിൽ പ്രദർശിപ്പിച്ച് നേരിട്ട് ഓർഡറുകൾ നേടുക'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Printable Market Display Poster / Sign */}
          <div ref={printRef} className="p-6 text-center space-y-4">
            {/* Branding badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
              <Sprout className="h-3.5 w-3.5 text-emerald-600" />
              <span>FarmDirect · {isEn ? 'Direct From Kerala Farm' : 'ഫാമിൽ നിന്നും നേരിട്ട്'}</span>
            </div>

            {/* Produce Header */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {getTranslatedCrop(listing.cropName)}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {isEn ? 'Harvested in' : 'വിളവെടുത്തത്'}{' '}
                  <strong className="text-gray-700">{getTranslatedVillage(listing.farmerVillage)}</strong>
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{getTranslatedUser(listing.farmerName)}</span>
                </span>
              </div>
            </div>

            {/* High-Contrast QR Code Card */}
            <div className="mx-auto w-fit p-4 rounded-2xl bg-white border-2 border-emerald-500 shadow-md">
              <QRCodeSVG
                id="produce-qr-svg"
                value={shareUrl}
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: listing.imageUrl,
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>

            {/* Price & Guarantee Strip */}
            <div className="rounded-xl bg-slate-50 border border-gray-200 p-3 flex items-center justify-around text-center">
              <div>
                <span className="text-[11px] text-gray-500 block">{isEn ? 'Price' : 'വില'}</span>
                <span className="text-lg font-black text-emerald-700">₹{listing.pricePerKg}</span>
                <span className="text-[10px] text-gray-400 font-medium"> / {isEn ? 'kg' : 'കിലോ'}</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <span className="text-[11px] text-gray-500 block">{isEn ? 'Available' : 'ലഭ്യമായത്'}</span>
                <span className="text-lg font-bold text-gray-900">{listing.quantity}</span>
                <span className="text-[10px] text-gray-400 font-medium"> {isEn ? 'kg' : 'കിലോ'}</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <span className="text-[11px] text-gray-500 block">{isEn ? 'Payment' : 'ഇടപാട്'}</span>
                <span className="text-xs font-bold text-blue-700 block mt-1">100% Escrow</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              {isEn
                ? 'Scan with any smartphone camera or UPI app to order directly and pay securely.'
                : 'ഏതൊരു ക്യാമറ അല്ലെങ്കിൽ UPI ആപ്പ് ഉപയോഗിച്ചും സ്കാൻ ചെയ്ത് വാങ്ങാം.'}
            </p>
          </div>

          {/* Action Buttons (Hidden when printed) */}
          <div className="bg-slate-50 border-t border-gray-100 p-4 space-y-2 print:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="text-xs h-10 border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-1.5 font-bold"
              >
                <Download className="h-4 w-4" />
                <span>{isEn ? 'Save Image' : 'ചിത്രം സേവ് ചെയ്യുക'}</span>
              </Button>

              <Button
                onClick={handlePrint}
                className="text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 font-bold shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>{isEn ? 'Print Sign' : 'പ്രിന്റ് ചെയ്യുക'}</span>
              </Button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-gray-500" />}
                <span>{copied ? (isEn ? 'Link Copied!' : 'ലിങ്ക് പകർത്തി!') : (isEn ? 'Copy Direct Link' : 'ലിങ്ക് പകർത്തുക')}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title={isEn ? 'Share' : 'പങ്കുവെക്കുക'}
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-700" />
                <span className="hidden sm:inline">{isEn ? 'Share' : 'ഷെയർ'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
