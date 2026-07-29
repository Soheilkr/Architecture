import React, { useState, useRef } from 'react';
import { StrategyMode, StrategySettings, GlobalSettings } from '../types';
import { exportFullBackupJSON, importFullBackupJSON } from '../utils/storage';
import { Settings, Save, Download, Upload, Trash2, CheckCircle2, Shield, RefreshCw } from 'lucide-react';

interface SystemSettingsViewProps {
  currentStrategy: StrategyMode;
  strategySettings: StrategySettings;
  onSaveStrategySettings: (mode: StrategyMode, settings: StrategySettings) => void;
  globalSettings: GlobalSettings;
  onSaveGlobalSettings: (settings: GlobalSettings) => void;
  onRefreshData: () => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  currentStrategy,
  strategySettings,
  onSaveStrategySettings,
  globalSettings,
  onSaveGlobalSettings,
  onRefreshData
}) => {
  const [maxTrades, setMaxTrades] = useState(strategySettings.maxTradesPerDay);
  const [maxLosses, setMaxLosses] = useState(strategySettings.maxLossesPerDay);
  const [watermark, setWatermark] = useState(globalSettings.watermarkText);
  const [screenshotFolder, setScreenshotFolder] = useState(globalSettings.screenshotFolder || '');
  const [autoScreenshot, setAutoScreenshot] = useState(globalSettings.autoScreenshot ?? true);
  const [rules, setRules] = useState<string[]>(strategySettings.rules);
  const [newRule, setNewRule] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [tempFolder, setTempFolder] = useState(screenshotFolder);
  const [testScreenshotResult, setTestScreenshotResult] = useState<string | null>(null);
  const [testLogs, setTestLogs] = useState<Array<{ time: string; status: string; path: string }>>([
    { time: new Date().toLocaleTimeString('fa-IR'), status: 'آماده به کار', path: screenshotFolder || 'Downloads' }
  ]);

  const folderInputRef = useRef<HTMLInputElement>(null);

  // Re-sync local state when strategy or global settings prop updates
  React.useEffect(() => {
    setMaxTrades(strategySettings.maxTradesPerDay);
    setMaxLosses(strategySettings.maxLossesPerDay);
    setRules(strategySettings.rules);
  }, [currentStrategy, strategySettings]);

  React.useEffect(() => {
    setWatermark(globalSettings.watermarkText);
    setScreenshotFolder(globalSettings.screenshotFolder || '');
    setAutoScreenshot(globalSettings.autoScreenshot ?? true);
  }, [globalSettings]);

  const handleTestScreenshotCapture = async () => {
    if (window.electronAPI?.takeScreenshot) {
      try {
        const res = await window.electronAPI.takeScreenshot();
        let dataUrl: string | undefined;

        if (typeof res === 'string') {
          dataUrl = res;
        } else if (res && typeof res === 'object') {
          if (res.success && res.dataUrl) {
            dataUrl = res.dataUrl;
          } else if (res.error) {
            alert(`خطا در تهیه اسکرین‌شات:\n${res.error}`);
            return;
          }
        }

        if (dataUrl) {
          setTestScreenshotResult(dataUrl);
          const nowTime = new Date().toLocaleTimeString('fa-IR');
          setTestLogs(prev => [
            { time: nowTime, status: 'موفقیت‌آمیز (اسکرین‌شات دسکتاپ)', path: screenshotFolder || 'Downloads' },
            ...prev.slice(0, 4)
          ]);

          if (screenshotFolder && window.electronAPI?.saveScreenshot) {
            try {
              await window.electronAPI.saveScreenshot(dataUrl, screenshotFolder, `test-screenshot-${Date.now()}.png`);
            } catch (err) {
              console.error('Save screenshot error:', err);
            }
          }
          return;
        }
      } catch (err: any) {
        console.error('Electron test screenshot error:', err);
        const errorMsg = err?.message || (typeof err === 'string' ? err : 'خطای ناشناخته در برنامه دسکتاپ');
        alert(`خطا در تهیه اسکرین‌شات:\n${errorMsg}`);
        return;
      }
    }

    // Canvas simulation fallback for Web preview
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, 400);
      ctx.lineTo(150, 350);
      ctx.lineTo(250, 380);
      ctx.lineTo(350, 260);
      ctx.lineTo(450, 300);
      ctx.lineTo(550, 180);
      ctx.lineTo(650, 220);
      ctx.lineTo(750, 120);
      ctx.lineTo(850, 150);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(watermark || '@TradingSystem', 50, 460);

      const dataUrl = canvas.toDataURL('image/png');
      setTestScreenshotResult(dataUrl);

      const nowTime = new Date().toLocaleTimeString('fa-IR');
      setTestLogs(prev => [
        { time: nowTime, status: 'موفقیت‌آمیز (تست آنلاین)', path: screenshotFolder || 'Downloads' },
        ...prev.slice(0, 4)
      ]);
    }
  };

  const handleSave = () => {
    onSaveStrategySettings(currentStrategy, {
      ...strategySettings,
      maxTradesPerDay: Number(maxTrades),
      maxLossesPerDay: Number(maxLosses),
      rules
    });

    onSaveGlobalSettings({
      ...globalSettings,
      watermarkText: watermark,
      screenshotFolder,
      autoScreenshot
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSelectFolder = async () => {
    if (window.electronAPI?.selectFolder) {
      try {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
          setScreenshotFolder(folder);
          return;
        }
      } catch (err) {
        console.error('Electron selectFolder error:', err);
      }
    }

    // Open interactive folder selection modal immediately
    setTempFolder(screenshotFolder || 'Downloads/TradingScreenshots');
    setIsFolderModalOpen(true);
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules([...rules, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importFullBackupJSON(content)) {
          alert('پشتیبان‌گیری با موفقیت بازیابی شد.');
          onRefreshData();
        } else {
          alert('خطا در خواندن فایل پشتیبان.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4" dir="rtl">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-950 p-3 rounded-2xl border border-indigo-500/30 text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100">تنظیمات سیستم و استراتژی‌ها</h2>
            <p className="text-xs text-slate-400 mt-0.5">پیکربندی حد معاملات روزانه، قوانین و واترمارک branding</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره تغییرات</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>تنظیمات سیستم با موفقیت ذخیره شد.</span>
        </div>
      )}

      {/* Global Settings & Screenshot Monitor */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <h3 className="text-xs font-black text-slate-200 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          تنظیمات عمومی، برندینگ و مانیتور اسکرین‌شات
        </h3>

        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-bold">متن واترمارک بر روی تصویر چارت</label>
          <input
            type="text"
            value={watermark}
            onChange={(e) => setWatermark(e.target.value)}
            placeholder="@Soheil_Keshtkar"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-right"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 space-y-3">
          <label className="text-xs text-slate-400 block font-bold">پوشه ذخیره اسکرین‌شات‌ها (Screenshot Folder)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={screenshotFolder}
              onChange={(e) => setScreenshotFolder(e.target.value)}
              placeholder="مسیر یا نام پوشه (مثلاً C:/TradingScreenshots یا Downloads)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleSelectFolder}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors shrink-0 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              انتخاب پوشه...
            </button>
            <input
              type="file"
              ref={folderInputRef}
              // @ts-ignore
              webkitdirectory=""
              directory=""
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  // @ts-ignore
                  const relPath = file.webkitRelativePath || file.name;
                  const folderName = relPath.split('/')[0] || relPath;
                  if (folderName) {
                    setScreenshotFolder(folderName);
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800 pt-3">
          <div>
            <span className="text-xs font-bold text-slate-200 block">اسکرین‌شات خودکار (Auto Screenshot)</span>
            <span className="text-[11px] text-slate-400">ذخیره خودکار تصویر اسکرین‌شات در پوشه تعیین‌شده هنگام ثبت معامله</span>
          </div>
          <input
            type="checkbox"
            checked={autoScreenshot}
            onChange={(e) => setAutoScreenshot(e.target.checked)}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        {/* Screenshot Test & Monitor Suite */}
        <div className="pt-4 border-t border-slate-800 space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                مانیتور تست اسکرین‌شات (Screenshot Test Monitor)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">تست فوری گرفتن اسکرین‌شات چارت و شبیه‌سازی ذخیره‌سازی در پوشه تعیین‌شده</p>
            </div>
            <button
              type="button"
              onClick={handleTestScreenshotCapture}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>📷 تست گرفتن اسکرین‌شات</span>
            </button>
          </div>

          {testScreenshotResult && (
            <div className="space-y-3 pt-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400">تصویر نمونه تست‌شده با واترمارک:</span>
                <a
                  href={testScreenshotResult}
                  download={`test-trade-${Date.now()}.png`}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline"
                >
                  دانلود تصویر تست
                </a>
              </div>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 max-h-48 flex items-center justify-center p-2">
                <img src={testScreenshotResult} alt="Test Screenshot" className="max-h-40 rounded object-contain" />
              </div>
            </div>
          )}

          {/* Test Logs Activity */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">تاریخچه تست‌های مانیتور:</span>
            <div className="space-y-1">
              {testLogs.map((log, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span className="text-slate-200 font-mono">مسیر: {log.path}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">{log.status}</span>
                    <span className="text-slate-500 font-mono">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Strategy Specific Settings */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-black text-slate-200">
            حدود مدیریت ریسک استراتژی فعلی: <span className="text-indigo-400 uppercase">{currentStrategy}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-bold">حداکثر تعداد معامله در روز</label>
            <input
              type="number"
              value={maxTrades}
              onChange={(e) => setMaxTrades(Number(e.target.value))}
              min={1}
              max={20}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 font-mono text-center focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-bold">حداکثر حد زیان مجاز در روز (SL)</label>
            <input
              type="number"
              value={maxLosses}
              onChange={(e) => setMaxLosses(Number(e.target.value))}
              min={1}
              max={10}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 font-mono text-center focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Edit Rules */}
        <div className="space-y-3 pt-2">
          <label className="text-xs text-slate-400 block font-bold">ویرایش بندهای قوانین الزامی این استراتژی</label>
          
          <div className="space-y-2">
            {rules.map((rule, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-200">
                <span className="leading-relaxed">{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="افزودن بند قانون جدید..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddRule}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              افزودن
            </button>
          </div>
        </div>

      </div>

      {/* Backup & Restore */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-slate-200">پشتیبان‌گیری و بازیابی داده‌های سیستم</h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportFullBackupJSON}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>دانلود فایل بکاپ JSON</span>
          </button>

          <label className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>بازیابی فایل بکاپ</span>
            <input type="file" onChange={handleFileImport} accept=".json" className="hidden" />
          </label>
        </div>
      </div>

      {/* Folder Selection Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                انتخاب پوشه ذخیره اسکرین‌شات
              </h3>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              نام یا مسیر پوشه مورد نظر خود را وارد کنید یا یکی از گزینه‌های پیش‌فرض زیر را انتخاب نمایید:
            </p>

            <div className="flex flex-wrap gap-2">
              {['Downloads', 'Desktop', 'C:\\TradingScreenshots', 'Pictures/Trading'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTempFolder(preset)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                    tempFolder === preset
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-bold">مسیر سفارشی:</label>
              <input
                type="text"
                value={tempFolder}
                onChange={(e) => setTempFolder(e.target.value)}
                placeholder="مثلاً Downloads یا C:/TradingScreenshots"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempFolder.trim()) {
                    setScreenshotFolder(tempFolder.trim());
                  }
                  setIsFolderModalOpen(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
              >
                تایید و انتخاب
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
