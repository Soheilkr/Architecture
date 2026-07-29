import React, { useState, useRef, useEffect } from 'react';
import { StrategyMode, TradeRecord, ViewMode } from '../types';
import { saveTradeRecord, getTodayString, loadGlobalSettings } from '../utils/storage';
import { Camera, Download, Upload, CheckCircle2, XCircle, ArrowLeft, Send } from 'lucide-react';

interface PostTradeViewProps {
  currentStrategy: StrategyMode;
  preTradeData?: {
    symbol: string;
    direction: 'LONG' | 'SHORT';
    entryPrice: string;
    rulesChecked: string[];
  };
  setActiveView: (view: ViewMode) => void;
  watermarkTag: string;
}

export const PostTradeView: React.FC<PostTradeViewProps> = ({
  currentStrategy,
  preTradeData,
  setActiveView,
  watermarkTag
}) => {
  const [result, setResult] = useState<'TP' | 'SL' | 'BE'>('TP');
  const [symbol, setSymbol] = useState(preTradeData?.symbol || 'BTC/USDT');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>(preTradeData?.direction || 'LONG');
  const [entryPrice, setEntryPrice] = useState(preTradeData?.entryPrice || '64,250');
  const [exitPrice, setExitPrice] = useState('65,800');
  const [pnl, setPnl] = useState('+$1,550 (+2.41%)');
  const [notes, setNotes] = useState('');
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if preTradeData prop changes
  useEffect(() => {
    if (preTradeData) {
      if (preTradeData.symbol) setSymbol(preTradeData.symbol);
      if (preTradeData.direction) setDirection(preTradeData.direction);
      if (preTradeData.entryPrice) setEntryPrice(preTradeData.entryPrice);
    }
  }, [preTradeData]);

  // Re-generate watermark when result or watermarkTag changes
  useEffect(() => {
    if (chartImage) {
      generateWatermarkCanvas(chartImage);
    }
  }, [result, watermarkTag]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setChartImage(dataUrl);
                generateWatermarkCanvas(dataUrl);
              };
              reader.readAsDataURL(file);
              e.preventDefault();
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setChartImage(dataUrl);
        generateWatermarkCanvas(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoScreenshot = async () => {
    if (window.electronAPI?.takeScreenshot) {
      try {
        const res = await window.electronAPI.takeScreenshot();
        let dataUrl: string | undefined;

        if (typeof res === 'string') {
          dataUrl = res;
        } else if (res && typeof res === 'object' && res.success) {
          dataUrl = res.dataUrl;
        }

        if (dataUrl) {
          setChartImage(dataUrl);
          generateWatermarkCanvas(dataUrl);
          const globalSettings = loadGlobalSettings();
          if (globalSettings.screenshotFolder) {
            try {
              await window.electronAPI.saveScreenshot(dataUrl, globalSettings.screenshotFolder, `trade-${symbol.replace('/', '-')}-${Date.now()}.png`);
            } catch (err) {
              console.error('Error saving screenshot to folder:', err);
            }
          }
          return;
        }
      } catch (err) {
        console.error('Electron screenshot error:', err);
      }
    }

    // Try browser getDisplayMedia if supported
    try {
      if (navigator.mediaDevices?.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'window' } });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          setChartImage(dataUrl);
          generateWatermarkCanvas(dataUrl);
        }
        stream.getTracks().forEach(track => track.stop());
        return;
      }
    } catch (err) {
      console.log('Display media capture cancelled or restricted:', err);
    }

    // Fallback: trigger file upload selector
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      alert('لطفاً تصویر چارت را آپلود کنید یا با کلیدهای Ctrl+V تصویر را اینجا پیست (Paste) کنید.');
    }
  };

  const generateWatermarkCanvas = (imageDataUrl: string) => {
    setIsGenerating(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageDataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw Base Image
      ctx.drawImage(img, 0, 0);

      // Add Overlay Watermark Banner at Bottom Right
      const padding = 20;
      const fontSize = Math.max(16, Math.floor(img.width / 40));
      ctx.font = `bold ${fontSize}px sans-serif`;
      
      const tagText = watermarkTag || '@Soheil_Keshtkar';
      const textMetrics = ctx.measureText(tagText);
      const textWidth = textMetrics.width;
      const bgPadding = 12;

      const x = padding;
      const y = canvas.height - padding - fontSize - (bgPadding * 2);

      // Background Pill
      ctx.fillStyle = 'rgba(7, 11, 19, 0.85)';
      ctx.strokeStyle = result === 'TP' ? '#10b981' : result === 'SL' ? '#f43f5e' : '#6366f1';
      ctx.lineWidth = 2;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, textWidth + (bgPadding * 2), fontSize + (bgPadding * 2), 12);
      } else {
        ctx.rect(x, y, textWidth + (bgPadding * 2), fontSize + (bgPadding * 2));
      }
      ctx.fill();
      ctx.stroke();

      // Text Overlay
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tagText, x + bgPadding, y + fontSize + bgPadding - 2);

      const finalDataUrl = canvas.toDataURL('image/png');
      setWatermarkedImage(finalDataUrl);
      setIsGenerating(false);
    };
  };

  const handleSaveTrade = () => {
    const newTrade: TradeRecord = {
      id: Date.now().toString(),
      date: getTodayString(),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      symbol,
      direction,
      result,
      entryPrice,
      exitPrice,
      pnl,
      strategy: currentStrategy,
      notes,
      chartImage: watermarkedImage || chartImage || undefined,
      watermark: watermarkTag,
      timestamp: Date.now()
    };

    saveTradeRecord(newTrade);
    setActiveView('archive');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4" dir="rtl">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase">
            مرحله دوم: خروج و ثبت ژورنال
          </span>
          <h2 className="text-lg font-black text-slate-100 mt-1">ثبت نتیجه معامله و ساخت تصویر واترمارک</h2>
        </div>

        <button
          onClick={() => setActiveView('archive')}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          مشاهده آرشیو
        </button>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Form Column */}
        <div className="space-y-4">
          
          {/* Result Buttons */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <label className="text-xs text-slate-400 font-bold block">نتیجه معامله (Trade Outcome)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setResult('TP')}
                className={`py-3 rounded-2xl font-mono font-black text-xs transition-all cursor-pointer ${
                  result === 'TP'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Take Profit
              </button>

              <button
                type="button"
                onClick={() => setResult('SL')}
                className={`py-3 rounded-2xl font-mono font-black text-xs transition-all cursor-pointer ${
                  result === 'SL'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Stop Loss
              </button>

              <button
                type="button"
                onClick={() => setResult('BE')}
                className={`py-3 rounded-2xl font-mono font-black text-xs transition-all cursor-pointer ${
                  result === 'BE'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Break Even
              </button>
            </div>
          </div>

          {/* Trade Exit Details */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">قیمت خروج (Exit Price)</label>
              <input
                type="text"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-right dir-ltr"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">سود یا زیان (PnL Amount & %)</label>
              <input
                type="text"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                placeholder="مثلاً +$1,550 (+2.41%)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-right dir-ltr"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">توضیحات و یادداشت ژورنال</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="دلایل خروج، مدیریت هیجان یا نکات آموزشی معامله..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600 resize-none focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

        </div>

        {/* Right Chart & Watermark Column */}
        <div className="space-y-4">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-200">تصویر چارت و واترمارک</span>
              <span className="text-[10px] text-slate-400 font-mono">{watermarkTag}</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleChartUpload}
              accept="image/*"
              className="hidden"
            />

            {watermarkedImage || chartImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <img 
                  src={watermarkedImage || chartImage || ''} 
                  alt="Trade Chart" 
                  className="w-full h-48 object-cover" 
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-900 text-slate-200 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-800 backdrop-blur cursor-pointer"
                >
                  تغییر تصویر
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-44 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 transition-all cursor-pointer p-4 text-center"
              >
                <Camera className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-bold">آپلود یا اسکرین‌شات چارت</span>
                <span className="text-[10px] text-slate-600 mt-1">واترمارک {watermarkTag} به‌طور خودکار اعمال می‌شود</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>آپلود فایل</span>
              </button>
              <button
                type="button"
                onClick={handleAutoScreenshot}
                className="flex-1 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-bold py-2.5 rounded-xl border border-indigo-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>اسکرین‌شات خودکار صفحه</span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSaveTrade}
            className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition-all cursor-pointer active:scale-98"
          >
            <Send className="w-5 h-5" />
            <span>ثبت نهایی معامله در آرشیو</span>
          </button>

        </div>

      </div>

    </div>
  );
};
