import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Mic,
  MicOff,
  Image as ImageIcon,
  Video,
  Music,
  Search,
  X,
  Play,
  Pause,
  Upload,
  RefreshCw,
  ExternalLink,
  Volume2,
  Film,
  Send,
  Layers,
  Wand2,
} from 'lucide-react';
import { Language, ProduceItem } from '../../types';
import { Button } from '../ui/Button';

interface AIFarmStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  activeProduce?: ProduceItem | null;
}

export function AIFarmStudioModal({
  isOpen,
  onClose,
  language,
  activeProduce,
}: AIFarmStudioModalProps) {
  const [activeTab, setActiveTab] = useState<'voice' | 'image' | 'video' | 'music' | 'search'>('voice');
  const isEn = language === 'en';

  // --- 1. Live Voice State ---
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: isEn
        ? 'Namaskaram! I am your FarmDirect Voice Assistant powered by Gemini Live. Tap the microphone to talk about market prices, harvest tips, or crop health.'
        : 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ഫാംഡയറക്ട് വോയ്‌സ് അസിസ്റ്റന്റാണ്. വില വിവരങ്ങൾക്കും വിളവെടുപ്പ് നിർദ്ദേശങ്ങൾക്കും മൈക്രോഫോൺ അമർത്തുക.',
    },
  ]);
  const [voiceTextPrompt, setVoiceTextPrompt] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  // --- 2. Image Studio State ---
  const [imagePrompt, setImagePrompt] = useState(
    activeProduce
      ? `Promotional farm stand poster for fresh organic ${activeProduce.cropName} from Kerala, sunlit morning with raindrops`
      : 'Artisanal market stall sign for fresh organic Kerala spices and bananas'
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(activeProduce?.imageUrl || null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // --- 3. Veo Video State ---
  const [videoPrompt, setVideoPrompt] = useState(
    activeProduce
      ? `Cinematic smooth camera fly-through of freshly harvested ${activeProduce.cropName} on a lush farm in Kerala`
      : 'Golden sunlight illuminating fresh harvest produce baskets on a traditional Kerala farm'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // --- 4. Lyria Music State ---
  const [musicPrompt, setMusicPrompt] = useState(
    'Upbeat acoustic Kerala folk melody with acoustic chenda percussion and flute for a market stall'
  );
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- 5. Search Grounding State ---
  const [searchCrop, setSearchCrop] = useState(activeProduce?.cropName || 'Banana');
  const [searchQuery, setSearchQuery] = useState('Current APMC wholesale price in Andhra Pradesh mandis');
  const [searchResults, setSearchResults] = useState<{ insights: string; sources: Array<{ title: string; uri: string }> } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // WebSocket connection for Live API
  useEffect(() => {
    if (!isOpen || activeTab !== 'voice') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsLiveConnected(false);
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsLiveConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.text) {
          setLiveTranscript((prev) => [...prev, { sender: 'ai', text: msg.text }]);
        }
      } catch (err) {
        console.error('Error handling live message:', err);
      }
    };

    ws.onclose = () => {
      setIsLiveConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [isOpen, activeTab]);

  const handleSendVoiceText = (textToSend?: string) => {
    const text = textToSend || voiceTextPrompt;
    if (!text.trim()) return;

    setLiveTranscript((prev) => [...prev, { sender: 'user', text }]);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
    }
    setVoiceTextPrompt('');
  };

  // Image Generation
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: '1:1',
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
    } catch (err) {
      console.error('Image gen error:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Veo Video Generation
  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio,
        }),
      });
      const data = await res.json();
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
      } else if (data.operationName) {
        // Poll status
        setTimeout(async () => {
          const pollRes = await fetch('/api/ai/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: data.operationName }),
          });
          const pollData = await pollRes.json();
          if (pollData.videoUrl) {
            setGeneratedVideoUrl(pollData.videoUrl);
          }
          setIsGeneratingVideo(false);
        }, 3000);
        return;
      }
    } catch (err) {
      console.error('Video gen error:', err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Lyria Music Generation
  const handleGenerateMusic = async () => {
    setIsGeneratingMusic(true);
    try {
      const res = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        setGeneratedAudioUrl(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
      } else if (data.audioUrl) {
        setGeneratedAudioUrl(data.audioUrl);
      }
    } catch (err) {
      console.error('Music gen error:', err);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Search Grounding Mandi Check
  const handleSearchMandi = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/market-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, crop: searchCrop }),
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isEn ? 'FarmDirect AI Creative Studio' : 'ഫാംഡയറക്ട് എഐ സ്റ്റുഡിയോ'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {isEn
                  ? 'Gemini Live Voice, Nano Banana Images, Veo Video & Lyria Music'
                  : 'ലൈവ് വോയ്‌സ്, ചിത്രങ്ങൾ, വീഡിയോകള്‍, സംഗീതം എന്നിവ'}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-slate-50 px-3 overflow-x-auto gap-1 py-1.5 shrink-0">
          {[
            { id: 'voice', label: isEn ? 'Live Voice' : 'വോയ്‌സ്', icon: Mic },
            { id: 'image', label: isEn ? 'Image Studio' : 'ചിത്രങ്ങൾ', icon: ImageIcon },
            { id: 'video', label: isEn ? 'Veo Video' : 'വീഡിയോ', icon: Film },
            { id: 'music', label: isEn ? 'Lyria Music' : 'സംഗീതം', icon: Music },
            { id: 'search', label: isEn ? 'Mandi Search' : 'വിപണി തിരച്ചിൽ', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-200/70'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: GEMINI LIVE VOICE */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
                  <span className="text-xs font-bold text-gray-700">
                    {isLiveConnected ? (isEn ? 'Gemini 3.8 Live Connected' : 'ലൈവ് വോയ്‌സ് കണക്ട് ചെയ്തു') : (isEn ? 'Connecting Live API...' : 'കണക്ട് ചെയ്യുന്നു...')}
                  </span>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setIsRecording(!isRecording);
                      if (!isRecording) {
                        handleSendVoiceText(isEn ? 'Hello! Tell me current wholesale prices for Kerala crops.' : 'നമസ്കാരം! ഇന്നത്തെ കേരള കാർഷിക വിപണി വില പറയൂ.');
                      }
                    }}
                    className={`h-20 w-20 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 ring-8 ring-emerald-100'
                    }`}
                  >
                    <Mic className="h-8 w-8" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {isRecording ? (isEn ? 'Listening to voice...' : 'ശ്രദ്ധിക്കുന്നു...') : (isEn ? 'Tap mic to speak with Gemini Live' : 'സംസാരിക്കാൻ മൈക്ക് അമർത്തുക')}
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  isEn ? 'Best selling price for Nendran Banana?' : 'ഏത്തക്കായ്ക്ക് നല്ല വില എവിടെ?',
                  isEn ? 'How to protect cardamom from rain?' : 'മഴയിൽ ഏലം എങ്ങനെ സൂക്ഷിക്കാം?',
                  isEn ? 'How does FarmDirect escrow work?' : 'എസ്ക്രോ പേയ്‌മെന്റ് എങ്ങനെ പ്രവർത്തിക്കുന്നു?',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendVoiceText(chip)}
                    className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Transcript */}
              <div className="rounded-xl border border-gray-200 bg-slate-50 p-3 space-y-2 max-h-48 overflow-y-auto">
                {liveTranscript.map((t, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg text-xs ${
                      t.sender === 'user'
                        ? 'bg-emerald-100 text-emerald-900 ml-6 text-right'
                        : 'bg-white border border-gray-200 text-gray-800 mr-6 text-left shadow-2xs'
                    }`}
                  >
                    <strong className="block text-[10px] text-gray-400 uppercase">
                      {t.sender === 'user' ? (isEn ? 'You' : 'നിങ്ങൾ') : 'FarmDirect Live AI'}
                    </strong>
                    {t.text}
                  </div>
                ))}
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voiceTextPrompt}
                  onChange={(e) => setVoiceTextPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendVoiceText()}
                  placeholder={isEn ? 'Or type your question here...' : 'ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...'}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Button
                  onClick={() => handleSendVoiceText()}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE STUDIO */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-48 h-48 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex items-center justify-center overflow-hidden shrink-0">
                  {generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center p-3 text-emerald-700">
                      <ImageIcon className="h-8 w-8 mx-auto text-emerald-500 mb-1" />
                      <span className="text-xs font-semibold block">
                        {isEn ? 'Produce Visual' : 'ചിത്രം'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {isEn ? 'Image Prompt (Gemini 3.1 Flash Image)' : 'ചിത്ര വിവരണം'}
                    </label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 flex items-center justify-center gap-2 font-bold"
                  >
                    {isGeneratingImage ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    <span>{isGeneratingImage ? (isEn ? 'Creating Image...' : 'സൃഷ്ടിക്കുന്നു...') : (isEn ? 'Generate Produce Banner' : 'ചിത്രം നിർമ്മിക്കുക')}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEO VIDEO ANIMATOR */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    aspectRatio === '16:9'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  16:9 Landscape (Stall Display)
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    aspectRatio === '9:16'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  9:16 Portrait (Mobile Reel)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {isEn ? 'Animation Prompt (Veo 3.1 Fast)' : 'വീഡിയോ വിവരണം'}
                </label>
                <input
                  type="text"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <Button
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 flex items-center justify-center gap-2 font-bold"
              >
                {isGeneratingVideo ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Film className="h-4 w-4" />
                )}
                <span>{isGeneratingVideo ? (isEn ? 'Animating with Veo...' : 'വീഡിയോ നിർമ്മിക്കുന്നു...') : (isEn ? 'Animate into Market Video' : 'വീഡിയോ തയ്യാറാക്കുക')}</span>
              </Button>

              {generatedVideoUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full max-h-56 mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LYRIA MUSIC GENERATOR */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {isEn ? 'Jingle Style (Lyria 3 Clip - Up to 30s)' : 'സംഗീത വിവരണം'}
                </label>
                <textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <Button
                onClick={handleGenerateMusic}
                disabled={isGeneratingMusic}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 flex items-center justify-center gap-2 font-bold"
              >
                {isGeneratingMusic ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Music className="h-4 w-4" />
                )}
                <span>{isGeneratingMusic ? (isEn ? 'Composing Jingle...' : 'ഈണം ചിട്ടപ്പെടുത്തുന്നു...') : (isEn ? 'Generate 30s Stall Music' : 'സംഗീതം തയ്യാറാക്കുക')}</span>
              </Button>

              {generatedAudioUrl && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          if (isPlayingAudio) {
                            audioRef.current.pause();
                            setIsPlayingAudio(false);
                          } else {
                            audioRef.current.play();
                            setIsPlayingAudio(true);
                          }
                        }
                      }}
                      className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 shadow-xs cursor-pointer"
                    >
                      {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        {isEn ? 'Market Stall Harvest Jingle' : 'മാർക്കറ്റ് സ്റ്റാൾ ഗാനം'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {isEn ? 'Lyria 3 Audio Clip' : 'ഓഡിയോ ക്ലിപ്പ്'}
                      </span>
                    </div>
                  </div>
                  <audio
                    ref={audioRef}
                    src={generatedAudioUrl}
                    onEnded={() => setIsPlayingAudio(false)}
                  />
                  <Volume2 className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MANDI SEARCH GROUNDING */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={searchCrop}
                  onChange={(e) => setSearchCrop(e.target.value)}
                  placeholder="Crop (e.g. Cardamom, Banana)"
                  className="rounded-lg border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query / Mandi"
                  className="sm:col-span-2 rounded-lg border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <Button
                onClick={handleSearchMandi}
                disabled={isSearching}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 flex items-center justify-center gap-2 font-bold"
              >
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>{isSearching ? (isEn ? 'Searching Google Mandi Data...' : 'തിരയുന്നു...') : (isEn ? 'Search Live Mandi Grounding' : 'തത്സമയം തിരയുക')}</span>
              </Button>

              {searchResults && (
                <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 space-y-3">
                  <div className="text-xs text-gray-800 whitespace-pre-line leading-relaxed font-medium">
                    {searchResults.insights}
                  </div>

                  {searchResults.sources && searchResults.sources.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                      <span className="font-bold text-gray-600">{isEn ? 'Sources:' : 'ഉറവിടങ്ങൾ:'}</span>
                      {searchResults.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-emerald-700 hover:underline border border-gray-200"
                        >
                          <span className="truncate max-w-[160px]">{s.title}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
