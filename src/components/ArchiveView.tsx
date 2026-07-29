import React, { useState } from 'react';
import { TradeRecord, StrategyMode } from '../types';
import { exportTradesToCSV, deleteTradeRecord } from '../utils/storage';
import { FileSpreadsheet, Trash2, Search, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ArchiveViewProps {
  trades: TradeRecord[];
  onRefreshTrades: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ trades, onRefreshTrades }) => {
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const handleExportCSV = () => {
    exportTradesToCSV(filteredTrades, `Trading_Desk_Archive_${Date.now()}.csv`);
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

    </div>
  );
};
