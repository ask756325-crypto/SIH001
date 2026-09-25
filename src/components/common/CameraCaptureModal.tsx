import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Upload } from 'lucide-react';
import { Language } from '../../types';
import { Button } from '../ui/Button';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  language: Language;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  language,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  const t = {
    en: {
      title: 'Live Camera Capture',
      subtitle: 'Point your camera at the fresh harvested crop',
      capture: 'Capture Photo',
      retake: 'Retake',
      confirm: 'Use This Photo',
      switchCam: 'Flip Camera',
      fallbackUpload: 'Upload from Device',
      errorAccess: 'Unable to access camera. Please check permissions or upload a file.',
      noCamera: 'Camera not detected. You can upload an image from your device.',
    },
    ml: {
      title: 'ലൈവ് ക്യാമറ',
      subtitle: 'വിളവെടുപ്പിന്റെ ചിത്രം നേരിട്ട് പകർത്തുക',
      capture: 'ഫോട്ടോ എടുക്കുക',
      retake: 'വീണ്ടും എടുക്കുക',
      confirm: 'ഈ ഫോട്ടോ ഉപയോഗിക്കുക',
      switchCam: 'ക്യാമറ മാറ്റുക',
      fallbackUpload: 'ഉപകരണത്തിൽ നിന്ന് അപ്‌ലോഡ് ചെയ്യുക',
      errorAccess: 'ക്യാമറ ആക്‌സസ് ചെയ്യാനായില്ല. അനുമതികൾ പരിശോധിക്കുക.',
      noCamera: 'ക്യാമറ കണ്ടെത്തിയില്ല. ഫയൽ അപ്‌ലോഡ് ചെയ്യാം.',
    },
    hi: {
      title: 'लाइव कैमरा कैप्चर',
      subtitle: 'ताज़ी कटी हुई फसल की तस्वीर लें',
      capture: 'फोटो खींचें',
      retake: 'दोबारा लें',
      confirm: 'यह फोटो उपयोग करें',
      switchCam: 'कैमरा पलटें',
      fallbackUpload: 'डिवाइस से अपलोड करें',
      errorAccess: 'कैमरा एक्सेस नहीं हो सका। अनुमति जांचें या फाइल अपलोड करें।',
      noCamera: 'कैमरा नहीं मिला। आप डिवाइस से फोटो चुन सकते हैं।',
    },
    te: {
      title: 'లైవ్ కెమెరా క్యాప్చర్',
      subtitle: 'తాజా పంట ఫోటోను నేరుగా తీయండి',
      capture: 'ఫోటో తీయండి',
      retake: 'మళ్లీ తీయండి',
      confirm: 'ఈ ఫోటో ఉపయోగించండి',
      switchCam: 'కెమెరా మార్చండి',
      fallbackUpload: 'పరికరం నుండి అప్‌లోడ్ చేయండి',
      errorAccess: 'కెమెరా యాక్సెస్ కాలేదు. అనుమతులను తనిఖీ చేయండి.',
      noCamera: 'కెమెరా గుర్తించబడలేదు. పరికరం నుండి ఎంచుకోండి.',
    },
  }[language] || {
    title: 'Live Camera Capture',
    subtitle: 'Point your camera at the fresh harvested crop',
    capture: 'Capture Photo',
    retake: 'Retake',
    confirm: 'Use This Photo',
    switchCam: 'Flip Camera',
    fallbackUpload: 'Upload from Device',
    errorAccess: 'Unable to access camera. Please check permissions or upload a file.',
    noCamera: 'Camera not detected. You can upload an image from your device.',
  };

  const stopCurrentStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCurrentStream();
    setCameraError(null);
    setIsInitializing(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(t.errorAccess);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    } else {
      stopCurrentStream();
    }

    return () => {
      stopCurrentStream();
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCurrentStream();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setCapturedImage(result);
        stopCurrentStream();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-gray-900 border border-emerald-500/30 overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3 bg-gray-950/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/30 text-emerald-400">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{t.title}</h3>
              <p className="text-[11px] text-gray-400">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCurrentStream();
              onClose();
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured crop"
              className="h-full w-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraError ? 'hidden' : 'block'}`}
              />

              {/* Viewfinder crosshairs overlay */}
              {!cameraError && (
                <div className="pointer-events-none absolute inset-6 border border-white/30 rounded-xl flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="h-4 w-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 w-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="h-4 w-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              )}

              {/* Camera access error / fallback */}
              {cameraError && (
                <div className="p-6 text-center max-w-sm space-y-3">
                  <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-gray-300">{cameraError}</p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2"
                  >
                    <Upload className="h-4 w-4 mr-1.5" />
                    <span>{t.fallbackUpload}</span>
                  </Button>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-gray-950 flex items-center justify-between gap-2">
          {capturedImage ? (
            <>
              <Button
                type="button"
                onClick={handleRetake}
                variant="outline"
                className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{t.retake}</span>
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-lg"
              >
                <Check className="h-4 w-4" />
                <span>{t.confirm}</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-gray-700 bg-gray-800/80 text-gray-300 hover:bg-gray-700 text-xs flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.fallbackUpload}</span>
              </Button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={Boolean(cameraError) || isInitializing}
                className="h-14 w-14 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                title={t.capture}
              >
                <div className="h-10 w-10 rounded-full border-2 border-white/80 bg-emerald-600" />
              </button>

              <Button
                type="button"
                onClick={handleToggleFacingMode}
                disabled={Boolean(cameraError)}
                variant="outline"
                className="border-gray-700 bg-gray-800/80 text-gray-300 hover:bg-gray-700 text-xs flex items-center gap-1.5"
                title={t.switchCam}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.switchCam}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
