import React from 'react';
import { TradeRecord, StrategyMode } from '../types';
import { BarChart2, Award, TrendingUp, TrendingDown, Target, CheckCircle2, XCircle } from 'lucide-react';

interface DashboardViewProps {
  allTrades: TradeRecord[];
  currentStrategy: StrategyMode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ allTrades }) => {
  const totalTrades = allTrades.length;
  const tpTrades = allTrades.filter(t => t.result === 'TP').length;
  const slTrades = allTrades.filter(t => t.result === 'SL').length;
  const winRate = totalTrades > 0 ? Math.round((tpTrades / totalTrades) * 100) : 0;

  const channelTrades = allTrades.filter(t => t.strategy === 'channel');
  const btbTrades = allTrades.filter(t => t.strategy === 'btb');
  const spikeTrades = allTrades.filter(t => t.strategy === 'spike');

  const getWinRate = (trades: TradeRecord[]) => {
    if (trades.length === 0) return 0;
    const tp = trades.filter(t => t.result === 'TP').length;
    return Math.round((tp / trades.length) * 100);
  };

  return (
    <div className="space-y-6 py-4" dir="rtl">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-bold block">کل معاملات ثبت‌شده</span>
            <span className="text-2xl font-mono font-black text-slate-100 mt-1 block">{totalTrades}</span>
          </div>
          <div className="bg-indigo-950 p-3 rounded-2xl text-indigo-400 border border-indigo-500/30">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-bold block">وین‌ریت کل (Win Rate)</span>
            <span className="text-2xl font-mono font-black text-emerald-400 mt-1 block">{winRate}%</span>
          </div>
          <div className="bg-emerald-950 p-3 rounded-2xl text-emerald-400 border border-emerald-500/30">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-bold block">موفق (Take Profit)</span>
            <span className="text-2xl font-mono font-black text-emerald-400 mt-1 block">{tpTrades}</span>
          </div>
          <div className="bg-emerald-950/80 p-3 rounded-2xl text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-bold block">حد زیان (Stop Loss)</span>
            <span className="text-2xl font-mono font-black text-rose-400 mt-1 block">{slTrades}</span>
          </div>
          <div className="bg-rose-950/80 p-3 rounded-2xl text-rose-400 border border-rose-500/30">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Breakdown by Strategy */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-slate-200 border-b border-slate-800 pb-3">
          تفکیک عملکرد استراتژی‌ها
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-emerald-400">کانال (Channel)</span>
              <span className="text-xs font-mono text-slate-400">{channelTrades.length} معامله</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getWinRate(channelTrades)}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">وین‌ریت:</span>
              <span className="font-bold text-emerald-400">{getWinRate(channelTrades)}%</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-indigo-400">BTB Strategy</span>
              <span className="text-xs font-mono text-slate-400">{btbTrades.length} معامله</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getWinRate(btbTrades)}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">وین‌ریت:</span>
              <span className="font-bold text-indigo-400">{getWinRate(btbTrades)}%</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-amber-400">اسپایک (Spike)</span>
              <span className="text-xs font-mono text-slate-400">{spikeTrades.length} معامله</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getWinRate(spikeTrades)}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">وین‌ریت:</span>
              <span className="font-bold text-amber-400">{getWinRate(spikeTrades)}%</span>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-slate-200 border-b border-slate-800 pb-3">
          آخرین معاملات ثبت‌شده
        </h3>

        {allTrades.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            هنوز معامله‌ای در سیستم ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-850">
                  <th className="pb-3 font-bold">تاریخ / زمان</th>
                  <th className="pb-3 font-bold">استراتژی</th>
                  <th className="pb-3 font-bold">نماد</th>
                  <th className="pb-3 font-bold">پوزیشن</th>
                  <th className="pb-3 font-bold">قیمت ورود</th>
                  <th className="pb-3 font-bold">قیمت خروج</th>
                  <th className="pb-3 font-bold">نتیجه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {allTrades.slice(0, 5).map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 font-mono text-slate-300">{trade.date} {trade.time}</td>
                    <td className="py-3 font-bold text-indigo-400 uppercase">{trade.strategy}</td>
                    <td className="py-3 font-bold text-slate-100">{trade.symbol}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-black text-[10px] ${
                        trade.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-200">{trade.entryPrice}</td>
                    <td className="py-3 font-mono text-slate-200">{trade.exitPrice}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-lg font-black font-mono text-xs ${
                        trade.result === 'TP' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        trade.result === 'SL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {trade.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
