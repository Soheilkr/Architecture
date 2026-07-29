import React, { useState } from 'react';
import { TradeRecord, StrategyMode, GlobalSettings } from '../types';
import { exportTradesToCSV, deleteTradeRecord } from '../utils/storage';
import { FileSpreadsheet, Trash2, Search, Filter, Download, FolderOpen, Check } from 'lucide-react';

interface ArchiveViewProps {
  trades: TradeRecord[];
  onRefreshTrades: () => void;
  globalSettings?: GlobalSettings;
  onSaveGlobalSettings?: (settings: GlobalSettings) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ trades, onRefreshTrades, globalSettings, onSaveGlobalSettings }) => {
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [archiveFolder, setArchiveFolder] = useState<string>(globalSettings?.screenshotFolder || 'Downloads/TradingArchive');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [tempFolder, setTempFolder] = useState<string>('Downloads/TradingArchive');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const filteredTrades = trades.filter(t => {
    const matchesStrategy = filterStrategy === 'all' || t.strategy === filterStrategy;
    const matchesSearch = t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStrategy && matchesSearch;
  });

  const handleDelete = (id: string, strategy: StrategyMode) => {
    if (window.confirm('آیا از حذف این معامله از آرشیو اطمینان دارید؟')) {
      deleteTradeRecord(id, strategy);
      onRefreshTrades();
    }
  };

  const archiveFolderInputRef = React.useRef<HTMLInputElement>(null);

  const handleSelectFolder = async () => {
    if (typeof window !== 'undefined' && window.electronAPI?.selectFolder) {
      try {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
          setArchiveFolder(folder);
          if (globalSettings && onSaveGlobalSettings) {
            onSaveGlobalSettings({
              ...globalSettings,
              screenshotFolder: folder
            });
          }
          return;
        }
      } catch (err) {
        console.error('Electron selectFolder error:', err);
      }
    }

    if (archiveFolderInputRef.current) {
      archiveFolderInputRef.current.click();
      return;
    }

    setTempFolder(archiveFolder || 'Downloads/TradingArchive');
    setIsFolderModalOpen(true);
  };

  const handleExportCSV = () => {
    exportTradesToCSV(filteredTrades, `Trading_Desk_Archive_${Date.now()}.csv`);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const totalTrades = filteredTrades.length;
  const tpTrades = filteredTrades.filter(t => t.result === 'TP').length;
  const winRate = totalTrades > 0 ? Math.round((tpTrades / totalTrades) * 100) : 0;

  return (
    <div className="space-y-6 py-4" dir="rtl">
      
      {/* Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 p-3 rounded-2xl border border-emerald-500/30 text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100">آرشیو و گزارشات معاملات سهیل کشتکار</h2>
            <p className="text-xs text-slate-400 mt-0.5">مشاهده تاریخچه کامل، فیلترها و خروجی اکسل/CSV</p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>دانلود خروجی اکسل / CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Strategy Filter */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="all">همه استراتژی‌ها</option>
            <option value="channel">کانال (Channel)</option>
            <option value="btb">استراتژی BTB</option>
            <option value="spike">اسپایک (Spike)</option>
          </select>
        </div>

        {/* Search */}
        <div className="sm:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو براساس نماد یا یادداشت معامله..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none placeholder:text-slate-600"
          />
        </div>

      </div>

      {/* Archive Folder Selection Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <FolderOpen className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-200 block">پوشه ذخیره خروجی‌ها (Export Folder)</span>
            <span className="text-[11px] text-slate-400 font-mono">{archiveFolder}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleSelectFolder}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>انتخاب پوشه...</span>
          </button>
          <input
            type="file"
            ref={archiveFolderInputRef}
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
                  setArchiveFolder(folderName);
                  if (globalSettings && onSaveGlobalSettings) {
                    onSaveGlobalSettings({
                      ...globalSettings,
                      screenshotFolder: folderName
                    });
                  }
                }
              }
            }}
          />
          
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
          >
            {exportSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{exportSuccess ? 'ذخیره شد!' : 'خروجی اکسل / CSV'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-bold">تعداد کل فیلتر شده</span>
          <span className="text-xl font-mono font-black text-slate-100 mt-1 block">{totalTrades}</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-bold">وین‌ریت (Win Rate)</span>
          <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">{winRate}%</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-bold">تعداد TPها</span>
          <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">{tpTrades}</span>
        </div>
      </div>

      {/* Trades Grid */}
      {filteredTrades.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
          <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-sm font-bold text-slate-400">هیچ معامله‌ای در آرشیو ثبت نشده است.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrades.map((trade) => (
            <div 
              key={trade.id} 
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl font-mono font-black text-xs ${
                    trade.result === 'TP' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    trade.result === 'SL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {trade.result}
                  </span>

                  <span className="font-bold text-slate-100 text-sm">{trade.symbol}</span>

                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    trade.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {trade.direction}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(trade.id, trade.strategy)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="حذف معامله"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Price Details */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">ورود</span>
                  <span className="text-slate-200 font-bold">{trade.entryPrice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">خروج</span>
                  <span className="text-slate-200 font-bold">{trade.exitPrice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">PnL</span>
                  <span className={`font-bold ${trade.result === 'TP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.pnl}
                  </span>
                </div>
              </div>

              {/* Chart Thumbnail if available */}
              {trade.chartImage && (
                <div className="rounded-2xl overflow-hidden border border-slate-850 h-32 bg-slate-950">
                  <img src={trade.chartImage} alt="Chart" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Date & Strategy */}
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>استراتژی: <strong className="text-indigo-400 uppercase">{trade.strategy}</strong></span>
                <span className="font-mono">{trade.date} {trade.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Folder Selection Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                انتخاب پوشه ذخیره خروجی‌ها
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
              {['Downloads', 'Desktop', 'C:\\TradingArchive', 'Pictures/Trading'].map((preset) => (
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
                placeholder="مثلاً Downloads یا C:/TradingArchive"
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
                    const newFolder = tempFolder.trim();
                    setArchiveFolder(newFolder);
                    if (globalSettings && onSaveGlobalSettings) {
                      onSaveGlobalSettings({
                        ...globalSettings,
                        screenshotFolder: newFolder
                      });
                    }
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
