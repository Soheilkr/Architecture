import React from 'react';
import { StrategyMode, ViewMode, TradeRecord } from '../types';
import { TrendingUp, Zap, Crosshair, ArrowLeft, ShieldCheck, Award, AlertTriangle, Play } from 'lucide-react';

interface WelcomeViewProps {
  currentStrategy: StrategyMode;
  setCurrentStrategy: (mode: StrategyMode) => void;
  setActiveView: (view: ViewMode) => void;
  channelTrades: TradeRecord[];
  btbTrades: TradeRecord[];
  spikeTrades: TradeRecord[];
  maxChannelTrades: number;
  maxBtbTrades: number;
  maxSpikeTrades: number;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  currentStrategy,
  setCurrentStrategy,
  setActiveView,
  channelTrades,
  btbTrades,
  spikeTrades,
  maxChannelTrades,
  maxBtbTrades,
  maxSpikeTrades
}) => {
  const getStats = (trades: TradeRecord[], maxLimit: number) => {
    const total = trades.length;
    const tp = trades.filter(t => t.result === 'TP').length;
    const sl = trades.filter(t => t.result === 'SL').length;
    const winRate = total > 0 ? Math.round((tp / total) * 100) : 0;
    const remaining = Math.max(0, maxLimit - total);
    return { total, tp, sl, winRate, remaining };
  };

  const channelStats = getStats(channelTrades, maxChannelTrades);
  const btbStats = getStats(btbTrades, maxBtbTrades);
  const spikeStats = getStats(spikeTrades, maxSpikeTrades);

  return (
    <div className="space-y-8 py-4" dir="rtl">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-full uppercase">
              Trading Desk Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-tight">
              خوش آمدید، معامله‌گر گرامی سهیل کشتکار
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              سیستم جامع انضباط معامله‌گری، کنترل هیجانات، مدیریت دقیق ریسک و ثبت ژورنال معاملات. استراتژی مورد نظر را انتخاب کرده و مراحل بررسی چک‌لیست را آغاز کنید.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveView('pre-trade-warning');
            }}
            className="bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-black px-6 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-xl shadow-red-950/50 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>شروع جلسه معامله جدید</span>
          </button>
        </div>
      </div>

      {/* Strategy Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Channel Strategy Card */}
        <div 
          onClick={() => setCurrentStrategy('channel')}
          className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentStrategy === 'channel'
              ? 'bg-slate-900 border-emerald-500/60 shadow-2xl shadow-emerald-950/30 ring-2 ring-emerald-500/30'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-500/30 text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                کانال و ترند
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-100">استراتژی کانال (Channel)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                معاملات در جهت روند کانال‌های صعودی و نزولی همراه با تاییدیه سطح معتبر.
              </p>
            </div>

            {/* Performance Stats */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-850 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">وین‌ریت امروز:</span>
                <span className="font-mono font-extrabold text-emerald-400">{channelStats.winRate}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">نتایج (TP / SL):</span>
                <span className="font-mono font-bold text-slate-200">
                  <span className="text-emerald-400">{channelStats.tp} TP</span> / <span className="text-rose-400">{channelStats.sl} SL</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-2">
                <span className="text-slate-400">ظرفیت باقی‌مانده:</span>
                <span className="font-mono font-extrabold text-indigo-400">
                  {channelStats.remaining} از {maxChannelTrades} معامله
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>انتخاب این استراتژی</span>
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>

        {/* BTB Strategy Card */}
        <div 
          onClick={() => setCurrentStrategy('btb')}
          className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentStrategy === 'btb'
              ? 'bg-slate-900 border-indigo-500/60 shadow-2xl shadow-indigo-950/30 ring-2 ring-indigo-500/30'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-indigo-950/80 p-3 rounded-2xl border border-indigo-500/30 text-indigo-400">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                Breakout To Build
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-100">استراتژی BTB (Breakout)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                شکست سطوح کلیدی همراه با پولبک اصلاحی و تاییدیه مومنتوم.
              </p>
            </div>

            {/* Performance Stats */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-850 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">وین‌ریت امروز:</span>
                <span className="font-mono font-extrabold text-indigo-400">{btbStats.winRate}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">نتایج (TP / SL):</span>
                <span className="font-mono font-bold text-slate-200">
                  <span className="text-emerald-400">{btbStats.tp} TP</span> / <span className="text-rose-400">{btbStats.sl} SL</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-2">
                <span className="text-slate-400">ظرفیت باقی‌مانده:</span>
                <span className="font-mono font-extrabold text-indigo-400">
                  {btbStats.remaining} از {maxBtbTrades} معامله
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-400">
            <span>انتخاب این استراتژی</span>
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>

        {/* Spike Strategy Card */}
        <div 
          onClick={() => setCurrentStrategy('spike')}
          className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentStrategy === 'spike'
              ? 'bg-slate-900 border-amber-500/60 shadow-2xl shadow-amber-950/30 ring-2 ring-amber-500/30'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-amber-950/80 p-3 rounded-2xl border border-amber-500/30 text-amber-400">
                <Crosshair className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
                Spike Momentum
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-100">استراتژی اسپایک (Spike)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ورود شتابی در فازهای مومنتوم شدید و کندل‌های پرقدرت تایم پایین.
              </p>
            </div>

            {/* Performance Stats */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-850 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">وین‌ریت امروز:</span>
                <span className="font-mono font-extrabold text-amber-400">{spikeStats.winRate}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">نتایج (TP / SL):</span>
                <span className="font-mono font-bold text-slate-200">
                  <span className="text-emerald-400">{spikeStats.tp} TP</span> / <span className="text-rose-400">{spikeStats.sl} SL</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-2">
                <span className="text-slate-400">ظرفیت باقی‌مانده:</span>
                <span className="font-mono font-extrabold text-indigo-400">
                  {spikeStats.remaining} از {maxSpikeTrades} معامله
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-amber-400">
            <span>انتخاب این استراتژی</span>
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Rules & Discipline Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex items-start gap-4">
          <div className="bg-emerald-950 p-3 rounded-2xl text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-200">قانون طلایی اول: حفظ انضباط معاملاتی</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              هرگز بدون چک کردن تمام بندهای استراتژی و بدون حد زیان مشخص وارد پوزیشن نشوید. مدیریت ریسک شرط اول بقا در بازار است.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex items-start gap-4">
          <div className="bg-amber-950 p-3 rounded-2xl text-amber-400 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-200">قانون طلایی دوم: مدیریت حد زیان روزانه</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              در صورت خوردن ۲ استپ‌لاس متوالی در یک روز، سیستم به‌صورت خودکار معاملاتی بعدی را تا روز بعد متوقف خواهد کرد.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
