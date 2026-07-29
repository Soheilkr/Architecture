import React, { useState, useRef } from 'react';
import { TradeRecord, StrategyMode } from '../types';
import { Camera, Download, FileText, CheckCircle2, Copy, Sparkles, FolderDown, Printer, RefreshCw, Layers } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DocumenterViewProps {
  trades: TradeRecord[];
  watermarkTag: string;
  screenshotFolder?: string;
  onRefreshTrades: () => void;
}

export const DocumenterView: React.FC<DocumenterViewProps> = ({
  trades,
  watermarkTag,
  screenshotFolder = 'Downloads/TradingScreenshots',
  onRefreshTrades
}) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'report' | 'batch'>('studio');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [watermarkedResult, setWatermarkedResult] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState(watermarkTag || '@Soheil_Keshtkar');
  const [isCapturing, setIsCapturing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [logs, setLogs] = useState<Array<{ time: string; action: string; status: string }>>([
    { time: new Date().toLocaleTimeString('fa-IR'), action: 'سیستم اسکرین‌شات و گزارش‌ساز', status: 'آماده به کار (HTML2Canvas فعال)' }
  ]);

  const previewCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (action: string, status: string) => {
    setLogs(prev => [
      { time: new Date().toLocaleTimeString('fa-IR'), action, status },
      ...prev.slice(0, 10)
    ]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        applyWatermarkToImage(dataUrl, customTag);
        addLog('آپلود تصویر چارت', 'موفقیت‌آمیز');
      };
      reader.readAsDataURL(file);
    }
  };

  const applyWatermarkToImage = (imageSrc: string, tag: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Watermark badge styling
      const padding = 24;
      const fontSize = Math.max(16, Math.floor(img.width / 35));
      ctx.font = `bold ${fontSize}px sans-serif`;
      const textMetrics = ctx.measureText(tag);
      const textWidth = textMetrics.width;
      const bgPadding = 14;

      const x = padding;
      const y = canvas.height - padding - fontSize - (bgPadding * 2);

      // Pill background
      ctx.fillStyle = 'rgba(7, 11, 19, 0.88)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, textWidth + (bgPadding * 2), fontSize + (bgPadding * 2), 14);
      } else {
        ctx.rect(x, y, textWidth + (bgPadding * 2), fontSize + (bgPadding * 2));
      }
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tag, x + bgPadding, y + fontSize + bgPadding - 3);

      const resultUrl = canvas.toDataURL('image/png');
      setWatermarkedResult(resultUrl);
    };
  };

  const handleCaptureScreenNode = async () => {
    if (!previewCardRef.current) return;
    setIsCapturing(true);
    addLog('اسکرین‌شات از المان DOM', 'در حال پردازش...');
    try {
      const canvas = await html2canvas(previewCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#070b13'
      });
      const dataUrl = canvas.toDataURL('image/png');
      setSelectedImage(dataUrl);
      applyWatermarkToImage(dataUrl, customTag);
      addLog('اسکرین‌شات خودکار صفحه', 'موفقیت‌آمیز');
    } catch (err) {
      console.error('html2canvas error:', err);
      addLog('اسکرین‌شات صفحه', 'خطا در ثبت');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!watermarkedResult && !selectedImage) return;
    try {
      const targetUrl = watermarkedResult || selectedImage;
      if (!targetUrl) return;

      const res = await fetch(targetUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopySuccess(true);
      addLog('کپی تصویر در کلیپ‌بورد', 'موفقیت‌آمیز');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      alert('مرورگر شما اجازه کپی مستقیم تصویر را نمی‌دهد. از دکمه دانلود استفاده کنید.');
    }
  };

  const handleDownloadImage = () => {
    const targetUrl = watermarkedResult || selectedImage;
    if (!targetUrl) return;
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `trade-screenshot-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`ذخیره در ${screenshotFolder}`, 'موفقیت‌آمیز');
  };

  // Report calculations
  const totalTradesCount = trades.length;
  const tpCount = trades.filter(t => t.result === 'TP').length;
  const slCount = trades.filter(t => t.result === 'SL').length;
  const winRate = totalTradesCount > 0 ? ((tpCount / totalTradesCount) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-sky-950 p-3 rounded-2xl border border-sky-500/30 text-sky-400">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-100">اسکرین‌شات خودکار و گزارش‌ساز (Automated Documenter)</h2>
              <span className="text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                نسخه پیشرفته
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">ثبت تصویر چارت با واترمارک اختصاصی، کپی سریع، و تولید گزارشات رسمی PDF/HTML</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'studio' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>استودیو اسکرین‌شات</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'report' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>گزارش‌ساز رسمی</span>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'batch' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>گالری و خروجی گروهی</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STUDIO */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Controls */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-black text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                تنظیمات واترمارک و ضبط
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-bold">متن واترمارک تصویر</label>
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => {
                    setCustomTag(e.target.value);
                    if (selectedImage) applyWatermarkToImage(selectedImage, e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500 dir-ltr text-right"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FolderDown className="w-4 h-4 text-sky-400" />
                  <span>آپلود تصویر چارت از سیستم</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

                <button
                  type="button"
                  onClick={handleCaptureScreenNode}
                  disabled={isCapturing}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCapturing ? 'در حال ضبط صفحه...' : 'اسکرین‌شات از این صفحه'}</span>
                </button>
              </div>

              {watermarkedResult && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copySuccess ? 'با موفقیت کپی شد!' : 'کپی تصویر در کلیپ‌بورد (Ctrl+C)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود تصویر واترمارک‌شده</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Activity Logs */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">تاریخچه فعالیت اسکرین‌شات:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-xl text-[11px] flex items-center justify-between">
                    <span className="text-slate-200 font-mono">{log.action}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sky-400 font-bold">{log.status}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Preview Area */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              ref={previewCardRef}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-slate-200">پیش‌نمایش زنده چارت و واترمارک</span>
                <span className="text-[11px] font-mono text-slate-400">مسیر ذخیره: {screenshotFolder}</span>
              </div>

              {watermarkedResult ? (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 p-2 flex items-center justify-center min-h-[320px]">
                  <img src={watermarkedResult} alt="Watermarked Preview" className="max-h-[420px] rounded-xl object-contain" />
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3 bg-slate-950/50 min-h-[320px] flex flex-col items-center justify-center">
                  <div className="bg-slate-900 p-4 rounded-full text-slate-500">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-300">تصویری انتخاب یا ثبت نشده است</h4>
                    <p className="text-xs text-slate-500 mt-1">جهت تست یا اعمال واترمارک، تصویر چارت را آپلود کنید یا دکمه اسکرین‌شات را بزنید</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: OFFICIAL REPORT DOCUMENTER */}
      {activeTab === 'report' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl print:bg-white print:text-slate-900">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full uppercase">
                گزارش رسمی عملکرد معاملاتی
              </span>
              <h3 className="text-xl font-black text-slate-100 mt-2">گزارش‌ساز جامع ژورنال معامله‌گری سهیل کشتکار</h3>
            </div>
            
            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-600/30"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ / خروجی PDF</span>
              </button>
            </div>
          </div>

          {/* Report Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block">کل معاملات</span>
              <span className="text-lg font-black text-slate-100 font-mono mt-1 block">{totalTradesCount}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block">معاملات موفق (TP)</span>
              <span className="text-lg font-black text-emerald-400 font-mono mt-1 block">{tpCount}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block">معاملات ناموفق (SL)</span>
              <span className="text-lg font-black text-rose-400 font-mono mt-1 block">{slCount}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block">وین ریت کل</span>
              <span className="text-lg font-black text-indigo-400 font-mono mt-1 block">{winRate}%</span>
            </div>
          </div>

          {/* Trade Table for Report */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-200">فهرست ریز معاملات ثبت‌شده در گزارش:</h4>
            {trades.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">هیچ معامله‌ای در سیستم ثبت نشده است.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">تاریخ / زمان</th>
                      <th className="p-3">نماد</th>
                      <th className="p-3">استراتژی</th>
                      <th className="p-3">جهت</th>
                      <th className="p-3">نتیجه</th>
                      <th className="p-3">ورود</th>
                      <th className="p-3">خروج / سود</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {trades.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-950/40">
                        <td className="p-3 text-slate-400">{t.date} ({t.time})</td>
                        <td className="p-3 font-bold text-slate-200">{t.symbol}</td>
                        <td className="p-3 text-sky-400 uppercase">{t.strategy}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.result === 'TP' ? 'bg-emerald-950 text-emerald-400' : t.result === 'SL' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {t.result}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{t.entryPrice}</td>
                        <td className="p-3 font-bold text-emerald-400">{t.pnl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: BATCH GALLERY */}
      {activeTab === 'batch' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-100">گالری اسکرین‌شات‌ها و تصاویر ثبت‌شده معاملات</h3>
              <p className="text-xs text-slate-400 mt-0.5">مشاهده و دانلود گروهی تمامی اسکرین‌شات‌های چارت ذخیره‌شده در آرشیو</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {trades.filter(t => t.chartImage).length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                هیچ اسکرین‌شاتی همراه با معاملات ثبت نشده است.
              </div>
            ) : (
              trades.filter(t => t.chartImage).map(t => (
                <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200">{t.symbol}</span>
                    <span className="text-sky-400 font-mono">{t.date}</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-40 flex items-center justify-center">
                    <img src={t.chartImage} alt="Trade Chart" className="h-full w-full object-cover" />
                  </div>
                  <a
                    href={t.chartImage}
                    download={`trade-${t.symbol}-${t.id}.png`}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold py-2 rounded-xl border border-slate-800 flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>دانلود تصویر</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
